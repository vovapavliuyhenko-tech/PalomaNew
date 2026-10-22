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
  /* Яндекс Пэй шлёт уведомления на <адрес>/v1/webhook — без ?a= */
  if (/\/v1\/webhook\/?$/.test(url.pathname)) qs.a = "ypay-webhook";
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
      /* шоколад ChocoMe и «Счастье» переехали в меню кофейни (coffee-menu-data.js) */
      "hide_2026_10_21_sweets": ["acc22","acc23","acc24","acc25","acc26","acc27","acc28","acc29","acc30","acc31","acc32","acc33","acc34","acc35","acc36","acc37","acc38","acc39","acc40","p1791800000012","p1791800000013","p1791800000014","p1791800000015","p1791800000016","p1791800000017","p1791800000018","p1791800000019","p1791800000020","p1791800000021","p1791800000022","p1791800000023","p1791800000024","p1791800000025"],
    };
    await query("CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())");
    for (const [key, ids] of Object.entries(HIDE_ONCE)) {
      const done = await query("SELECT 1 FROM app_settings WHERE key = $1", [key]);
      if (done.rows.length) continue;
      for (const id of ids) await products.setActive(id, false);
      await query("INSERT INTO app_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING", [key, ids.join(",")]);
      console.log("[server] скрыты товары", ids.join(", "));
    }
    /* Разовые возвраты на сайт — та же схема с отметкой. Шоколад вернули
       в «Вазы и подарки» (в общий каталог «Все» он не попадает — catalog-data.js). */
    const SHOW_ONCE = {
      "show_2026_10_21_sweets": ["acc22","acc23","acc24","acc25","acc26","acc27","acc28","acc29","acc30","acc31","acc32","acc33","acc34","acc35","acc36","acc37","acc38","acc39","acc40","p1791800000012","p1791800000013","p1791800000014","p1791800000015","p1791800000016","p1791800000017","p1791800000018","p1791800000019","p1791800000020","p1791800000021","p1791800000022","p1791800000023","p1791800000024","p1791800000025"],
    };
    for (const [key, ids] of Object.entries(SHOW_ONCE)) {
      const done = await query("SELECT 1 FROM app_settings WHERE key = $1", [key]);
      if (done.rows.length) continue;
      for (const id of ids) await products.setActive(id, true);
      await query("INSERT INTO app_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING", [key, ids.join(",")]);
      console.log("[server] возвращены товары", ids.join(", "));
    }
    /* Разовые правки описаний (поле desc) — та же схема с отметкой.
       «Счастье»: состав, вес и калорийность с сайта фабрики (schastyesweet.com). */
    const DESC_ONCE = {
      "desc_2026_10_22_schaste": {
        "p1791800000012": "Французское пралине с эссенцией базилика на масле виноградной косточки и кусочками фисташки в молочном шоколаде 30%. Ручная работа фабрики «Счастье». Масса 50 г, 566 ккал / 100 г.",
        "p1791800000013": "Пралине с обжаренными вручную грецкими орехами и домашней сливочной карамелью в молочном шоколаде. Масса 50 г, 546 ккал / 100 г.",
        "p1791800000014": "Пралине с отборным черносливом и обжаренными грецкими орехами в горьком шоколаде. Масса 50 г, 470 ккал / 100 г.",
        "p1791800000015": "Фундучно-арахисовое пралине с чёрным и белым кунжутом, морской солью и хрустящей вафельной крошкой в горьком шоколаде. Яркий сладко-солёный вкус. Масса 50 г, 533 ккал / 100 г.",
        "p1791800000016": "Подарочная коробка из четырёх кубиков пралине «Счастье» разных вкусов — набор № 3. Ручная работа по рецептам французской школы. Масса 200 г.",
        "p1791800000017": "Подарочная коробка из четырёх кубиков пралине «Счастье» разных вкусов — набор № 4. Ручная работа по рецептам французской школы. Масса 200 г.",
        "p1791800000018": "10 мини-пралине разных вкусов: фундук, грецкий орех с карамелью, кокос, имбирь с семенами чиа, малина с розовым перцем и другие — в молочном шоколаде. Масса 85 г, 548 ккал / 100 г.",
        "p1791800000019": "20 мини-пралине разных вкусов: фундук, грецкий орех с карамелью, кокос, имбирь с семенами чиа, малина с розовым перцем и другие — в молочном шоколаде. Масса 170 г, 548 ккал / 100 г.",
        "p1791800000020": "36 мини-пралине 14 вкусов в молочном и горьком шоколаде: ваниль с фундуком, кофе, карамель с грецким орехом, грильяж, кунжут с морской солью, фисташка с базиликом, вишня с миндалём, лаванда и другие. Масса 306 г, 540 ккал / 100 г.",
        "p1791800000021": "Сливочно-карамельные ириски ручной работы: карамель варят на натуральных сливках 33%, режут небольшими кубиками и покрывают шоколадом. Масса 140 г.",
        "p1791800000022": "Домашнее кунжутное печенье в форме ангела с морской солью и ганашем из молочного шоколада. Печётся по рецептам, которые фабрика «Счастье» хранит больше десяти лет. Масса 100 г, 449 ккал / 100 г.",
        "p1791800000023": "Имбирное печенье в форме сердца с начинкой из клюквы и белого шоколада с розовым перцем. Из коллекции печенья Friends фабрики «Счастье». Масса 90 г, 310 ккал / 100 г.",
        "p1791800000024": "Домашнее шоколадное печенье в форме мишки с ганашем из белого шоколада. Из коллекции печенья Friends фабрики «Счастье».",
        "p1791800000025": "Молочный шоколад из детской коллекции «Счастье» KIDS — в сказочной коробочке les petits Chocolats."
      },
    };
    for (const [key, map] of Object.entries(DESC_ONCE)) {
      const done = await query("SELECT 1 FROM app_settings WHERE key = $1", [key]);
      if (done.rows.length) continue;
      for (const [id, desc] of Object.entries(map)) {
        await query("UPDATE products SET data = jsonb_set(data, '{desc}', to_jsonb($2::text)), updated_at = now() WHERE id = $1", [id, desc]);
      }
      await query("INSERT INTO app_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING", [key, Object.keys(map).join(",")]);
      console.log("[server] обновлены описания", Object.keys(map).length);
    }
  } catch (e) {
    console.error("[server] новые товары не добавлены:", e && e.message);
  }
})();

/* Таймер: сверка оплат и освобождение просроченных броней (как в Яндексе). */
setInterval(() => {
  handler({}).catch((e) => console.error("[timer]", e && e.message));
}, 5 * 60 * 1000);
