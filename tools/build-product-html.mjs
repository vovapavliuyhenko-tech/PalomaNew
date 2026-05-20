import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const catalog = fs.readFileSync(path.join(root, "catalog.html"), "utf8");

let html = catalog
  .replace("<title>PALOMA — Каталог</title>", "<title>Товар — PALOMA</title>")
  .replace(
    /content="Каталог PALOMA[^"]*"/,
    'content="Страница товара PALOMA — букеты и композиции в Новороссийске."',
  );

if (!html.includes("product.css")) {
  html = html.replace(
    '<link rel="stylesheet" href="clients.css">',
    '<link rel="stylesheet" href="product.css">\n  <link rel="stylesheet" href="clients.css">',
  );
}

const productMain = [
  '  <main id="main" class="product-page">',
  '    <motion class="container product-page__container">',
].join("\n");
