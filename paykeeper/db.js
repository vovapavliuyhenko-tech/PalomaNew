/* ════════════════════════════════════════════════════════
   db.js — подключение к базе PostgreSQL (Neon).
   Строка подключения лежит в переменной окружения DATABASE_URL
   (её ты вставляешь в настройках функции, в код она не попадает).

   Важно про «облачную функцию»: она может запускаться во множестве
   копий сразу. Поэтому пул держим маленький и переиспользуем между
   «тёплыми» запусками одной копии.
   ════════════════════════════════════════════════════════ */
"use strict";

const { Pool } = require("pg");

let pool = null;

// Возвращает пул соединений (создаёт один раз на «тёплую» копию функции).
function getPool() {
  if (pool) return pool;
  const cs = process.env.DATABASE_URL;
  if (!cs) throw new Error("Не задана переменная окружения DATABASE_URL");
  pool = new Pool({
    connectionString: cs,
    max: 3,                       // не больше 3 соединений на копию функции
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }, // Neon работает только по SSL
  });
  return pool;
}

// Выполнить набор запросов как ОДНО целое (транзакция): либо всё, либо ничего.
// fn получает клиента; если внутри выброшена ошибка — делаем ROLLBACK (откат).
async function withTx(fn) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const res = await fn(client);
    await client.query("COMMIT");
    return res;
  } catch (e) {
    try { await client.query("ROLLBACK"); } catch (_) {}
    throw e;
  } finally {
    client.release();
  }
}

// Простой запрос вне транзакции.
async function query(text, params) {
  return getPool().query(text, params);
}

module.exports = { getPool, withTx, query };
