import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const wishlistLink = `<a href="wishlist.html" class="site-header__icon site-header__icon--wishlist" aria-label="Избранное" data-cursor="hover">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z"/></svg>
            <span class="header-wishlist-count" hidden aria-hidden="true">0</span>
          </a>`;

const buttonRe =
  /<button type="button" class="site-header__icon(?: site-header__icon--wishlist)?" aria-label="Избранное" data-cursor="hover">\s*<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z"\/><\/svg>(?:\s*<span class="header-wishlist-count" hidden aria-hidden="true">0<\/span>)?\s*<\/button>/g;

const mobileWishlist =
  '<a href="wishlist.html" class="site-header__mobile-link">Избранное</a>';

let count = 0;
for (const name of fs.readdirSync(root)) {
  if (!name.endsWith(".html")) continue;
  const file = path.join(root, name);
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes('aria-label="Избранное"')) continue;

  const next = html.replace(buttonRe, wishlistLink);
  if (next === html) {
    console.warn("no button replaced:", name);
    continue;
  }
  html = next;

  if (!html.includes('href="wishlist.html" class="site-header__mobile-link"')) {
    html = html.replace(
      /<a href="blog\.html" class="site-header__mobile-link">Блог<\/a>/,
      (m) => `${m}\n          ${mobileWishlist}`,
    );
  }

  fs.writeFileSync(file, html, "utf8");
  count++;
  console.log("patched", name);
}
console.log("done", count);
