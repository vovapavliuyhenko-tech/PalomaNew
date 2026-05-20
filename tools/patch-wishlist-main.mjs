import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "wishlist.html",
);
let html = fs.readFileSync(file, "utf8");

const mainStart = html.indexOf('<main id="main"');
const mainEnd = html.indexOf("</main>", mainStart);
if (mainStart < 0) {
  console.error("main not found");
  process.exit(1);
}

const newMain = `<main id="main" class="wishlist-main" aria-label="Избранное">

    <nav class="catalog-breadcrumbs" aria-label="Хлебные крошки">
      <div class="catalog-breadcrumbs__inner">
        <ol class="catalog-breadcrumbs__list">
          <li><a href="index.html">Главная</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">Избранное</li>
        </ol>
      </div>
    </nav>

    <div class="wishlist-hero">
      <div class="wishlist-hero__inner">
        <h1 class="wishlist-hero__title">Избранное</h1>
        <p class="wishlist-hero__count" id="wishlistHeroCount" aria-live="polite"></p>
      </div>
    </div>

    <div class="catalog-grid" id="wishlistGrid" aria-label="Избранные товары" hidden></motion.div>

    <div class="wishlist-empty" id="wishlistEmpty" hidden aria-live="polite">
      <div class="wishlist-empty__icon" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1" aria-hidden="true">
          <path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z"/>
        </svg>
      </div>
      <h2 class="wishlist-empty__title">В избранном пока пусто</h2>
      <p class="wishlist-empty__text">
        Нажмите на сердечко на карточке товара,<br>
        чтобы сохранить букет.
      </p>
      <a href="catalog.html" class="btn btn--dark wishlist-empty__cta">Перейти в каталог</a>
    </div>

  </main>`.replace(/<\/motion\.div>/g, "</div>");

html = html.slice(0, mainStart) + newMain + html.slice(mainEnd + "</main>".length);

if (!html.includes("catalog.css")) {
  html = html.replace(
    '<link rel="stylesheet" href="styles.css">',
    '<link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="catalog.css">',
  );
}

fs.writeFileSync(file, html);
console.log("wishlist.html main patched");
