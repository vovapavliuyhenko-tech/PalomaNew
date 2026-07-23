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
  logCode,
  RESERVE_TTL_MIN,
};
