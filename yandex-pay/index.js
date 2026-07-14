/* ════════════════════════════════════════════════════════
   PALOMA — Yandex Cloud Function для оплаты Яндекс Пэй.

   Единственное место, где живёт секретный API-ключ (переменная
   окружения YPAY_API_KEY). В код и в репозиторий ключ не попадает.

   Два маршрута (различаются query-параметром ?a=):
     POST /?a=create   — сайт просит ссылку на оплату
     POST /?a=webhook  — Яндекс Пэй сообщает, что заказ оплачен
                         (этот адрес вписывается в Callback URL кабинета)

   Зависимостей нет — Node 18 умеет fetch и проверку ES256 сам.
   ════════════════════════════════════════════════════════ */
"use strict";

const crypto = require("crypto");

/* ── настройки из переменных окружения функции ── */
const IS_PROD = process.env.YPAY_ENV === "prod";
const BASE = IS_PROD ? "https://pay.yandex.ru" : "https://sandbox.pay.yandex.ru";
const API_KEY = process.env.YPAY_API_KEY || "";
const MERCHANT_ID = process.env.YPAY_MERCHANT_ID || "";
const SITE = (process.env.YPAY_SITE || "https://paloma.website").replace(/\/+$/, "");
/* Код НДС по ФФД: 6 — «без НДС» (УСН). Подтвердить у бухгалтера до боевого запуска. */
const TAX = Number(process.env.YPAY_TAX || 6);

const ORIGINS = [SITE, "https://www.paloma.website", "http://localhost:5500", "http://127.0.0.1:5500"];

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

/* Проверка всей корзины. Возвращает {items, total} или {error}. */
function verifyCart(body) {
  const raw = Array.isArray(body.items) ? body.items : [];
  if (!raw.length || raw.length > 50) return { error: "Корзина пуста или слишком большая" };

  const delivery = Number(body.delivery) || 0;
  if (!DELIVERY_ALLOWED.includes(delivery)) return { error: "Недопустимая стоимость доставки" };

  const items = [];
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
    items.push({
      productId: String(it.id).slice(0, 2048),
      title: String(it.name || "Позиция заказа").slice(0, 2048),
      quantity: { count: String(qty) },
      total: (price * qty).toFixed(2),
      receipt: { tax: TAX },
    });
  }

  if (delivery > 0) {
    sum += delivery;
    items.push({
      productId: "delivery",
      title: "Доставка",
      quantity: { count: "1" },
      total: delivery.toFixed(2),
      receipt: { tax: TAX },
    });
  }

  if (sum < 1) return { error: "Сумма заказа меньше 1 ₽" };
  return { items, total: sum };
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

function readBody(event) {
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf8")
    : event.body || "";
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return null;
  }
}

/* ── создание заказа и получение ссылки на оплату ── */
async function createOrder(body, origin) {
  if (!API_KEY || !MERCHANT_ID) return reply(500, { error: "Функция не настроена" }, origin);

  const orderId = String(body.orderId || "").trim();
  if (!/^[A-Za-z0-9-]{6,64}$/.test(orderId)) return reply(400, { error: "Некорректный номер заказа" }, origin);

  const cart = verifyCart(body);
  if (cart.error) return reply(400, { error: cart.error }, origin);

  const payload = {
    orderId,
    merchantId: MERCHANT_ID,
    currencyCode: "RUB",
    availablePaymentMethods: ["CARD", "SPLIT"],
    cart: {
      items: cart.items,
      total: { amount: cart.total.toFixed(2) },
    },
    redirectUrls: {
      onSuccess: `${SITE}/thank-you.html?orderId=${encodeURIComponent(orderId)}&paid=1`,
      onError: `${SITE}/checkout.html?payment=failed`,
      onAbort: `${SITE}/checkout.html?payment=aborted`,
    },
    ttl: 1800,
  };

  /* контакт для электронного чека облачной кассы */
  const contact = String(body.fiscalContact || "").trim();
  if (contact) payload.fiscalContact = contact.slice(0, 256);

  const res = await fetch(`${BASE}/api/merchant/v1/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Api-Key ${API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  const paymentUrl = json && json.data && json.data.paymentUrl;

  if (!res.ok || !paymentUrl) {
    console.error("[yandex-pay] create failed", res.status, JSON.stringify(json));
    return reply(502, { error: "Яндекс Пэй не принял заказ" }, origin);
  }

  console.log("[yandex-pay] created", orderId, cart.total);
  return reply(200, { paymentUrl, orderId, total: cart.total }, origin);
}

/* ── вебхук: Яндекс присылает JWT (ES256), подписанный своим ключом ──
   Без проверки подписи вебхуку доверять нельзя: адрес функции публичный. */
async function handleWebhook(event) {
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf8")
    : event.body || "";
  const token = raw.trim().replace(/^"|"$/g, "");

  const parts = token.split(".");
  if (parts.length !== 3) return { statusCode: 400, body: "bad token" };

  const [h64, p64, s64] = parts;
  let header;
  try {
    header = JSON.parse(Buffer.from(h64, "base64url").toString("utf8"));
  } catch {
    return { statusCode: 400, body: "bad header" };
  }
  if (header.alg !== "ES256") return { statusCode: 400, body: "bad alg" };

  const jwks = await fetch(`${BASE}/api/jwks`).then((r) => r.json());
  const jwk = (jwks.keys || []).find((k) => k.kid === header.kid);
  if (!jwk) return { statusCode: 401, body: "unknown key" };

  const key = crypto.createPublicKey({ key: jwk, format: "jwk" });
  const ok = crypto.verify(
    "sha256",
    Buffer.from(`${h64}.${p64}`),
    { key, dsaEncoding: "ieee-p1363" },
    Buffer.from(s64, "base64url"),
  );
  if (!ok) return { statusCode: 401, body: "bad signature" };

  const payload = JSON.parse(Buffer.from(p64, "base64url").toString("utf8"));
  if (payload.merchantId && payload.merchantId !== MERCHANT_ID) {
    return { statusCode: 401, body: "foreign merchant" };
  }

  /* Базы у сайта нет — пишем в лог функции. Он виден в консоли Яндекс Облака,
     а сам факт оплаты менеджер видит в кабинете Яндекс Пэй. */
  console.log("[yandex-pay] webhook", JSON.stringify(payload));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "success" }),
  };
}

/* для локальной проверки прайс-гарда: node yandex-pay/test.js */
module.exports._verifyCart = verifyCart;

module.exports.handler = async function handler(event) {
  const headers = event.headers || {};
  const origin = headers.origin || headers.Origin || "";
  const method = (event.httpMethod || "").toUpperCase();
  const action = (event.queryStringParameters || {}).a || "create";

  if (method === "OPTIONS") return { statusCode: 204, headers: cors(origin), body: "" };
  if (method !== "POST") return reply(405, { error: "Только POST" }, origin);

  try {
    if (action === "webhook") return await handleWebhook(event);

    const body = readBody(event);
    if (!body) return reply(400, { error: "Некорректный JSON" }, origin);
    return await createOrder(body, origin);
  } catch (e) {
    console.error("[yandex-pay] error", e && e.stack);
    return reply(500, { error: "Внутренняя ошибка" }, origin);
  }
};
