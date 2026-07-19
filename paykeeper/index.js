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

/* Telegram-бот менеджера: заказ уходит менеджеру автоматически, не завися от
   того, отправит ли клиент сообщение сам. Пусто → уведомления выключены. */
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || "";
const TG_CHAT_ID = process.env.TG_CHAT_ID || "";

const ORIGINS = [SITE, "https://www.paloma.website", "http://localhost:5500", "http://127.0.0.1:5500"];
const AUTH = "Basic " + Buffer.from(`${PK_USER}:${PK_PASSWORD}`).toString("base64");

/* TG_CHAT_ID может содержать несколько чатов через запятую —
   шлём в каждый (личка менеджера + рабочая группа и т.п.) */
function tgChatIds() {
  return TG_CHAT_ID.split(",").map((s) => s.trim()).filter(Boolean);
}

/* Один вызов Telegram Bot API. Ошибки не роняют заказ — логируем. */
async function tgCall(method, payload) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error("[telegram]", method, payload.chat_id, res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("[telegram] error", method, payload.chat_id, e && e.message);
    return false;
  }
}

/* Отправка сообщения менеджеру в Telegram. Не роняет заказ при ошибке:
   любые сбои проглатываем и логируем — оплата важнее уведомления. */
async function notifyManager(text) {
  if (!TG_BOT_TOKEN || !TG_CHAT_ID) return;
  const payload = String(text).slice(0, 4000);
  await Promise.all(
    tgChatIds().map((chatId) =>
      tgCall("sendMessage", { chat_id: chatId, text: payload, disable_web_page_preview: true }),
    ),
  );
}

/* Фото букетов из заказа — альбомом (2–10) или одиночным фото.
   Telegram сам скачивает картинки по ссылке, поэтому шлём публичные URL. */
async function sendPhotosToChat(chatId, urls, caption) {
  for (let i = 0; i < urls.length; i += 10) {
    const chunk = urls.slice(i, i + 10);
    const cap = i === 0 ? caption : undefined;
    if (chunk.length === 1) {
      await tgCall("sendPhoto", { chat_id: chatId, photo: chunk[0], caption: cap });
    } else {
      const media = chunk.map((u, idx) => ({ type: "photo", media: u, caption: idx === 0 ? cap : undefined }));
      await tgCall("sendMediaGroup", { chat_id: chatId, media });
    }
  }
}

async function notifyPhotos(urls, caption) {
  if (!TG_BOT_TOKEN || !TG_CHAT_ID || !urls || !urls.length) return;
  await Promise.all(tgChatIds().map((chatId) => sendPhotosToChat(chatId, urls, caption)));
}

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

/* Префиксы каталожных id (c — букеты и вазы, m — моно, w — свадебные).
   Берём из самого прайса: иначе новая группа товаров молча проваливается
   в диапазон «свободной суммы» и её цену можно подменить в браузере. */
const CATALOG_ID_RE = new RegExp(
  "^((?:" +
    [...new Set(PRODUCTS.map((p) => (String(p.id).match(/^([a-z]+)\d+$/i) || [])[1]).filter(Boolean))].join("|") +
    ")\\d+)(?:[-_]|$)",
);

/* Категории, которые считаем «букетом» — только их фото шлём менеджеру.
   Вазы, десерты, подписка, оформление, кофе и допы в фото не попадают. */
const BOUQUET_CATS = new Set([
  "mono", "duo", "wedding", "authors", "online", "season", "bestsellers", "compositions",
]);

/* Публичные ссылки на фото букетов из заказа (без повторов, максимум 10). */
function bouquetPhotos(body) {
  const raw = Array.isArray(body.items) ? body.items : [];
  const urls = [];
  const seen = new Set();
  for (const it of raw) {
    const code = String(it.id || "").match(CATALOG_ID_RE);
    if (!code) continue;
    const p = PRODUCTS.find((x) => x.id === code[1]);
    if (!p || !p.image) continue;
    const cats = Array.isArray(p.categories) ? p.categories : p.category ? [p.category] : [];
    if (!cats.some((c) => BOUQUET_CATS.has(c))) continue;
    const url = /^https?:\/\//i.test(p.image) ? p.image : SITE + "/" + String(p.image).replace(/^\/+/, "");
    if (seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
    if (urls.length >= 10) break;
  }
  return urls;
}

function md5(s) {
  return crypto.createHash("md5").update(s, "utf8").digest("hex");
}

/* Разрешённый диапазон цены строки корзины.
   Букеты и кофе считаем по каталогу; свободные суммы — по границам. */
function allowedRange(id) {
  /* Строка корзины — «<id товара>-<размер>»: c1-M, m9-XL, w3-base.
     Если id похож на каталожный, но товара нет — это ошибка, а не «свободная сумма». */
  const code = String(id || "").match(CATALOG_ID_RE);
  if (code) {
    const p = PRODUCTS.find((x) => x.id === code[1]);
    if (!p) return null;
    const base = Number(p.price) || 0;
    const addons = (p.addons || []).reduce((s, a) => s + (Number(a.price) || 0), 0);
    /* Авторские — свободный выбор бюджета шкалой на странице товара.
       Верхняя граница считается как на фронте: max(base*3 округл., base+10000). */
    if ((p.categories || []).includes("authors")) {
      const budgetMax = Math.max(Math.round((base * 3) / 1000) * 1000, base + 10000);
      return { min: base, max: budgetMax + addons };
    }
    const maxDelta = (p.sizes || []).reduce((m, s) => Math.max(m, Number(s.priceDelta) || 0), 0);
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

  /* Заказ уходит менеджеру сразу — со всеми деталями, что собрал сайт.
     Оплату подтвердит отдельное сообщение из webhook. */
  const details = String(body.managerText || cart.names.join(", ")).slice(0, 3500);
  await notifyManager(
    "🆕 НОВЫЙ ЗАКАЗ (ожидает оплаты)\n№ " + orderId + "\nСумма: " +
      cart.total.toLocaleString("ru-RU") + " ₽\n\n" + details,
  );
  await notifyPhotos(bouquetPhotos(body), "🖼 Букеты по заказу № " + orderId);

  return reply(
    200,
    { paymentUrl: `${PK_SERVER}/bill/${invoiceId}/`, orderId, total: cart.total },
    origin,
  );
}

/* ── уведомление менеджеру без оплаты (заказ «при получении») ──
   Цель — чтобы В БОТ ПОПАДАЛИ АБСОЛЮТНО ВСЕ заказы, а не только онлайн-оплаты.
   PayKeeper тут не участвует: просто пересылаем менеджеру состав заказа.
   Намеренно устойчиво: если прайс на функции рассинхронён и verifyCart
   отклонил бы заказ — уведомление всё равно уходит (managerText уже собран
   сайтом и содержит сумму), потеря заказа хуже неточной суммы в шапке. */
async function handleNotify(body, origin) {
  const orderId = String(body.orderId || "").trim();
  if (!/^[A-Za-z0-9-]{6,64}$/.test(orderId)) {
    return reply(400, { error: "Некорректный номер заказа" }, origin);
  }
  const details = String(body.managerText || "").slice(0, 3500);
  if (!details) return reply(400, { error: "Пустой заказ" }, origin);

  const cart = verifyCart(body); /* только ради суммы в шапке — не блокирует */
  const totalStr = cart && !cart.error ? cart.total.toLocaleString("ru-RU") + " ₽" : "";
  const header =
    "🆕 НОВЫЙ ЗАКАЗ" +
    (body.payment === "payment_on_receipt" ? " (оплата при получении)" : "");

  await notifyManager(
    header + "\n№ " + orderId + (totalStr ? "\nСумма: " + totalStr : "") + "\n\n" + details,
  );
  await notifyPhotos(bouquetPhotos(body), "🖼 Букеты по заказу № " + orderId);
  console.log("[paykeeper] notify", orderId, body.payment || "");
  return reply(200, { ok: true, orderId }, origin);
}

/* ── POST-оповещение об оплате ──
   PayKeeper шлёт form-urlencoded: id, sum, clientid, orderid, key
   key    = md5(id + sum(2 знака) + clientid + orderid + секретное слово)
   ответ  = "OK " + md5(id + секретное слово)
   Без верной подписи не отвечаем OK: адрес функции публичный. */
async function handleWebhook(event) {
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

  /* Подтверждаем менеджеру оплату (детали заказа он уже получил при оформлении). */
  await notifyManager(
    "✅ ОПЛАЧЕН\n№ " + orderid + "\nСумма: " +
      (Number.isFinite(amount) ? amount.toLocaleString("ru-RU") : sum) + " ₽\n" +
      "Клиент: " + (clientid || "—"),
  );

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: "OK " + md5(id + PK_SECRET),
  };
}

/* для локальной проверки: node paykeeper/test.js */
module.exports._verifyCart = verifyCart;
module.exports._handleWebhook = handleWebhook;
module.exports._handleNotify = handleNotify;
module.exports._bouquetPhotos = bouquetPhotos;

module.exports.handler = async function handler(event) {
  const headers = event.headers || {};
  const origin = headers.origin || headers.Origin || "";
  const method = (event.httpMethod || "").toUpperCase();
  const action = (event.queryStringParameters || {}).a || "create";

  if (method === "OPTIONS") return { statusCode: 204, headers: cors(origin), body: "" };
  if (method !== "POST") return reply(405, { error: "Только POST" }, origin);

  try {
    if (action === "webhook") return await handleWebhook(event);

    let body;
    try {
      body = JSON.parse(rawBody(event) || "{}");
    } catch {
      return reply(400, { error: "Некорректный JSON" }, origin);
    }
    if (action === "notify") return await handleNotify(body, origin);
    return await createInvoice(body, origin);
  } catch (e) {
    console.error("[paykeeper] error", e && e.stack);
    return reply(500, { error: "Внутренняя ошибка" }, origin);
  }
};
