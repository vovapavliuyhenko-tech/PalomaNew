/* ════════════════════════════════════════════════════════
   ypay.js — Яндекс Пэй и Сплит (оплата частями).

   Переменные окружения (Render → Environment):
     YPAY_MERCHANT_ID — Merchant ID из кабинета Яндекс Пэй
     YPAY_API_KEY     — API-ключ (для боевой среды)
     YPAY_SANDBOX=1   — тестовая среда: ключом служит сам Merchant ID,
                        деньги не списываются
   Пока переменных нет — Сплит выключен, а на сайте его кнопка скрыта.

   Заказы Сплита на сайте получают номер «SPL-…» — по префиксу сервер
   понимает, у кого спрашивать статус оплаты: у Яндекса, а не у PayKeeper.

   Об оплате Яндекс сообщает POST-запросом на <адрес сервера>/v1/webhook
   (тело — JWT). Подписи не разбираем: из тела берём только номер заказа,
   а оплачен ли он — всегда спрашиваем у самого Яндекса по API с ключом.
   Подделать оплату через этот адрес поэтому нельзя.
   ════════════════════════════════════════════════════════ */
"use strict";

const SANDBOX = process.env.YPAY_SANDBOX === "1";
const MERCHANT_ID = String(process.env.YPAY_MERCHANT_ID || "").trim();
const API_KEY = SANDBOX ? MERCHANT_ID : String(process.env.YPAY_API_KEY || "").trim();
const BASE = (SANDBOX ? "https://sandbox.pay.yandex.ru" : "https://pay.yandex.ru") + "/api/merchant/v1";

const PREFIX = "SPL-";
const PAID = new Set(["CAPTURED", "CONFIRMED"]);

function enabled() { return !!(MERCHANT_ID && API_KEY); }
function isSplitOrder(orderId) { return String(orderId || "").indexOf(PREFIX) === 0; }

async function api(path, opts, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms || 12000);
  try {
    const res = await fetch(BASE + path, Object.assign({}, opts || {}, {
      signal: ctrl.signal,
      headers: Object.assign({
        Authorization: "Api-Key " + API_KEY,
        "Content-Type": "application/json",
        "X-Request-Id": (opts && opts.requestId) || String(Date.now()) + Math.random().toString(36).slice(2, 8),
      }, (opts && opts.headers) || {}),
    }));
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

const money = (n) => (Math.round(Number(n) * 100) / 100).toFixed(2);

/* Создать заказ в Яндекс Пэй. lines — уже проверенные по прайсу позиции
   [{id, name, price, qty}], delivery — стоимость доставки (0 или 350).
   Возвращает ссылку на форму оплаты или бросает ошибку. */
async function createOrder({ orderId, lines, delivery, total, site, phone }) {
  const items = lines.map((l, i) => ({
    productId: String(l.id || "item-" + (i + 1)).slice(0, 2048),
    title: String(l.name || "Позиция").slice(0, 2048),
    quantity: { count: String(l.qty || 1) },
    unitPrice: money(l.price),
    total: money(Number(l.price) * (l.qty || 1)),
  }));
  if (delivery > 0) {
    items.push({ productId: "delivery", title: "Доставка", quantity: { count: "1" }, unitPrice: money(delivery), total: money(delivery) });
  }
  const body = {
    orderId,
    currencyCode: "RUB",
    cart: { items, total: { amount: money(total) } },
    redirectUrls: {
      onSuccess: site + "/thank-you.html?paid=1",
      onError: site + "/checkout.html?payment=failed",
      onAbort: site + "/checkout.html",
    },
    availablePaymentMethods: ["SPLIT", "CARD"],
    preferredPaymentMethod: "SPLIT",
    ttl: 3600,
    purpose: "Заказ " + orderId + " в PALOMA",
  };
  if (phone) body.billingPhone = String(phone).replace(/[^\d+]/g, "").slice(0, 20);
  const r = await api("/orders", { method: "POST", body: JSON.stringify(body), requestId: orderId }, 15000);
  const url = r.data && r.data.data && r.data.data.paymentUrl;
  if (!r.ok || !url) {
    console.error("[ypay] create failed", r.status, JSON.stringify(r.data).slice(0, 500));
    throw new Error((r.data && (r.data.reasonCode || r.data.reason)) || "Яндекс Пэй не принял заказ");
  }
  return url;
}

/* Оплачен ли заказ — по данным Яндекса. { paid, sum, status } или null,
   если Яндекс не ответил (тогда решим позже — сверкой). */
async function paymentInfo(orderId) {
  if (!enabled() || !orderId) return null;
  try {
    const r = await api("/orders/" + encodeURIComponent(orderId), { method: "GET" }, 8000);
    if (r.status === 404) return { paid: false, sum: 0, status: "NOT_FOUND" };
    const order = r.data && r.data.data && r.data.data.order;
    if (!r.ok || !order) {
      console.error("[ypay] status", orderId, r.status);
      return null;
    }
    return { paid: PAID.has(order.paymentStatus), sum: Number(order.orderAmount) || 0, status: order.paymentStatus, clientid: "" };
  } catch (e) {
    console.error("[ypay] status error", orderId, e && e.message);
    return null;
  }
}

/* Номер заказа из уведомления Яндекса (тело — JWT, нам нужна только полезная
   нагрузка). Чужой merchantId — отбрасываем. */
function webhookOrderId(raw) {
  try {
    const parts = String(raw || "").trim().split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
    if (MERCHANT_ID && payload.merchantId && String(payload.merchantId) !== MERCHANT_ID) return null;
    const id = payload.order && payload.order.orderId;
    return isSplitOrder(id) ? String(id) : null;
  } catch (e) {
    return null;
  }
}

module.exports = { enabled, isSplitOrder, createOrder, paymentInfo, webhookOrderId, SANDBOX };
