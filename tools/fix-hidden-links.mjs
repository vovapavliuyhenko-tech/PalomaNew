import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const catalogPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "catalog.html",
);
let html = fs.readFileSync(catalogPath, "utf8");
html = html.replace(
  /(<article class="product-card is-hidden" data-id="(c9|c10|c11|c12)"[\s\S]*?)<button type="button" class="btn btn--light">Подробнее<\/button>/g,
  '$1<a href="product.html?id=$2" class="btn btn--light">Подробнее</a>',
);
fs.writeFileSync(catalogPath, html, "utf8");
console.log("hidden cards links fixed");
