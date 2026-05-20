import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cart = fs.readFileSync(path.join(root, "cart.html"), "utf8");

const shellStart = cart.indexOf('<a href="#main"');
const mainStart = cart.indexOf("<main");
const footerStart = cart.indexOf("<footer");
let shell = cart.slice(shellStart, mainStart);
const tail = cart.slice(footerStart);

shell = shell
  .replace(/aria-current="page"/g, "")
  .replace(/catalogNavTriggerCart/g, "catalogNavTriggerCheckout")
  .replace(
    /<a href="cart\.html" class="site-header__icon site-header__icon--cart site-header__cart"[\s\S]*?<\/a>/,
    `<button type="button" class="site-header__icon site-header__icon--cart site-header__cart"
        id="cartOpenBtn" data-cart-open
        aria-label="Корзина" aria-expanded="false" data-cursor="hover">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 8h14l-1 12H6L5 8zM9 8V5a3 3 0 016 0v3"/></svg>
            <span class="site-header__cart-count site-header__badge cart-count" id="cartCount" data-cart-count style="display:none" aria-hidden="true">0</span>
          </button>`,
  );

const checkoutMain = fs.readFileSync(
  path.join(root, "partials", "checkout-main.html"),
  "utf8",
);
const thankYouMain = fs.readFileSync(
  path.join(root, "partials", "thank-you-main.html"),
  "utf8",
);

const headBase = cart.slice(0, shellStart);
const loaderBlock = cart.slice(
  cart.indexOf('<motion class="paloma-loader"'),
  cart.indexOf("<motion class=\"site-top\""),
).replace(/<\/?motion/g, (t) => t.replace("motion", "motion"));

function buildPage({ title, desc, bodyClass, extraCss, main, scripts }) {
  let head = headBase
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta name="description" content="[^"]*">/,
      desc ? `<meta name="description" content="${desc}">` : "",
    )
    .replace("<body class=\"cart-page\">", `<body class="${bodyClass}">`)
    .replace("<body>", `<body class="${bodyClass}">`);

  if (!head.includes('meta name="robots"')) {
    head = head.replace(
      "<meta name=\"theme-color\"",
      '<meta name="robots" content="noindex">\n  <meta name="theme-color"',
    );
  }

  if (extraCss && !head.includes(extraCss)) {
    head = head.replace(
      '<link rel="stylesheet" href="cart.css">',
      `<link rel="stylesheet" href="cart.css">\n  <link rel="stylesheet" href="${extraCss}">`,
    );
  }

  const loader = cart.includes("paloma-loader")
    ? cart.slice(
        cart.indexOf('<div class="paloma-loader"'),
        cart.indexOf('<div class="site-top"'),
      )
    : "";

  return `<!DOCTYPE html>
<html lang="ru">
${head.split("<html lang=\"ru\">")[1] || head}
${loader}
${shell}
${main}
${tail.replace(
  /<script[\s\S]*<\/body>/,
  `${scripts}
</body>`,
)}`;
}

const checkoutHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#FBF6E8">
  <title>Оформление заказа — PALOMA</title>
  <meta name="description" content="Оформление заказа PALOMA: доставка и оплата букетов, кофе и подарков.">
  <link rel="icon" href="assets/icons/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Italiana&family=JetBrains+Mono:wght@400;500&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="cart.css">
  <link rel="stylesheet" href="catalog.css">
  <link rel="stylesheet" href="checkout.css">
  <link rel="stylesheet" href="clients.css">
</head>
<body class="checkout-page">
${cart.slice(cart.indexOf('<a href="#main"'), mainStart)}
${checkoutMain}
${tail.replace(
  /<script src="paloma-products[\s\S]*$/,
  `  <script src="paloma-products.js"></script>
  <script src="catalog-data.js"></script>
  <script src="cart-core.js"></script>
  <script src="payment-config.js"></script>
  <script src="script.js"></script>
  <script src="wishlist.js"></script>
  <script src="checkout.js"></script>
  <script src="clients.js"></script>
</body>
</html>
`,
)}`;

fs.writeFileSync(path.join(root, "checkout.html"), checkoutHtml);

const thankYouHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#FBF6E8">
  <title>Заказ принят — PALOMA</title>
  <link rel="icon" href="assets/icons/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Italiana&family=JetBrains+Mono:wght@400;500&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="catalog.css">
  <link rel="stylesheet" href="thank-you.css">
  <link rel="stylesheet" href="clients.css">
</head>
<body class="thank-you-page">
${cart.slice(cart.indexOf('<a href="#main"'), mainStart).replace(/aria-current="page"/g, "")}
${thankYouMain}
${tail.replace(
  /<script src="paloma-products[\s\S]*$/,
  `  <script src="cart-core.js"></script>
  <script src="payment-config.js"></script>
  <script src="script.js"></script>
  <script src="wishlist.js"></script>
  <script src="thank-you.js"></script>
  <script src="clients.js"></script>
</body>
</html>
`,
)}`;

fs.writeFileSync(path.join(root, "thank-you.html"), thankYouHtml);
console.log("checkout.html and thank-you.html written");
