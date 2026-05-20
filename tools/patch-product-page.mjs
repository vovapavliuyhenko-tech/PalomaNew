import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// product.html from catalog copy
let product = fs.readFileSync(path.join(root, "product.html"), "utf8");
product = product
  .replace("<title>PALOMA — Каталог</title>", "<title>Товар — PALOMA</title>")
  .replace(
    /content="Каталог PALOMA[^"]*"/,
    'content="Страница товара PALOMA — букеты и композиции в Новороссийске."',
  );
if (!product.includes("product.css")) {
  product = product.replace(
    '<link rel="stylesheet" href="clients.css">',
    '<link rel="stylesheet" href="product.css">\n  <link rel="stylesheet" href="clients.css">',
  );
}
const mainSnippet = fs.readFileSync(
  path.join(root, "tools", "product-main.html"),
  "utf8",
);
const mainStart = product.indexOf('  <main id="main"');
const mainEnd = product.indexOf("  </main>", mainStart) + "  </main>".length;
product = product.slice(0, mainStart) + mainSnippet + product.slice(mainEnd);
product = product.replace(
  '<script src="script.js"></script>\n  <script src="clients.js"></script>',
  '<script src="paloma-products.js"></script>\n  <script src="script.js"></script>\n  <script src="product.js"></script>\n  <script src="clients.js"></script>',
);
fs.writeFileSync(path.join(root, "product.html"), product, "utf8");

// catalog.html — Подробнее links + products script
let catalog = fs.readFileSync(path.join(root, "catalog.html"), "utf8");
catalog = catalog.replace(
  /(<article class="product-card" data-id="([^"]+)"[\s\S]*?)<button type="button" class="btn btn--light">Подробнее<\/button>/g,
  '$1<a href="product.html?id=$2" class="btn btn--light">Подробнее</a>',
);
if (!catalog.includes("paloma-products.js")) {
  catalog = catalog.replace(
    '<script src="script.js"></script>',
    '<script src="paloma-products.js"></script>\n  <script src="script.js"></script>',
  );
}
fs.writeFileSync(path.join(root, "catalog.html"), catalog, "utf8");

console.log("product.html + catalog.html patched");
