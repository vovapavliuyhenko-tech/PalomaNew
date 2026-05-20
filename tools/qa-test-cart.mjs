import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import vm from "vm";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const storage = new Map();

const localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
};

const document = {
  querySelectorAll: () => [],
  getElementById: () => null,
  body: { classList: { contains: () => false, add: () => {}, remove: () => {} } },
  dispatchEvent: () => true,
  addEventListener: () => {},
  readyState: "complete",
};

const window = { localStorage, document, PALOMA_CATALOG: null };

const wrapped = fs
  .readFileSync(path.join(root, "cart-core.js"), "utf8")
  .replace(
    /if \(document\.readyState === "loading"\) \{[\s\S]*?\} else \{\s*init\(\);\s*\}/,
    "/* init skipped in QA */",
  );

vm.runInNewContext(wrapped, { window, document, console });
const Cart = window.PalomaCart;

const tests = [];
const t = (name, fn) => {
  try {
    fn();
    tests.push({ name, ok: true });
  } catch (e) {
    tests.push({ name, ok: false, err: e.message });
  }
};

Cart.emptyCart();
t("add", () => {
  Cart.add({ id: "c1", name: "Букет", price: 1000, qty: 1, slug: "test" });
  if (Cart.getItems().length !== 1) throw new Error("len");
});
t("qty merge", () => {
  Cart.add({ id: "c1", name: "Букет", price: 1000, qty: 1 });
  if (Cart.getItems()[0].qty !== 2) throw new Error("qty");
});
t("remove via dec", () => {
  Cart.bumpQtyById("c1", -2);
  if (Cart.getItems().length) throw new Error("empty");
});
t("total", () => {
  Cart.add({ id: "x", name: "X", price: 500, qty: 2 });
  if (Cart.calcTotal() !== 1000) throw new Error("sum");
  Cart.removeById("x");
});

const failed = tests.filter((x) => !x.ok);
console.log({ ok: !failed.length, tests });
process.exit(failed.length ? 1 : 0);
