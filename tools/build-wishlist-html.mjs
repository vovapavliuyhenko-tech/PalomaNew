import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = fs.readFileSync(path.join(root, "catalog.html"), "utf8");
const mainSnippet = fs
  .readFileSync(path.join(root, "tools", "wishlist-main.html"), "utf8")
  .replace(/<motion /g, "<div ")
  .replace(/<\/motion>/g, "</div>");

let html = catalog
  .replace("<title>PALOMA — Каталог</title>", "<title>Избранное — PALOMA</title>")
  .replace(
    /content="Каталог PALOMA[^"]*"/,
    'content="Избранное PALOMA — сохранённые букеты и композиции."',
  );

html = html.replace(
  '<link rel="stylesheet" href="clients.css">',
  '<link rel="stylesheet" href="wishlist.css">\n  <link rel="stylesheet" href="clients.css">',
);

const mainStart = html.indexOf('  <main id="main"');
const mainEnd = html.indexOf("  </main>", mainStart) + "  </main>".length;
html = html.slice(0, mainStart) + mainSnippet + html.slice(mainEnd);

html = html.replace(
  '<script src="paloma-products.js"></script>\n  <script src="script.js"></script>\n  <script src="clients.js"></script>',
  '<script src="paloma-products.js"></script>\n  <script src="script.js"></script>\n  <script src="wishlist.js"></script>\n  <script src="clients.js"></script>',
);

if (!html.includes("paloma-products.js")) {
  html = html.replace(
    '<script src="script.js"></script>',
    '<script src="paloma-products.js"></script>\n  <script src="script.js"></script>\n  <script src="wishlist.js"></script>',
  );
}

fs.writeFileSync(path.join(root, "wishlist.html"), html, "utf8");
console.log("wishlist.html OK");
