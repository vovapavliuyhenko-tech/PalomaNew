import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const partial = fs
  .readFileSync(path.join(root, "partials", "paloma-loader.html"), "utf8")
  .trim();

const loaderRe =
  /<div class="(?:paloma-loader|pl)" id="palomaLoader"[\s\S]*?(?=\n<div class="site-top"|\n<header|\n<nav class=")/;

let n = 0;
for (const file of fs.readdirSync(root).filter((f) => f.endsWith(".html"))) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, "utf8");
  let changed = false;

  if (loaderRe.test(html)) {
    html = html.replace(loaderRe, `${partial}\n\n`);
    changed = true;
  }

  if (!html.includes("preloader.css")) {
    html = html.replace(
      '<link rel="stylesheet" href="styles.css">',
      '<link rel="stylesheet" href="preloader.css">\n  <link rel="stylesheet" href="styles.css">',
    );
    changed = true;
  }

  if (!html.includes("preloader.js")) {
    html = html.replace(
      /<script src="cart-core\.js"><\/script>/,
      '<script src="preloader.js"></script>\n  <script src="cart-core.js"></script>',
    );
    if (!html.includes("preloader.js")) {
      const firstScript = html.indexOf('<script src="');
      if (firstScript !== -1) {
        html =
          html.slice(0, firstScript) +
          '<script src="preloader.js"></script>\n  ' +
          html.slice(firstScript);
        changed = true;
      }
    } else {
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(fp, html, "utf8");
    n++;
  }
}

console.log(`preloader v3 patched ${n} files`);
