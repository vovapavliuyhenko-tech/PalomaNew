/* ════════════════════════════════════════════════════════
   marking.js — вся логика «склада ярлычков» (кодов маркировки).

   Главная задача — НИКОГДА не продать один код дважды. Для этого
   резерв кода делается атомарно, с блокировкой строки в базе:
   два одновременных заказа физически возьмут РАЗНЫЕ коды.
   ════════════════════════════════════════════════════════ */
"use strict";

const fs = require("fs");
const path = require("path");
const { withTx, query } = require("./db");

// Сколько минут держим код за неоплаченным заказом (потом бронь «сгорает»).
const RESERVE_TTL_MIN = Number(process.env.RESERVE_TTL_MIN || 30);

// ── Журнал: пишем каждое изменение статуса В ТОЙ ЖЕ транзакции ──────────────
async function logCode(client, codeId, oldStatus, newStatus, actor, reason, orderId) {
  await client.query(
    `INSERT INTO marking_code_log
       (code_id, old_status, new_status, actor, reason, order_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [codeId, oldStatus, newStatus, actor, reason || null, orderId || null],
  );
}

// ── ГЛАВНЫЙ «ЗАМОК»: захватить один свободный код под товар sku ─────────────
// Работает ВНУТРИ уже открытой транзакции (client приходит снаружи).
// SKIP LOCKED = «возьми первый свободный, а те, что уже кто-то запирает, пропусти».
async function reserveOne(client, sku, orderId, orderItemId, actor = "checkout") {
  const sel = await client.query(
    `SELECT id, code, code_b64, item_type
       FROM marking_codes
      WHERE sku = $1 AND status = 'free'
      ORDER BY id
      LIMIT 1
      FOR UPDATE SKIP LOCKED`,
    [sku],
  );

  if (sel.rowCount === 0) {
    // Свободных кодов для этого товара нет — заказ маркированного товара нельзя провести.
    const e = new Error("NO_FREE_CODE:" + sku);
    e.code = "NO_FREE_CODE";
    e.sku = sku;
    throw e;
  }

  const row = sel.rows[0];
  await client.query(
    `UPDATE marking_codes
        SET status = 'reserved',
            order_id = $2,
            order_item_id = $3,
            reserved_until = now() + make_interval(mins => $4),
            updated_at = now()
      WHERE id = $1`,
    [row.id, orderId, orderItemId, RESERVE_TTL_MIN],
  );
  await logCode(client, row.id, "free", "reserved", actor, "order " + orderId, orderId);
  return row; // { id, code, code_b64, item_type }
}

// Захватить сразу N кодов под одну позицию заказа (например, 3 пачки конфет).
async function reserveMany(client, sku, qty, orderId, orderItemId) {
  const codes = [];
  for (let i = 0; i < qty; i++) {
    codes.push(await reserveOne(client, sku, orderId, orderItemId));
  }
  return codes;
}

// ── После оплаты: перевести коды заказа в «продан». Идемпотентно ────────────
// (повторный вызов по тому же заказу уже проданные коды не трогает).
async function markOrderSold(client, orderId, actor = "webhook") {
  const rows = (await client.query(
    `SELECT id, status FROM marking_codes
      WHERE order_id = $1 AND status IN ('reserved', 'sold')
      FOR UPDATE`,
    [orderId],
  )).rows;

  let changed = 0;
  for (const r of rows) {
    if (r.status === "sold") continue; // уже продан — пропускаем (защита от двойного webhook)
    await client.query(
      `UPDATE marking_codes
          SET status = 'sold', reserved_until = NULL, updated_at = now()
        WHERE id = $1`,
      [r.id],
    );
    await logCode(client, r.id, "reserved", "sold", actor, "paid order " + orderId, orderId);
    changed++;
  }
  return changed;
}

// ── Аннулирование одного кода (возврат/брак) — конечный статус ──────────────
async function voidCode(client, codeId, reason, actor = "annul") {
  const cur = (await client.query(
    `SELECT status FROM marking_codes WHERE id = $1 FOR UPDATE`,
    [codeId],
  )).rows[0];
  if (!cur) throw new Error("Код не найден: " + codeId);
  await client.query(
    `UPDATE marking_codes SET status = 'void', reserved_until = NULL, updated_at = now() WHERE id = $1`,
    [codeId],
  );
  await logCode(client, codeId, cur.status, "void", actor, reason || null, null);
}

// ── Фоновая задача (по таймеру): вернуть «зависшие» брони в «свободен» ───────
async function releaseExpired() {
  return withTx(async (client) => {
    const rows = (await client.query(
      `SELECT id FROM marking_codes
        WHERE status = 'reserved'
          AND reserved_until IS NOT NULL
          AND reserved_until < now()
        FOR UPDATE SKIP LOCKED`,
    )).rows;

    for (const r of rows) {
      await client.query(
        `UPDATE marking_codes
            SET status = 'free', order_id = NULL, order_item_id = NULL,
                reserved_until = NULL, updated_at = now()
          WHERE id = $1`,
        [r.id],
      );
      await logCode(client, r.id, "reserved", "free", "ttl-job", "reservation expired", null);
    }
    return rows.length;
  });
}

// ── Оформление: создать заказ и забронировать коды под маркированные позиции ─
// lines: [{ sku, name, qty, price, marked }]. Всё в ОДНОЙ транзакции:
// если под какой-то товар не хватило свободных кодов — откатывается целиком
// (заказ не создаётся, брони не остаются). Повторный вызов того же заказа
// (двойной клик «Оплатить») не бронирует заново — отдаёт уже выданные коды.
async function createOrderWithReservations(externalId, amount, lines) {
  return withTx(async (client) => {
    const existing = (await client.query(
      `SELECT id FROM orders WHERE external_id = $1 FOR UPDATE`,
      [externalId],
    )).rows[0];

    if (existing) {
      // Заказ уже есть — переиспользуем ранее выданные коды (идемпотентность).
      const codes = (await client.query(
        `SELECT id, code, code_b64, item_type, sku, order_item_id
           FROM marking_codes
          WHERE order_id = $1 AND status IN ('reserved', 'sold')
          ORDER BY id`,
        [existing.id],
      )).rows;
      return { orderId: existing.id, reused: true, codes };
    }

    const ord = (await client.query(
      `INSERT INTO orders (external_id, amount, status) VALUES ($1, $2, 'new') RETURNING id`,
      [externalId, amount],
    )).rows[0];

    const codes = [];
    for (const ln of lines) {
      const oi = (await client.query(
        `INSERT INTO order_items (order_id, sku, name, qty, price, marked)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [ord.id, ln.sku, ln.name, ln.qty, ln.price, !!ln.marked],
      )).rows[0];

      if (ln.marked) {
        const got = await reserveMany(client, ln.sku, ln.qty, ord.id, oi.id);
        got.forEach((g) => codes.push({ ...g, sku: ln.sku, order_item_id: oi.id }));
      }
    }
    return { orderId: ord.id, reused: false, codes };
  });
}

// Записать id счёта PayKeeper на заказ и пометить «ожидает оплаты».
async function attachInvoice(externalId, pkInvoiceId) {
  await query(
    `UPDATE orders SET pk_invoice_id = $2, status = 'pending' WHERE external_id = $1`,
    [externalId, pkInvoiceId],
  );
}

// Оплата не состоялась / PayKeeper отказал — вернуть брони в «свободен».
async function cancelOrderRelease(externalId, reason) {
  return withTx(async (client) => {
    const ord = (await client.query(
      `SELECT id FROM orders WHERE external_id = $1 FOR UPDATE`,
      [externalId],
    )).rows[0];
    if (!ord) return 0;

    const rows = (await client.query(
      `SELECT id FROM marking_codes WHERE order_id = $1 AND status = 'reserved' FOR UPDATE`,
      [ord.id],
    )).rows;
    for (const r of rows) {
      await client.query(
        `UPDATE marking_codes
            SET status = 'free', order_id = NULL, order_item_id = NULL,
                reserved_until = NULL, updated_at = now()
          WHERE id = $1`,
        [r.id],
      );
      await logCode(client, r.id, "reserved", "free", "checkout", reason || "payment failed", ord.id);
    }
    await client.query(`UPDATE orders SET status = 'canceled' WHERE id = $1`, [ord.id]);
    return rows.length;
  });
}

// Оплата прошла (webhook) — найти заказ по номеру и перевести коды в «продан».
async function markPaidByExternalId(externalId) {
  return withTx(async (client) => {
    const ord = (await client.query(
      `SELECT id, status FROM orders WHERE external_id = $1 FOR UPDATE`,
      [externalId],
    )).rows[0];
    if (!ord) return { found: false, sold: 0 };
    // Идемпотентность: если уже оплачен — просто выходим, второй раз не продаём.
    if (ord.status === "paid") return { found: true, alreadyPaid: true, sold: 0 };

    const sold = await markOrderSold(client, ord.id, "webhook");
    await client.query(
      `UPDATE orders SET status = 'paid', paid_at = now() WHERE id = $1`,
      [ord.id],
    );
    return { found: true, sold };
  });
}

// ── Импорт кодов на склад (админка) ────────────────────────────────────────
// sku — товар, codes — массив строк. Дубликаты тихо пропускаем (уникальный код).
// Возвращает сколько добавлено / пропущено.
async function importCodes(sku, codes, itemType = "goods_coded") {
  if (!sku) throw new Error("Не указан товар (SKU)");
  // убираем пустые строки и повторы внутри самой загрузки
  const clean = [...new Set((codes || []).map((c) => String(c).trim()).filter(Boolean))];
  if (clean.length === 0) throw new Error("Список кодов пуст");

  let added = 0;
  await withTx(async (client) => {
    for (const code of clean) {
      const r = await client.query(
        `INSERT INTO marking_codes (code, sku, item_type, status)
         VALUES ($1, $2, $3, 'free')
         ON CONFLICT (code) DO NOTHING
         RETURNING id`,
        [code, sku, itemType],
      );
      if (r.rowCount > 0) {
        await logCode(client, r.rows[0].id, null, "free", "admin-import", "import for " + sku, null);
        added++;
      }
    }
  });
  return { total: clean.length, added, skipped: clean.length - added };
}

// Остатки по складу: сколько кодов в каком статусе (можно по одному товару).
async function codesStats(sku) {
  const params = [];
  const where = sku ? "WHERE sku = $1" : "";
  if (sku) params.push(sku);
  const rows = (await query(
    `SELECT sku, status, count(*)::int AS n
       FROM marking_codes ${where}
      GROUP BY sku, status
      ORDER BY sku, status`,
    params,
  )).rows;
  return rows;
}

// ── Аннулировать код по его строке (возврат/брак) из админки ────────────────
async function voidByCode(codeString, reason) {
  const code = String(codeString || "").trim();
  if (!code) throw new Error("Не указан код");
  return withTx(async (client) => {
    const row = (await client.query(
      `SELECT id, status FROM marking_codes WHERE code = $1 FOR UPDATE`,
      [code],
    )).rows[0];
    if (!row) return { found: false };
    if (row.status === "void") return { found: true, already: true };
    await client.query(
      `UPDATE marking_codes SET status = 'void', reserved_until = NULL, updated_at = now() WHERE id = $1`,
      [row.id],
    );
    await logCode(client, row.id, row.status, "void", "annul", reason || null, null);
    return { found: true, from: row.status };
  });
}

// ── САМОПРОВЕРКА: доказать, что один код не продаётся дважды ─────────────────
// Заливаем N тестовых кодов и запускаем M одновременных броней (M > N).
// Ждём: выдано ровно N, все разные, лишние M−N честно отклонены. Потом чистим.
async function selfTest() {
  const sku = "selftest-" + Date.now();
  const N = 10; // кодов на складе
  const M = 25; // одновременных попыток захвата (больше, чем кодов)

  const codes = [];
  for (let i = 0; i < N; i++) codes.push(sku + "-code-" + i);
  await importCodes(sku, codes);

  const results = await Promise.allSettled(
    Array.from({ length: M }, (_, i) =>
      withTx((c) => reserveOne(c, sku, 900000 + i, null, "selftest")),
    ),
  );

  const got = results.filter((r) => r.status === "fulfilled").map((r) => r.value.code);
  const rejected = results.filter((r) => r.status === "rejected").length;
  const distinct = new Set(got).size;

  const checks = {
    "выдано ровно N кодов": got.length === N,
    "все выданные коды разные": distinct === got.length,
    "лишние попытки отклонены": rejected === M - N,
  };
  const pass = Object.values(checks).every(Boolean);

  // чистим тестовые данные (журнал удалится каскадом по внешнему ключу)
  await query(`DELETE FROM marking_codes WHERE sku = $1`, [sku]);

  return { codesOnShelf: N, concurrentTries: M, reserved: got.length, distinct, rejected, pass, checks };
}

// ── «Построить склад»: прогнать миграции (файлы *_up.sql). Безопасно повторять ─
async function runMigrations() {
  const dir = path.join(__dirname, "migrations");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith("_up.sql")).sort();
  const done = [];
  for (const f of files) {
    const sql = fs.readFileSync(path.join(dir, f), "utf8");
    await query(sql); // внутри стоят IF NOT EXISTS — повтор не ломает
    done.push(f);
  }
  return done;
}

module.exports = {
  reserveOne,
  reserveMany,
  markOrderSold,
  voidCode,
  releaseExpired,
  runMigrations,
  importCodes,
  codesStats,
  createOrderWithReservations,
  attachInvoice,
  cancelOrderRelease,
  markPaidByExternalId,
  voidByCode,
  selfTest,
  logCode,
  RESERVE_TTL_MIN,
};
