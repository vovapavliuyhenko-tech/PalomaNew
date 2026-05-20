import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const htmlFiles = fs
  .readdirSync(root)
  .filter((f) => f.endsWith(".html") && !f.startsWith("."));

const CART_ICON_BTN = `<button type="button" class="site-header__icon site-header__icon--cart site-header__cart"
        id="cartOpenBtn" data-cart-open
        aria-label="Корзина" aria-expanded="false" aria-controls="cartDrawer" data-cursor="hover">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 8h14l-1 12H6L5 8zM9 8V5a3 3 0 016 0v3"/></svg>
            <span class="site-header__cart-count site-header__badge cart-count" id="cartCount" data-cart-count style="display:none" aria-hidden="true">0</span>
          </button>`;

const CART_ICON_LINK = `<a href="cart.html" class="site-header__icon site-header__icon--cart site-header__cart"
        aria-label="Корзина" aria-current="page" data-cursor="hover">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 8h14l-1 12H6L5 8zM9 8V5a3 3 0 016 0v3"/></svg>
            <span class="site-header__cart-count site-header__badge cart-count" id="cartCount" data-cart-count style="display:none" aria-hidden="true">0</span>
          </a>`;

const CART_ICON_OLD =
  /<a href="cart\.html" class="site-header__icon site-header__icon--cart site-header__cart"[^>]*>[\s\S]*?<\/a>/;

const DRAWER_OLD =
  /<div class="cart-drawer" id="cartDrawer"[\s\S]*?<\/aside>\s*<\/div>/;

const DRAWER_NEW = `<!-- ── CART DRAWER ── -->
  <div class="cart-drawer" id="cartDrawer"
       aria-label="Корзина" aria-hidden="true"
       role="dialog" hidden>
    <div class="cart-drawer__backdrop"
         id="cartDrawerBackdrop"
         aria-hidden="true"></div>
    <div class="cart-drawer__panel">
      <div class="cart-drawer__header">
        <h2 class="cart-drawer__title">Корзина</h2>
        <button type="button" class="cart-drawer__close"
                id="cartDrawerClose"
                data-cart-close
                aria-label="Закрыть корзину" data-cursor="hover">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="cart-drawer__empty" id="cartDrawerEmpty">
        <div class="cart-drawer__empty-icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1" aria-hidden="true">
            <path d="M5 8h14l-1 12H6L5 8zM9 8V5a3 3 0 016 0v3"/>
          </svg>
        </div>
        <p class="cart-drawer__empty-title">Корзина пуста</p>
        <p class="cart-drawer__empty-text">Добавьте букет, кофе или подарок</p>
        <a href="catalog.html"
           class="btn btn--dark cart-drawer__empty-cta"
           data-cart-close>Перейти в каталог</a>
      </div>
      <div class="cart-drawer__body" id="cartDrawerBody" hidden>
        <div class="cart-drawer__list" id="cartDrawerList"
             aria-label="Товары в корзине"></div>
        <div class="cart-drawer__footer">
          <div class="cart-drawer__total-row">
            <span class="cart-drawer__total-label">Итого</span>
            <span class="cart-drawer__total-val" id="cartDrawerTotal">0 ₽</span>
          </div>
          <a href="cart.html"
             class="btn btn--dark cart-drawer__checkout"
             aria-label="Перейти к оформлению заказа">Оформить заказ</a>
          <button type="button" class="cart-drawer__continue"
                  data-cart-close
                  aria-label="Продолжить покупки">Продолжить покупки</button>
        </div>
      </div>
    </div>
  </div>`;

let patched = 0;

for (const file of htmlFiles) {
  if (file === "order.html") continue;
  let html = fs.readFileSync(path.join(root, file), "utf8");
  let changed = false;

  if (!html.includes('href="cart.css"') && html.includes('href="styles.css"')) {
    html = html.replace(
      '<link rel="stylesheet" href="styles.css">',
      '<link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="cart.css">',
    );
    changed = true;
  }

  if (
    html.includes('<script src="script.js"></script>') &&
    !html.includes('<script src="cart-core.js"></script>')
  ) {
    html = html.replace(
      '<script src="script.js"></script>',
      '<script src="cart-core.js"></script>\n  <script src="script.js"></script>',
    );
    changed = true;
  }

  if (file === "cart.html") {
    if (CART_ICON_OLD.test(html)) {
      html = html.replace(CART_ICON_OLD, CART_ICON_LINK);
      changed = true;
    }
  } else if (CART_ICON_OLD.test(html)) {
    html = html.replace(CART_ICON_OLD, CART_ICON_BTN);
    changed = true;
  }

  if (file !== "cart.html" && DRAWER_OLD.test(html)) {
    html = html.replace(DRAWER_OLD, DRAWER_NEW);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(path.join(root, file), html);
    patched++;
    console.log("patched", file);
  }
}

console.log("done", patched);
