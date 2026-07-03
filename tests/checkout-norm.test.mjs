/* Извлекаем реальную normContact из checkout.js и проверяем контракт
   (валидация/нормализация контакта мессенджера). Без дублирования логики. */
import { readFileSync } from "node:fs";
import assert from "node:assert";

const src = readFileSync(new URL("../checkout.js", import.meta.url), "utf8");
const start = src.indexOf("function normContact");
assert(start !== -1, "normContact не найдена в checkout.js");
let i = src.indexOf("{", start), depth = 0, end = -1;
for (; i < src.length; i++) {
  if (src[i] === "{") depth++;
  else if (src[i] === "}" && --depth === 0) { end = i + 1; break; }
}
const normContact = new Function(src.slice(start, end) + "\nreturn normContact;")();

const cases = [
  ["telegram", "@paloma_shop", true, "@paloma_shop"],
  ["telegram", "paloma_shop", true, "@paloma_shop"],
  ["telegram", "+7 999 000-00-00", true, "+79990000000"],
  ["telegram", "no", false],
  ["telegram", "", false],
  ["whatsapp", "+7 (999) 000-00-00", true, "+79990000000"],
  ["whatsapp", "89990000000", true, "+89990000000"],
  ["whatsapp", "12345", false],
  ["max", "@maxuser", true, "@maxuser"],
  ["max", "+79990000000", true, "+79990000000"],
  ["max", "ab", false],
];
let ok = 0;
for (const [k, inp, okExp, valExp] of cases) {
  const r = normContact(k, inp);
  assert.strictEqual(r.ok, okExp, `ok(${k},"${inp}") = ${r.ok}, ждали ${okExp}`);
  if (okExp) assert.strictEqual(r.value, valExp, `value(${k},"${inp}") = ${r.value}, ждали ${valExp}`);
  ok++;
}
console.log(`OK — ${ok}/${cases.length} кейсов normContact прошли`);
