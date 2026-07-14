/* ════════════════════════════════════════════════════════
   PALOMA — Yandex Cloud Function для оплаты через PayKeeper
   (интернет-эквайринг АО «Альфа-Банк»).

   Единственное место, где живут логин и пароль от ЛК PayKeeper
   и секретное слово (переменные окружения). В сайт они не попадают:
   сайт статический, всё его содержимое видно покупателю.

   Два маршрута (различаются query-параметром ?a=):
     POST /?a=create   — сайт просит ссылку на оплату
     POST /?a=webhook  — PayKeeper сообщает, что счёт оплачен
                         (этот адрес вписывается в ЛК → Настройки →
                          Получение информации о платежах → POST-оповещения)

   Зависимостей нет — Node 18 умеет fetch и md5 сам.
   ════════════════════════════════════════════════════════ */
"use strict";

const crypto = require("crypto");

/* ── настройки из переменных окружения функции ── */
const PK_SERVER = (process.env.PK_SERVER || "https://paloma.server.paykeeper.ru").replace(/\/+$/, "");
const PK_USER = process.env.PK_USER || "";
const PK_PASSWORD = process.env.PK_PASSWORD || "";
const PK_SECRET = process.env.PK_SECRET || ""; /* секретное слово из ЛК */
const SITE = (process.env.PK_SITE || "https://paloma.website").replace(/\/+$/, "");

const ORIGINS = [SITE, "https://www.paloma.website", "http://localhost:5500", "http://127.0.0.1:5500"];
const AUTH = "Basic " + Buffer.from(`${PK_USER}:${PK_PASSWORD}`).toString("base64");

/* ── прайс-лист: тот же, что на сайте (файлы копирует sync.js) ── */
global.window = global.window || {};
require("./paloma-products.js");
require("./coffee-menu-data.js");
const PRODUCTS = global.window.PALOMA_PRODUCTS || [];
const COFFEE = global.window.PALOMA_COFFEE_MENU || [];

/* Максимум добавок к кофе: молоко 100 + сироп 60 (см. COLD_ADDONS в coffee-ea.js) */
const COFFEE_ADDONS_MAX = 200;
/* Позиции со свободной суммой (сертификат, копилка, подписка) — задаёт покупатель */
const OPEN_MIN = 100;
const OPEN_MAX = 300000;
const DELIVERY_ALLOWED = [0, 350];

/* Товары с фиксированной ценой: допы букета + апселлы чекаута */
const FIXED = {};
PRODUCTS.forEach((p) => {
  (p.addons || []).forEach((a) => {
    FIXED[a.id] = Math.max(FIXED[a.id] || 0, Number(a.price) || 0);
  });
});
Object.assign(FIXED, {
  "upsell-coffee": 250,
  "upsell-vase": 1500,
  "upsell-secateurs": 1000,
  "upsell-dessert": 190,
});

function md5(s) {
  return crypto.createHash("md5").update(s, "utf8").digest("hex");
}

/* Разрешённый диапазон цены строки корзины.
   Букеты и кофе считаем по каталогу; свободные суммы — по границам. */
function allowedRange(id) {
  const code = String(id || "").match(/^(c\d+)(?:[-_]|$)/);
  if (code) {
    const p = PRODUCTS.find((x) => x.id === code[1]);
    if (!p) return null;
    const base = Number(p.price) || 0;
    const maxDelta = (p.sizes || []).reduce((m, s) => Math.max(m, Number(s.priceDelta) || 0), 0);
    const addons = (p.addons || []).reduce((s, a) => s + (Number(a.price) || 0), 0);
    return { min: base, max: base + maxDelta + addons };
  }

  const cof = COFFEE.filter((x) => String(id).startsWith(x.id)).sort((a, b) => b.id.length - a.id.length)[0];
  if (cof) {
    const prices = String(cof.priceLabel || "")
      .split("/")
      .map((s) => parseInt(String(s).replace(/[^0-9]/g, ""), 10))
      .filter((n) => n > 0);
    const base = Number(cof.price) || 0;
    const lo = prices.length ? Math.min(...prices) : base;
    const hi = prices.length ? Math.max(...prices) : base;
    return { min: Math.min(lo, base), max: Math.max(hi, base) + COFFEE_ADDONS_MAX };
  }

  if (Object.prototype.hasOwnProperty.call(FIXED, id)) {
    return { min: FIXED[id], max: FIXED[id] };
  }

  return { min: OPEN_MIN, max: OPEN_MAX };
}

/* Проверка всей корзины. Возвращает {names, total} или {error}.
   Цены из браузера не принимаются на веру: их можно подменить в localStorage. */
function verifyCart(body) {
  const raw = Array.isArray(body.items) ? body.items : [];
  if (!raw.length || raw.length > 50) return { error: "Корзина пуста или слишком большая" };

  const delivery = Number(body.delivery) || 0;
  if (!DELIVERY_ALLOWED.includes(delivery)) return { error: "Недопустимая стоимость доставки" };

  const names = [];
  let sum = 0;

  for (const it of raw) {
    const price = Number(it.price);
    const qty = Number(it.qty) || 1;
    if (!Number.isFinite(price) || price <= 0) return { error: "Некорректная цена позиции" };
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return { error: "Некорректное количество" };

    const range = allowedRange(it.id);
    if (!range) return { error: "Неизвестный товар: " + it.id };
    if (price < range.min || price > range.max) {
      return { error: "Цена позиции не совпадает с каталогом: " + it.id };
    }

    sum += price * qty;
    names.push(String(it.name || "Позиция") + (qty > 1 ? ` × ${qty}` : ""));
  }

  if (delivery > 0) {
    sum += delivery;
    names.push("Доставка");
  }

  if (sum < 1) return { error: "Сумма заказа меньше 1 ₽" };
  return { names, total: sum };
}

/* ── HTTP-обвязка ── */
function cors(origin) {
  const allow = ORIGINS.includes(origin) ? origin : SITE;
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function reply(status, data, origin) {
  return {
    statusCode: status,
    headers: Object.assign({ "Content-Type": "application/json" }, cors(origin)),
    body: JSON.stringify(data),
  };
}

function rawBody(event) {
  return event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf8")
    : event.body || "";
}

/* ── создание счёта и получение ссылки на оплату ──
   Шаг 1: GET /info/settings/token/      → токен безопасности
   Шаг 2: POST /change/invoice/preview/  → invoice_id
   Ссылка: <сервер>/bill/<invoice_id>/                                   */
async function createInvoice(body, origin) {
  if (!PK_USER || !PK_PASSWORD) return reply(500, { error: "Функция не настроена" }, origin);

  const orderId = String(body.orderId || "").trim();
  if (!/^[A-Za-z0-9-]{6,64}$/.test(orderId)) return reply(400, { error: "Некорректный номер заказа" }, origin);

  const cart = verifyCart(body);
  if (cart.error) return reply(400, { error: cart.error }, origin);

  const tokenRes = await fetch(`${PK_SERVER}/info/settings/token/`, {
    headers: { Authorization: AUTH },
  });
  const tokenJson = await tokenRes.json().catch(() => ({}));
  const token = tokenJson && tokenJson.token;
  if (!tokenRes.ok || !token) {
    console.error("[paykeeper] token failed", tokenRes.status, JSON.stringify(tokenJson));
    return reply(502, { error: "PayKeeper не выдал токен" }, origin);
  }

  const form = new URLSearchParams({
    token,
    pay_amount: cart.total.toFixed(2),
    clientid: String(body.clientName || "Покупатель PALOMA").slice(0, 128),
    orderid: orderId,
    service_name: cart.names.join(", ").slice(0, 250),
  });
  if (body.email) form.set("client_email", String(body.email).slice(0, 128));
  if (body.phone) form.set("client_phone", String(body.phone).replace(/\D/g, "").slice(0, 16));

  const invRes = await fetch(`${PK_SERVER}/change/invoice/preview/`, {
    method: "POST",
    headers: {
      Authorization: AUTH,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  const invJson = await invRes.json().catch(() => ({}));
  const invoiceId = invJson && invJson.invoice_id;

  if (!invRes.ok || !invoiceId) {
    console.error("[paykeeper] invoice failed", invRes.status, JSON.stringify(invJson));
    return reply(502, { error: invJson.msg || "PayKeeper не принял заказ" }, origin);
  }

  console.log("[paykeeper] invoice", orderId, cart.total, invoiceId);
  return reply(
    200,
    { paymentUrl: `${PK_SERVER}/bill/${invoiceId}/`, orderId, total: cart.total },
    origin,
  );
}

/* ── POST-оповещение об оплате ──
   PayKeeper шлёт form-urlencoded: id, sum, clientid, orderid, key
   key    = md5(id + sum(2 знака) + clientid + orderid + секретное слово)
   ответ  = "OK " + md5(id + секретное слово)
   Без верной подписи не отвечаем OK: адрес функции публичный. */
function handleWebhook(event) {
  const p = new URLSearchParams(rawBody(event));
  const id = p.get("id") || "";
  const sum = p.get("sum") || "";
  const clientid = p.get("clientid") || "";
  const orderid = p.get("orderid") || "";
  const key = p.get("key") || "";

  const amount = Number(sum);
  const expected = md5(
    id + (Number.isFinite(amount) ? amount.toFixed(2) : sum) + clientid + orderid + PK_SECRET,
  );

  if (!PK_SECRET || key !== expected) {
    console.error("[paykeeper] bad signature", id, orderid);
    return { statusCode: 401, headers: { "Content-Type": "text/plain" }, body: "Error! Bad signature" };
  }

  /* Базы у сайта нет — пишем в лог функции. Сам платёж менеджер видит в ЛК PayKeeper. */
  console.log("[paykeeper] paid", JSON.stringify({ id, orderid, sum, clientid }));

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: "OK " + md5(id + PK_SECRET),
  };
}

/* для локальной проверки: node paykeeper/test.js */
module.exports._verifyCart = verifyCart;
module.exports._handleWebhook = handleWebhook;

module.exports.handler = async function handler(event) {
  const headers = event.headers || {};
  const origin = headers.origin || headers.Origin || "";
  const method = (event.httpMethod || "").toUpperCase();
  const action = (event.queryStringParameters || {}).a || "create";

  if (method === "OPTIONS") return { statusCode: 204, headers: cors(origin), body: "" };
  if (method !== "POST") return reply(405, { error: "Только POST" }, origin);

  try {
    if (action === "webhook") return handleWebhook(event);

    let body;
    try {
      body = JSON.parse(rawBody(event) || "{}");
    } catch {
      return reply(400, { error: "Некорректный JSON" }, origin);
    }
    return await createInvoice(body, origin);
  } catch (e) {
    console.error("[paykeeper] error", e && e.stack);
    return reply(500, { error: "Внутренняя ошибка" }, origin);
  }
};
