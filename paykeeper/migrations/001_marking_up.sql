-- ============================================================================
-- Миграция 001 — маркировка «Честный ЗНАК» (UP: построить)
-- База: PostgreSQL (нужна из-за атомарного захвата кода FOR UPDATE SKIP LOCKED).
-- Все таблицы создаём "если ещё нет" — миграцию безопасно запустить повторно.
-- ============================================================================

-- ── Таблица 1. marking_codes — «склад ярлычков» ─────────────────────────────
-- Один ряд = один код Data Matrix (индивидуальный паспорт одной пачки товара).
CREATE TABLE IF NOT EXISTS marking_codes (
  id             BIGSERIAL PRIMARY KEY,
  code           TEXT NOT NULL,                 -- код как строка (без непечатаемых символов)
  code_b64       TEXT,                          -- вариант с разделителями 0x1d в base64 (если есть)
  sku            TEXT NOT NULL,                 -- к какому товару относится (id из каталога сайта)
  item_type      TEXT NOT NULL DEFAULT 'goods_coded',  -- признак предмета расчёта для чека
  status         TEXT NOT NULL DEFAULT 'free',  -- статус ярлычка (см. CHECK ниже)
  order_id       BIGINT,                        -- под какой заказ зарезервирован/продан
  order_item_id  BIGINT,                        -- под какую позицию заказа
  reserved_until TIMESTAMPTZ,                   -- до какого времени держится бронь (TTL)
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- статусы: free=свободен, reserved=зарезервирован, sold=продан, void=аннулирован
  CONSTRAINT chk_marking_status CHECK (status IN ('free','reserved','sold','void'))
);

-- Один и тот же код нельзя завести дважды — физическая защита от дублей.
CREATE UNIQUE INDEX IF NOT EXISTS ux_marking_codes_code ON marking_codes (code);
-- Быстрый поиск «дай свободный код для товара X».
CREATE INDEX IF NOT EXISTS ix_marking_codes_sku_status ON marking_codes (sku, status);
-- Быстрый поиск просроченных броней для фоновой очистки (TTL).
CREATE INDEX IF NOT EXISTS ix_marking_codes_reserved_until
  ON marking_codes (reserved_until) WHERE status = 'reserved';


-- ── Таблица 2. orders — «тетрадка заказов» ──────────────────────────────────
-- Раньше сервер заказы не запоминал. Теперь запоминаем: оплата приходит позже
-- (webhook), и без этой тетрадки после оплаты не найти, чьи коды закрывать.
CREATE TABLE IF NOT EXISTS orders (
  id            BIGSERIAL PRIMARY KEY,
  external_id   TEXT NOT NULL,                  -- наш номер заказа (тот, что уходит в PayKeeper)
  pk_invoice_id TEXT,                           -- id платежа/счёта на стороне PayKeeper
  status        TEXT NOT NULL DEFAULT 'new',    -- new / pending / paid / canceled
  amount        NUMERIC(12,2) NOT NULL,         -- сумма заказа (для сверки с суммой позиций)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at       TIMESTAMPTZ,
  CONSTRAINT chk_orders_status CHECK (status IN ('new','pending','paid','canceled'))
);

-- Номер заказа уникален — защита от случайного задвоения заказа.
CREATE UNIQUE INDEX IF NOT EXISTS ux_orders_external ON orders (external_id);
-- id платежа PayKeeper уникален — фундамент идемпотентного webhook (см. блок 5).
CREATE UNIQUE INDEX IF NOT EXISTS ux_orders_pk_invoice
  ON orders (pk_invoice_id) WHERE pk_invoice_id IS NOT NULL;


-- ── Таблица 3. order_items — позиции заказа ─────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id        BIGSERIAL PRIMARY KEY,
  order_id  BIGINT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  sku       TEXT NOT NULL,                      -- id товара из каталога
  name      TEXT NOT NULL,
  qty       INT  NOT NULL,
  price     NUMERIC(12,2) NOT NULL,             -- цена за единицу
  marked    BOOLEAN NOT NULL DEFAULT false,     -- этой позиции нужны коды маркировки?
  CONSTRAINT chk_order_items_qty CHECK (qty > 0)
);

CREATE INDEX IF NOT EXISTS ix_order_items_order ON order_items (order_id);


-- ── Таблица 4. marking_code_log — «журнал охраны» ───────────────────────────
-- Каждое изменение статуса кода пишется сюда В ТОЙ ЖЕ транзакции, что и само
-- изменение — чтобы не было «сделали, а записать забыли».
CREATE TABLE IF NOT EXISTS marking_code_log (
  id          BIGSERIAL PRIMARY KEY,
  code_id     BIGINT NOT NULL REFERENCES marking_codes (id) ON DELETE CASCADE,
  old_status  TEXT,                             -- статус до изменения (NULL при заведении)
  new_status  TEXT NOT NULL,                    -- статус после изменения
  actor       TEXT NOT NULL,                    -- кто изменил: checkout / webhook / ttl-job / admin-import / annul
  reason      TEXT,                             -- пояснение (например, номер заказа или причина брака)
  order_id    BIGINT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_marking_code_log_code ON marking_code_log (code_id);
