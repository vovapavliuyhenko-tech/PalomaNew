import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* Пункт «День матери» — первый в выпадающем меню «Каталог» на всех страницах.
   Сезонный: data-season-tab + hidden, products-live.js покажет его, пока в
   каталоге есть товары с разделом mothersday, и сам скроет после праздника. */

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const ITEM = `                  <a href="catalog.html?cat=mothersday"
                     class="catalog-nav-item" data-cursor="hover" data-season-tab="mothersday" hidden>
                    <div class="catalog-nav-item__icon" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                        <path d="M12 20.5s-7.5-4.9-9.3-9.6C1.4 7.3 4 3.9 7.4 3.9c2 0 3.6 1.1 4.6 2.7 1-1.6 2.6-2.7 4.6-2.7 3.4 0 6 3.4 5.7 7-1.8 4.7-9.3 9.6-9.3 9.6z"/>
                      </svg>
                    </div>
                    <div class="catalog-nav-item__body">
                      <span class="catalog-nav-item__title">День матери</span>
                      <span class="catalog-nav-item__sub">Букеты для мамы</span>
                    </div>
                  </a>

`;

const ANCHOR = '<a href="catalog.html?cat=newyear"';

function* walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === ".git" || ent.name === "node_modules") continue;
    const fp = path.join(dir, ent.name);
    if (ent.isDirectory()) yield* walk(fp);
    else if (ent.name.endsWith(".html")) yield fp;
  }
}

let patched = 0;
let skipped = [];

for (const fp of walk(root)) {
  let html = fs.readFileSync(fp, "utf8");
  if (html.includes("cat=mothersday")) continue; // уже есть
  const idx = html.indexOf(ANCHOR);
  if (idx < 0) {
    if (html.includes("catalog-dropdown__grid")) skipped.push(path.relative(root, fp));
    continue;
  }
  html = html.slice(0, idx) + ITEM + html.slice(idx);
  fs.writeFileSync(fp, html, "utf8");
  patched++;
}

console.log(`patched ${patched} files`);
if (skipped.length) console.log("меню есть, якоря newyear нет:\n" + skipped.join("\n"));
