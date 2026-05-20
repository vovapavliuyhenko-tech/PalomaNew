import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "..", "catalog.html");
let html = fs.readFileSync(file, "utf8");

const mainStart = html.indexOf('<main id="main" class="catalog-page">');
const mainEnd = html.indexOf("</main>", mainStart);
if (mainStart < 0 || mainEnd < 0) {
  console.error("main block not found");
  process.exit(1);
}

const newMain = `<main id="main" class="catalog-page">

  <nav class="catalog-breadcrumbs" aria-label="Хлебные крошки">
    <div class="catalog-breadcrumbs__inner">
      <ol class="catalog-breadcrumbs__list">
        <li><a href="index.html">Главная</a></li>
        <li aria-hidden="true">/</li>
        <li><span aria-current="page">Каталог</span></li>
      </ol>
    </div>
  </nav>

  <div class="catalog-hero">
    <div class="catalog-hero__inner">
      <h1 class="catalog-hero__title">Каталог</h1>
    </div>
  </div>

  <div class="catalog-filters-wrap" id="catalogFiltersWrap">
    <div class="catalog-filters" id="catalogFilters" role="group" aria-label="Фильтры каталога">
      <button type="button" class="catalog-filter-btn is-active" data-filter="all" aria-pressed="true">Все</button>
      <button type="button" class="catalog-filter-btn" data-filter="online" aria-pressed="false">Онлайн-витрина</button>
      <button type="button" class="catalog-filter-btn" data-filter="season" aria-pressed="false">Самый сезон</button>
      <button type="button" class="catalog-filter-btn" data-filter="bestsellers" aria-pressed="false">Бестселлеры</button>
      <button type="button" class="catalog-filter-btn" data-filter="compositions" aria-pressed="false">Композиции</button>
      <button type="button" class="catalog-filter-btn" data-filter="mono" aria-pressed="false">Моно</button>
      <button type="button" class="catalog-filter-btn" data-filter="wedding" aria-pressed="false">Свадебные</button>
      <button type="button" class="catalog-filter-btn" data-filter="vases" aria-pressed="false">Вазы и подарки</button>
      <button type="button" class="catalog-filter-btn" data-filter="subscription" aria-pressed="false">Подписка</button>
      <button type="button" class="catalog-filter-btn" data-filter="events" aria-pressed="false">Оформление</button>
    </div>
  </div>

  <div class="catalog-count" id="catalogCount" aria-live="polite"></div>

  <div class="catalog-grid" id="catalogGrid" aria-label="Товары каталога"></div>

  <div class="catalog-empty" id="catalogEmpty" hidden aria-live="polite">
    <p>В этой категории пока нет товаров.</p>
    <button type="button" class="btn btn--dark" data-filter="all" id="catalogResetBtn">Показать все</button>
  </div>

</main>`;

html =
  html.slice(0, mainStart) +
  newMain.replace(/<motion\.div/g, "<div").replace(/<\/motion\.div>/g, "</div>") +
  html.slice(mainEnd + "</main>".length);

if (!html.includes('href="catalog.css"')) {
  html = html.replace(
    '<link rel="stylesheet" href="styles.css">',
    '<link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="catalog.css">',
  );
}

html = html.replace(
  /<script src="paloma-products\.js"><\/script>\s*<script src="script\.js"><\/script>/,
  `<script src="paloma-products.js"></script>
  <script src="catalog-data.js"></script>
  <script src="script.js"></script>
  <script src="catalog.js"></script>`,
);

fs.writeFileSync(file, html);
console.log("catalog.html patched");
