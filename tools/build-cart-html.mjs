import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let html = fs.readFileSync(path.join(root, "catalog.html"), "utf8");

html = html
  .replace(
    "<title>PALOMA — Каталог</title>",
    "<title>Корзина — PALOMA Flowers Coffee You</title>",
  )
  .replace(
    'content="Каталог PALOMA: букеты, композиции, сезонная витрина и подарки. Новороссийск."',
    'content="Корзина PALOMA: букеты, кофе и подарки. Новороссийск."',
  )
  .replace("<body>", '<body class="cart-page">')
  .replace(
    'id="catalogNavTriggerCatalog"',
    'id="catalogNavTriggerCart"',
  )
  .replace(
    'aria-labelledby="catalogNavTriggerCatalog"',
    'aria-labelledby="catalogNavTriggerCart"',
  );

const CART_ICON_LINK = `<a href="cart.html" class="site-header__icon site-header__icon--cart site-header__cart"
        aria-label="Корзина" aria-current="page" data-cursor="hover">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 8h14l-1 12H6L5 8zM9 8V5a3 3 0 016 0v3"/></svg>
            <span class="site-header__cart-count site-header__badge cart-count" id="cartCount" data-cart-count style="display:none" aria-hidden="true">0</span>
          </a>`;

html = html.replace(
  /<a href="cart\.html" class="site-header__icon site-header__icon--cart site-header__cart"[\s\S]*?<\/a>/,
  CART_ICON_LINK,
);

const mainNew = `  <main class="cart-main" id="main" aria-label="Корзина">

    <nav class="catalog-breadcrumbs" aria-label="Хлебные крошки">
      <div class="catalog-breadcrumbs__inner">
        <ol class="catalog-breadcrumbs__list">
          <li><a href="index.html">Главная</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">Корзина</li>
        </ol>
      </div>
    </nav>

    <div class="cart-page-empty" id="cartPageEmpty" hidden>
      <div class="cart-page-empty__inner">
        <div class="cart-page-empty__icon" aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1" aria-hidden="true">
            <path d="M5 8h14l-1 12H6L5 8zM9 8V5a3 3 0 016 0v3"/>
          </svg>
        </div>
        <h1 class="cart-page-empty__title">Корзина пуста</h1>
        <p class="cart-page-empty__text">
          Добавьте букеты, кофе или подарки из каталога
        </p>
        <a href="catalog.html" class="btn btn--dark cart-page-empty__cta">
          Перейти в каталог
        </a>
      </div>
    </div>

    <div class="cart-page-content" id="cartPageContent" hidden>
      <div class="cart-page-inner">
        <div class="cart-page-header">
          <h1 class="cart-page-title">Корзина</h1>
          <p class="cart-page-count" id="cartPageCount" aria-live="polite"></p>
        </div>
        <div class="cart-page-layout">
          <div class="cart-page-left">
            <div class="cart-page__list" id="cartPageList"
                 aria-label="Товары в корзине"></div>
            <section class="cart-addons" aria-label="Рекомендации">
              <h2 class="cart-addons__title">Идеально дополнят ваш выбор</h2>
              <div class="cart-addons__grid" id="cartAddonsGrid"></div>
            </section>
          </div>
          <aside class="cart-page-summary" id="cartPageSummary" aria-label="Итог заказа">
            <h2 class="cart-page-summary__title">Итог</h2>
            <div class="cart-page-summary__rows">
              <div class="cart-page-summary__row">
                <span>Товары</span>
                <span id="cartPageSubtotal">0 ₽</span>
              </div>
              <div class="cart-page-summary__row cart-page-summary__row--delivery">
                <span>Доставка</span>
                <span>Уточняется</span>
              </div>
              <div class="cart-page-summary__row cart-page-summary__row--total">
                <span>Итого</span>
                <span id="cartPageTotal" class="cart-page-summary__total">0 ₽</span>
              </div>
            </div>
            <a href="checkout.html"
               class="btn btn--dark cart-page-summary__checkout"
               id="cartCheckoutBtn"
               aria-label="Перейти к оформлению заказа">Оформить заказ</a>
            <div class="cart-page-summary__meta">
              <p>Доставка по Новороссийску. Самовывоз — Энгельса, 74.</p>
              <p>Интервалы: 9:30–12:30, 12:00–15:00, 15:00–18:00, 18:00–22:00.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>

  </main>`;

html = html.replace(/<main id="main" class="catalog-page">[\s\S]*?<\/main>/, mainNew);

html = html.replace(
  /<div class="cart-drawer" id="cartDrawer"[\s\S]*?<\/aside>\s*<\/div>\s*/,
  "",
);

html = html.replace(
  /<script src="paloma-products\.js"><\/script>\s*<script src="catalog-data\.js"><\/script>\s*<script src="script\.js"><\/script>\s*<script src="wishlist\.js"><\/script>\s*<script src="catalog\.js"><\/script>/,
  `<script src="paloma-products.js"></script>
  <script src="catalog-data.js"></script>
  <script src="cart-core.js"></script>
  <script src="script.js"></script>
  <script src="wishlist.js"></script>
  <script src="cart-page.js"></script>`,
);

fs.writeFileSync(path.join(root, "cart.html"), html);
console.log("cart.html written");
