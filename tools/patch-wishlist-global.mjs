import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlFiles = fs
  .readdirSync(root)
  .filter((f) => f.endsWith(".html"));

const badgeOld =
  '<span class="header-wishlist-count" hidden aria-hidden="true">0</span>';
const badgeNew =
  '<span class="header-wishlist-count wishlist-count site-header__badge" id="wishlistCount" data-wishlist-count hidden aria-hidden="true">0</span>';

let patched = 0;

for (const file of htmlFiles) {
  let html = fs.readFileSync(path.join(root, file), "utf8");
  let changed = false;

  if (html.includes(badgeOld) && !html.includes("data-wishlist-count")) {
    html = html.replaceAll(badgeOld, badgeNew);
    changed = true;
  }

  if (
    html.includes('<script src="script.js"></script>') &&
    !html.includes('<script src="wishlist.js"></script>')
  ) {
    html = html.replace(
      '<script src="script.js"></script>',
      '<script src="script.js"></script>\n  <script src="wishlist.js"></script>',
    );
    changed = true;
  }

  if (file === "wishlist.html") {
    if (!html.includes("wishlist-page.js")) {
      html = html.replace(
        '<script src="wishlist.js"></script>',
        '<script src="wishlist.js"></script>\n  <script src="wishlist-page.js"></script>',
      );
      changed = true;
    }
    if (!html.includes("catalog-data.js") && html.includes("paloma-products.js")) {
      html = html.replace(
        '<script src="paloma-products.js"></script>',
        '<script src="paloma-products.js"></script>\n  <script src="catalog-data.js"></script>',
      );
      changed = true;
    }
    if (!html.includes('class="wishlist-page"') && html.includes("<body>")) {
      html = html.replace("<body>", '<body class="wishlist-page">');
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(path.join(root, file), html);
    patched++;
    console.log("patched", file);
  }
}

console.log("done", patched, "files");
