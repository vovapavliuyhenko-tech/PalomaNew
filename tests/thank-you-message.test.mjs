/* Прогоняем реальную buildMessage из thank-you.js через минимальный shim
   и проверяем шаблон сообщения менеджеру (формат позиций, суммы, блоки). */
import { readFileSync } from "node:fs";
import assert from "node:assert";

const src = readFileSync(new URL("../thank-you.js", import.meta.url), "utf8");

const noopEl = { classList: { add() {}, remove() {} }, appendChild() {}, setAttribute() {}, style: {}, focus() {}, select() {}, set textContent(_) {}, set innerHTML(_) {}, set value(_) {} };
const documentShim = {
  body: { classList: { contains: () => true }, appendChild() {} },
  getElementById: () => null,
  createElement: () => noopEl,
};
const windowShim = { PALOMA_MANAGER: { whatsappPhone: "79897707000", telegramUrl: "https://t.me/x", maxPhone: "+7 000", maxProfileUrl: "" }, isSecureContext: false, open() {} };
const localStorageShim = { getItem: (k) => (k === "paloma_last_order" ? JSON.stringify(order) : null) };

const order = {
  id: "ORD-TEST",
  items: [
    { name: "Букет «Аврора»", price: 2500, qty: 2, size: "M", addons: ["Открытка"] },
    { name: "Кофе PALOMA", price: 280, qty: 1 },
  ],
  total: 5280,
  payment: "qr_after_manager_confirmation",
  messenger: "telegram",
  messengerContact: "@client",
  form: {
    name: "Анна", phone: "+79990000000", email: "a@b.ru",
    delivery_type: "courier", city: "Новороссийск", address: "Ленина 1", apt: "5",
    delivery_date: "2026-07-10", time_from: "12:00", time_to: "15:00",
    recipient_type: "self", comment: "",
  },
};

const fn = new Function("document", "window", "navigator", "localStorage", "setTimeout", "clearTimeout",
  src + "\n;return window.__tyBuildMessage;");
const buildMessage = fn(documentShim, windowShim, { clipboard: null }, localStorageShim, setTimeout, clearTimeout);
assert(typeof buildMessage === "function", "buildMessage не экспортирована");

const msg = buildMessage(order, order.form);
const n = msg.replace(/[  ]/g, " ");

const must = [
  "Номер заказа: №ORD-TEST",
  "1. Букет «Аврора» (M, Открытка) — 2 шт. — 5 000 ₽",
  "2. Кофе PALOMA — 1 шт. — 280 ₽",
  "Предварительная сумма: 5 280 ₽",
  "Способ получения: Доставка курьером",
  "Адрес доставки: Новороссийск, Ленина 1, кв. 5",
  "Желаемая дата: 10.07.2026",
  "Желаемое время: 12:00–15:00",
  "Получатель: я (покупатель)",
  "Связь через Telegram: @client",
  "Комментарий к заказу: —",
  "Перевод по QR-коду после подтверждения",
  "Прошу подтвердить наличие товаров",
];
for (const s of must) assert(n.includes(s), `Нет фрагмента: «${s}»`);
assert(!/[<>]/.test(msg), "В сообщении не должно быть HTML-символов < >");

console.log(`OK — сообщение содержит все ${must.length} обязательных блоков, без HTML`);
