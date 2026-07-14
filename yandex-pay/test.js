/* Проверка прайс-гарда без обращения к Яндексу: node yandex-pay/test.js */
"use strict";

const { _verifyCart: verify } = require("./index.js");

const cases = [
  ["букет по каталогу (Камелия M = 3500 + 800)", { items: [{ id: "c1-M", name: "Камелия", price: 4300, qty: 1 }], delivery: 350 }, true],
  ["букет с допами (3500 + XL 2800 + открытка/ваза/кофе 1870)", { items: [{ id: "c1-XL-card_vase_coffee", name: "Камелия", price: 8170, qty: 1 }], delivery: 0 }, true],
  ["подмена цены букета на 100 ₽", { items: [{ id: "c1-M", name: "Камелия", price: 100, qty: 1 }], delivery: 0 }, false],
  ["цена выше максимума каталога", { items: [{ id: "c1-M", name: "Камелия", price: 99999, qty: 1 }], delivery: 0 }, false],
  ["несуществующий товар c999", { items: [{ id: "c999-M", name: "Фейк", price: 3000, qty: 1 }], delivery: 0 }, false],
  ["апселл — ваза 1500", { items: [{ id: "upsell-vase", name: "Ваза", price: 1500, qty: 1 }], delivery: 0 }, true],
  ["апселл — ваза за 10 ₽", { items: [{ id: "upsell-vase", name: "Ваза", price: 10, qty: 1 }], delivery: 0 }, false],
  ["доставка не из прайса (1 ₽)", { items: [{ id: "c1-M", name: "Камелия", price: 4300, qty: 1 }], delivery: 1 }, false],
  ["отрицательное количество", { items: [{ id: "c1-M", name: "Камелия", price: 4300, qty: -3 }], delivery: 0 }, false],
];

let bad = 0;
cases.forEach(([name, body, shouldPass]) => {
  const r = verify(body);
  const passed = !r.error;
  const ok = passed === shouldPass;
  if (!ok) bad++;
  console.log(`${ok ? "✓" : "✗"} ${name}${r.error ? " → " + r.error : " → сумма " + r.total + " ₽"}`);
});

/* кофе: цена берётся из реального меню */
const coffee = (global.window.PALOMA_COFFEE_MENU || [])[0];
if (coffee) {
  const r1 = verify({ items: [{ id: coffee.id, name: coffee.title, price: coffee.price, qty: 1 }], delivery: 0 });
  const r2 = verify({ items: [{ id: coffee.id, name: coffee.title, price: 1, qty: 1 }], delivery: 0 });
  console.log(`${!r1.error ? "✓" : "✗"} кофе «${coffee.title}» по цене меню (${coffee.price} ₽)`);
  console.log(`${r2.error ? "✓" : "✗"} кофе «${coffee.title}» за 1 ₽ → ${r2.error || "ПРОПУЩЕН!"}`);
  if (r1.error || !r2.error) bad++;
}

console.log(bad === 0 ? "\nВсе проверки прошли." : `\nПРОВАЛЕНО: ${bad}`);
process.exit(bad === 0 ? 0 : 1);
