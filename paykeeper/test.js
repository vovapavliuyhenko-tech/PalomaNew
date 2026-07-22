/* Проверка без обращения к PayKeeper: node paykeeper/test.js */
"use strict";

process.env.PK_SECRET = "test-secret-word";

const crypto = require("crypto");
const { _verifyCart: verify, _handleWebhook: webhook, _handleNotify: notify } = require("./index.js");

const md5 = (s) => crypto.createHash("md5").update(s, "utf8").digest("hex");

let bad = 0;
const check = (ok, name, extra) => {
  if (!ok) bad++;
  console.log(`${ok ? "✓" : "✗"} ${name}${extra ? " → " + extra : ""}`);
};

/* ── прайс-гард ── */
const cases = [
  ["букет по каталогу (Белая гортензия M = 2300 + 1300)", { items: [{ id: "m1-M", name: "Белая гортензия", price: 3600, qty: 1 }], delivery: 350 }, true],
  ["букет с допами (XL + открытка/ваза/кофе)", { items: [{ id: "m1-XL-card_vase_coffee", name: "Белая гортензия", price: 8070, qty: 1 }], delivery: 0 }, true],
  ["подмена цены букета на 100 ₽", { items: [{ id: "m1-M", name: "Белая гортензия", price: 100, qty: 1 }], delivery: 0 }, false],
  ["цена выше максимума каталога", { items: [{ id: "m1-M", name: "Белая гортензия", price: 99999, qty: 1 }], delivery: 0 }, false],
  ["несуществующий товар m999", { items: [{ id: "m999-M", name: "Фейк", price: 3000, qty: 1 }], delivery: 0 }, false],
  ["апселл — ваза 1500", { items: [{ id: "upsell-vase", name: "Ваза", price: 1500, qty: 1 }], delivery: 0 }, true],
  ["апселл — ваза за 10 ₽", { items: [{ id: "upsell-vase", name: "Ваза", price: 10, qty: 1 }], delivery: 0 }, false],
  ["авторский букет по бюджету 4000 (мин. шкалы)", { items: [{ id: "n30-b4000", name: "Мятный бриз", price: 4000, qty: 1 }], delivery: 0 }, true],
  ["авторский букет по бюджету 30000 (макс. шкалы)", { items: [{ id: "n30-b30000", name: "Мятный бриз", price: 30000, qty: 1 }], delivery: 0 }, true],
  ["авторский бюджет ниже 3000 отклонён", { items: [{ id: "n30-b2000", name: "Мятный бриз", price: 2000, qty: 1 }], delivery: 0 }, false],
  ["доставка не из прайса (1 ₽)", { items: [{ id: "m1-M", name: "Белая гортензия", price: 3600, qty: 1 }], delivery: 1 }, false],
  ["отрицательное количество", { items: [{ id: "m1-M", name: "Белая гортензия", price: 3600, qty: -3 }], delivery: 0 }, false],
];

cases.forEach(([name, body, shouldPass]) => {
  const r = verify(body);
  check(!r.error === shouldPass, name, r.error || "сумма " + r.total + " ₽");
});

const coffee = (global.window.PALOMA_COFFEE_MENU || [])[0];
if (coffee) {
  const ok = verify({ items: [{ id: coffee.id, name: coffee.title, price: coffee.price, qty: 1 }], delivery: 0 });
  const cheat = verify({ items: [{ id: coffee.id, name: coffee.title, price: 1, qty: 1 }], delivery: 0 });
  check(!ok.error, `кофе «${coffee.title}» по цене меню (${coffee.price} ₽)`);
  check(!!cheat.error, `кофе «${coffee.title}» за 1 ₽ отклонён`, cheat.error);
}

/* ── подпись POST-оповещения (webhook — async: шлёт уведомление менеджеру) ── */
const S = process.env.PK_SECRET;
const ev = (params) => ({ body: new URLSearchParams(params).toString(), isBase64Encoded: false });

const id = "97452";
const sum = "4650.00";
const clientid = "Светлана";
const orderid = "ORD-ABC123";

(async () => {
  const good = await webhook(ev({ id, sum, clientid, orderid, key: md5(id + sum + clientid + orderid + S) }));
  check(good.statusCode === 200, "верная подпись оповещения принята");
  check(good.body === "OK " + md5(id + S), "ответ PayKeeper корректный", good.body);

  const forged = await webhook(ev({ id, sum, clientid, orderid, key: "деадбиф" }));
  check(forged.statusCode === 401, "поддельное оповещение отклонено");

  const noKey = await webhook(ev({ id, sum, clientid, orderid }));
  check(noKey.statusCode === 401, "оповещение без подписи отклонено");

  /* ── notify: заказ «при получении» попадает в бот ── */
  const jsonEv = (obj) => ({ body: JSON.stringify(obj), isBase64Encoded: false });
  const okNotify = await notify(
    { orderId: "ORD-RECEIPT1", payment: "payment_on_receipt", managerText: "Состав: 1. Камелия — 4 300 ₽" },
    "https://paloma.website",
  );
  check(okNotify.statusCode === 200, "notify «при получении» принят");

  const emptyNotify = await notify({ orderId: "ORD-RECEIPT1", managerText: "" }, "https://paloma.website");
  check(emptyNotify.statusCode === 400, "notify без текста отклонён");

  const badIdNotify = await notify({ orderId: "x", managerText: "текст" }, "https://paloma.website");
  check(badIdNotify.statusCode === 400, "notify с кривым номером отклонён");
  void jsonEv;

  console.log(bad === 0 ? "\nВсе проверки прошли." : `\nПРОВАЛЕНО: ${bad}`);
  process.exit(bad === 0 ? 0 : 1);
})();
