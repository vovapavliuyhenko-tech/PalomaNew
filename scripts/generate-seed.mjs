/** Генерирует database/seed.sql — 48 товаров PALOMA (этап 2). Запуск: node scripts/generate-seed.mjs */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function uuid(seed) {
  const h = crypto.createHash("md5").update(seed).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const cats = [
  { key: "bukety", name: "Букеты", n: 7 },
  { key: "monobuket", name: "Монобукеты", n: 5 },
  { key: "v-korobke", name: "Цветы в коробке", n: 4 },
  { key: "piony", name: "Пионы", n: 3 },
  { key: "rozy", name: "Розы", n: 4 },
  { key: "sezonnie", name: "Сезонные", n: 4 },
  { key: "segodnya", name: "Готовые сегодня", n: 4 },
  { key: "vazy", name: "Вазы", n: 5 },
  { key: "otkritki", name: "Открытки", n: 3 },
  { key: "kofe", name: "Кофе", n: 5 },
  { key: "vypechka", name: "Выпечка", n: 4 },
];

const imgs = [
  "https://images.unsplash.com/photo-1487530811015-780780169993?w=800&q=80",
  "https://images.unsplash.com/photo-1490750967868-88df5691cc28?w=800&q=80",
  "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&q=80",
  "https://images.unsplash.com/photo-1584553391547-07fb6a31d46c?w=800&q=80",
  "https://images.unsplash.com/photo-1559181567-c3190ca9be3b?w=800&q=80",
  "https://images.unsplash.com/photo-1515825838458-f2a6689f0474?w=800&q=80",
];

function slugifyNm(base, cat, i) {
  const p = `${base}-${cat}-${i}`.toLowerCase();
  return p
    .replace(/ё/g, "e")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const names = {
  bukety: (i) =>
    [`Авторский букет «Утро моря» №${i}`, `Композиция «Цветущий сад» №${i}`, `Букет «Нежность» №${i}`][i % 3],
  monobuket: (i) =>
    [`Монобукет «Одна история» №${i}`, `Монохромный «Тишина» №${i}`, `Один вид «Чистота» №${i}`][i % 3],
  "v-korobke": (i) =>
    [`Коробочная сборка «Пудра» №${i}`, `Коробка с цветами «Лён» №${i}`][i % 2],
  piony: (i) => [`Пионы «Облако» №${i}`, `Пионовый акцент №${i}`][i % 2],
  rozy: (i) => [`Розы премиум «Шёлк» №${i}`, `Розовая линия «Классика» №${i}`][i % 2],
  sezonnie: (i) => [`Сезонный авторский №${i}`, `Сборка по сезону №${i}`][i % 2],
  segodnya: (i) => [`Готов сегодня — свежая сборка ${i}`, `Сегодня в студии №${i}`][i % 2],
  vazy: (i) =>
    [`Керамическая ваза №${i}`, `Стеклянная колба «Тон» №${i}`, `Ваза к букету №${i}`][i % 3],
  otkritki: (i) => [`Открытка паломная №${i}`, `Конверт PALOMA №${i}`][i % 2],
  kofe: (i) => [`Эспрессо PALOMA №${i}`, `Капучино «Молочный шёлк» №${i}`, `Флэт уайт №${i}`][i % 3],
  vypechka: (i) =>
    [`Круассан сливочный №${i}`, `Улитка корица №${i}`, `Пирожное паломское №${i}`][i % 3],
};

const catIds = Object.fromEntries(cats.map((c) => [`cat:${c.key}`, uuid(`cat:${c.key}`)]));

function esc(s) {
  return s.replace(/'/g, "''");
}

const prodRows = [];
const imgRows = [];
let prodOrder = 0;

for (const c of cats) {
  const catId = catIds[`cat:${c.key}`];
  const ready = c.key === "segodnya";
  const fn = names[c.key] ?? ((/** @type {number} */ x) => `Товар №${x}`);

  for (let i = 1; i <= c.n; i++) {
    prodOrder += 1;
    const pname = typeof fn === "function" ? fn(i) : `Товар №${i}`;
    const slug =
      slugifyNm(pname.replace(/ №\d+/, "").replace(/\s+/g, "-").slice(0, 40), c.key, i) + `-${prodOrder}`;
    const pkey = `prod:${slug}`;
    const pid = uuid(pkey);
    const price =
      c.key === "kofe" || c.key === "vypechka" || c.key === "otkritki"
        ? 180 + (prodOrder % 17) * 40
        : c.key === "vazy"
          ? 1200 + (prodOrder % 21) * 180
          : 2200 + (prodOrder % 31) * 220;
    const comp =
      c.key === "vazy"
        ? "Керамика / стекло. Подойдёт к среднему и высокому букету."
        : "Состав подбираем из свежего сезона. По запросу согласуем палитру персонально.";

    prodRows.push(
      `(${[
        `'${pid}'`,
        `'${catId}'`,
        `'${esc(pname)}'`,
        `'${esc(slug)}'`,
        `'${esc(
          "Плейсхолдер описания PALOMA. Фото перед отправкой. Свежие сезонные цветы. Доставка день-в-день по городам на странице доставки."
        )}'`,
        String(price),
        `'${esc(comp)}'`,
        `'${esc(
          "Смена воды ежедневно · подрезать стебли под углом · без сквозняков и без фруктов рядом с букетом"
        )}'`,
        `'${esc(
          "Новороссийск, Геленджик и Анапа — уточните интервал в оформлении заказа."
        )}'`,
        `true`,
        `${ready}`,
        String(prodOrder),
      ].join(",")})`
    );

    const iid = uuid(`img:${slug}`);
    const url = imgs[prodOrder % imgs.length];
    imgRows.push(`('${iid}','${pid}','${url}',1,'${esc(pname)}')`);
  }
}

let catOrd = 0;
const catVals = cats
  .map((c) => {
    catOrd++;
    const id = catIds[`cat:${c.key}`];
    const d = imgs[(catOrd - 1) % imgs.length];
    return `('${id}', '${esc(c.name)}', '${esc(c.key)}', '${esc(`PALOMA · раздел «${c.name}»`)}', '${d}', ${catOrd - 1}, true)`;
  })
  .join(",\n");

const sql =
  `-- Автоматически: node scripts/generate-seed.mjs — ${prodRows.length} товаров, ${cats.length} категорий
BEGIN;

DELETE FROM product_images;
DELETE FROM product_options;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cafe_items;
DELETE FROM subscription_orders;
DELETE FROM event_requests;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM delivery_settings;
DELETE FROM admin_users WHERE true;

INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active) VALUES
${catVals};

INSERT INTO products (id, category_id, name, slug, description, price, composition, care_instructions, delivery_info, is_available, is_ready_today, display_order)
VALUES
${prodRows.join(",\n")};

INSERT INTO product_images (id, product_id, image_url, display_order, alt_text) VALUES
${imgRows.join(",\n")};

INSERT INTO delivery_settings (city, free_delivery_threshold, paid_delivery_cost, is_active) VALUES
('Новороссийск', 5000, 350, true),
('Геленджик', 5000, 500, true),
('Анапа', 5000, 550, true);

INSERT INTO cafe_items (name, category, description, price, image_url, is_available, display_order) VALUES
('Эспрессо', 'coffee', 'Обжарка недели PALOMA', 180, '${imgs[0]}', true, 1),
('Капучино', 'coffee', 'Молоко и два шота', 250, '${imgs[1]}', true, 2),
('Круассан', 'pastry', 'Сливочный, из печи', 220, '${imgs[4]}', true, 10);

COMMIT;
`;

fs.writeFileSync(path.join(__dirname, "..", "database", "seed.sql"), sql, "utf8");
console.log(`OK: database/seed.sql (${prodRows.length} products)`);
