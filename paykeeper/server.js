/* ════════════════════════════════════════════════════════
   server.js — та же функция paloma-pay, но как обычный Node-сервер.

   Зачем: 11.10.2026 Яндекс Облако несколько дней лежит (атаки на
   дата-центры). База (Neon) живёт отдельно, поэтому сервер можно
   поднять на любом хостинге — и вернутся оплата, заказы в бот,
   CRM и админ-панель каталога.

   Запуск:  node server.js          (порт — из PORT, по умолчанию 3000)
   Переменные окружения — те же, что у функции в Яндексе:
     PK_USER, PK_PASSWORD, PK_SECRET, PK_SERVER, PK_SITE,
     TG_BOT_TOKEN, TG_CHAT_ID, TG_API_BASE, DATABASE_URL, ADMIN_TOKEN
   Таймер сверки оплат (как триггер в Яндексе) — встроен: раз в 5 минут.
   ════════════════════════════════════════════════════════ */
"use strict";

const http = require("http");
const { handler } = require("./index.js");

const PORT = Number(process.env.PORT) || 3000;
const MAX_BODY = 8 * 1024 * 1024; /* фото товара из админки — до ~2 МБ в base64 */

function toEvent(req, body) {
  const url = new URL(req.url, "http://localhost");
  const qs = {};
  url.searchParams.forEach((v, k) => { qs[k] = v; });
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) headers[k] = Array.isArray(v) ? v.join(",") : v;
  /* реальный адрес клиента за прокси хостинга — для лимитов частоты */
  const ip = String(headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  return {
    httpMethod: req.method,
    queryStringParameters: qs,
    headers,
    body: body.toString("utf8"),
    isBase64Encoded: false,
    requestContext: { identity: { sourceIp: ip } },
  };
}

http.createServer((req, res) => {
  const chunks = [];
  let size = 0;
  req.on("data", (c) => {
    size += c.length;
    if (size > MAX_BODY) { res.writeHead(413); res.end("Too large"); req.destroy(); return; }
    chunks.push(c);
  });
  req.on("end", async () => {
    if (res.writableEnded) return;
    try {
      const out = (await handler(toEvent(req, Buffer.concat(chunks)))) || {};
      const body = out.isBase64Encoded ? Buffer.from(out.body || "", "base64") : String(out.body == null ? "" : out.body);
      res.writeHead(out.statusCode || 200, out.headers || {});
      res.end(body);
    } catch (e) {
      console.error("[server] handler error", e && e.stack);
      res.writeHead(500, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "https://paloma.website" });
      res.end(JSON.stringify({ error: "Внутренняя ошибка сервера" }));
    }
  });
}).listen(PORT, () => console.log("[server] paloma-pay слушает порт", PORT));

/* Новые товары, присланные без админки (см. new-products.js):
   добавляем только отсутствующие, существующие не трогаем.
   Здесь же — разовые скрытия товаров. */
(async function addNewProducts() {
  try {
    const products = require("./products.js");
    const { query } = require("./db.js");
    await products.ensureTable();
    for (const p of require("./new-products.js")) {
      const r = await query("SELECT 1 FROM products WHERE id = $1", [p.id]);
      if (r.rows.length) continue;
      await products.save(p);
      console.log("[server] добавлен товар", p.id, p.name);
    }
    /* Разовые скрытия по просьбе владельца (без админки). Каждое выполняется
       один раз — отметка в app_settings, — чтобы потом товар можно было
       вернуть галочкой в админке и перезапуск его снова не спрятал. */
    const HIDE_ONCE = {
      "hide_2026_10_12": ["n36", "n37", "n39"], // Аврора, Марго, Мелон
    };
    await query("CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())");
    for (const [key, ids] of Object.entries(HIDE_ONCE)) {
      const done = await query("SELECT 1 FROM app_settings WHERE key = $1", [key]);
      if (done.rows.length) continue;
      for (const id of ids) await products.setActive(id, false);
      await query("INSERT INTO app_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING", [key, ids.join(",")]);
      console.log("[server] скрыты товары", ids.join(", "));
    }
  } catch (e) {
    console.error("[server] новые товары не добавлены:", e && e.message);
  }
})();

/* Таймер: сверка оплат и освобождение просроченных броней (как в Яндексе). */
setInterval(() => {
  handler({}).catch((e) => console.error("[timer]", e && e.message));
}, 5 * 60 * 1000);
