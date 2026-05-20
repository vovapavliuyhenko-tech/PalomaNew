import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "..", "product.html");
let html = fs.readFileSync(file, "utf8");

const mainStart = html.indexOf('<main id="main"');
const mainEnd = html.indexOf("</main>", mainStart);
if (mainStart < 0 || mainEnd < 0) {
  console.error("main not found");
  process.exit(1);
}

const newMain = `<main id="main" class="pdp" id="pdpMain" aria-label="Страница товара">

    <nav class="pdp-breadcrumbs" aria-label="Хлебные крошки">
      <div class="pdp-breadcrumbs__inner">
        <ol class="pdp-breadcrumbs__list">
          <li><a href="index.html">Главная</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="catalog.html">Каталог</a></li>
          <li aria-hidden="true">/</li>
          <li id="pdpBreadcrumbCat">
            <a href="#" id="pdpBreadcrumbCatLink">Категория</a>
          </li>
          <li aria-hidden="true">/</li>
          <li id="pdpBreadcrumbName" aria-current="page">Товар</li>
        </ol>
      </div>
    </nav>

    <div class="pdp-layout">

      <div class="pdp-gallery" id="pdpGallery">
        <div class="pdp-gallery__main" id="pdpGalleryMain">
          <div class="pdp-gallery__main-ph" id="pdpMainPh" aria-hidden="true"></div>
          <img class="pdp-gallery__main-img" id="pdpMainImg" src="" alt="" loading="eager">
        </div>
        <div class="pdp-gallery__thumbs" id="pdpThumbs" role="group" aria-label="Галерея фотографий"></div>
      </div>

      <div class="pdp-info">
        <p class="pdp-info__cat" id="pdpCat"></p>
        <h1 class="pdp-info__name" id="pdpName"></h1>
        <p class="pdp-info__price" id="pdpPrice"></p>

        <div class="pdp-info__row" id="pdpCompositionRow">
          <span class="pdp-info__row-label">Состав</span>
          <span class="pdp-info__row-val" id="pdpComposition"></span>
        </div>

        <div class="pdp-sizes" id="pdpSizes" hidden>
          <span class="pdp-sizes__label">Размер</span>
          <div class="pdp-sizes__btns" id="pdpSizeBtns" role="group" aria-label="Выбор размера"></div>
        </div>

        <p class="pdp-info__desc" id="pdpDesc"></p>

        <div class="pdp-actions">
          <div class="pdp-qty" role="group" aria-label="Количество">
            <button type="button" class="pdp-qty__btn pdp-qty__btn--dec" id="pdpQtyDec" aria-label="Уменьшить количество">
              <svg width="14" height="14" viewBox="0 0 14 2" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M1 1h12"/></svg>
            </button>
            <span class="pdp-qty__val" id="pdpQtyVal" aria-live="polite" aria-atomic="true">1</span>
            <button type="button" class="pdp-qty__btn pdp-qty__btn--inc" id="pdpQtyInc" aria-label="Увеличить количество">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 1v12M1 7h12"/></svg>
            </button>
          </div>
          <button type="button" class="btn btn--dark pdp-actions__cart" id="pdpAddToCart" aria-label="Добавить в корзину">В корзину</button>
          <button type="button" class="pdp-actions__wish" id="pdpWishlist" aria-label="Добавить в избранное" aria-pressed="false">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z"/>
            </svg>
          </button>
        </div>

        <div class="pdp-toast" id="pdpToast" role="status" aria-live="polite" hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>
          <span id="pdpToastText">Добавлено в корзину</span>
        </div>

        <details class="pdp-accordion" id="pdpAccordion">
          <summary class="pdp-accordion__trigger">
            <span>Что идёт к букету</span>
            <svg class="pdp-accordion__icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 5l6 6 6-6"/></svg>
          </summary>
          <div class="pdp-accordion__body">
            <p class="pdp-accordion__intro">К каждому букету мы добавляем аккуратную упаковку, фирменную ленту и рекомендации по уходу. По запросу отправим фото перед доставкой.</p>
            <ul class="pdp-accordion__list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Фирменная упаковка PALOMA</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Фирменная лента</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Открытка с вашим текстом</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Фото перед доставкой — по запросу</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Инструкция по уходу за букетом</li>
            </ul>
          </div>
        </details>

        <div class="pdp-delivery">
          <div class="pdp-delivery__item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 7h13v10H3zM16 10h4l2 3v4h-6z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>
            <span>Доставка по Новороссийску</span>
          </div>
          <div class="pdp-delivery__item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 10H3M3 10l4-4M3 10l4 4"/></svg>
            <span>Самовывоз — Энгельса, 74</span>
          </div>
        </div>
      </div>

    </div>

    <section class="pdp-addons" id="pdpAddons" aria-label="Идеально подойдёт к этому товару">
      <div class="pdp-addons__inner">
        <h2 class="pdp-addons__title">Идеально подойдёт к этому товару</h2>
        <div class="pdp-addons__grid" id="pdpAddonsGrid"></div>
      </div>
    </section>

    <div class="pdp-not-found" id="pdpNotFound" hidden aria-label="Товар не найден">
      <h1 class="pdp-not-found__title">Товар не найден</h1>
      <p class="pdp-not-found__text">Возможно, он был удалён или адрес введён неверно.</p>
      <a href="catalog.html" class="btn btn--dark">Вернуться в каталог</a>
    </div>

  </main>`;

let mainHtml = newMain
  .replace(/<motion\.div/g, "<div")
  .replace(/<\/motion\.motion.div>/g, "</div>")
  .replace(/<\/motion\.motion.div>/g, "</div>")
  .replace(/<\/motion\.div>/g, "</div>");

mainHtml = mainHtml.replace(
  '<main id="main" class="pdp" id="pdpMain"',
  '<main id="pdpMain" class="pdp product-page"',
);

html = html.slice(0, mainStart) + mainHtml + html.slice(mainEnd + "</main>".length);

html = html.replace(
  /<body>/,
  '<body class="product-page">',
);

html = html.replace(
  /<script src="paloma-products\.js"><\/script>\s*<script src="script\.js"><\/script>/,
  `<script src="paloma-products.js"></script>
  <script src="catalog-data.js"></script>
  <script src="script.js"></script>`,
);

fs.writeFileSync(file, html);
console.log("product.html patched");
