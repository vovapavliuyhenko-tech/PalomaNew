import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const loaderPartial = fs
  .readFileSync(path.join(root, "partials", "paloma-loader.html"), "utf8")
  .trim();

const loaderRe =
  /<div class="paloma-loader"[\s\S]*?<\/motion>\s*\n\s*\n|<div class="paloma-loader"[\s\S]*?<\/div>\s*\n\s*\n/;

let htmlCount = 0;
for (const file of fs.readdirSync(root).filter((f) => f.endsWith(".html"))) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, "utf8");
  let changed = false;

  if (loaderRe.test(html)) {
    html = html.replace(loaderRe, `${loaderPartial}\n\n`);
    changed = true;
  }

  if (!html.includes("paloma-animations.css")) {
    html = html.replace(
      '<link rel="stylesheet" href="styles.css">',
      '<link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="paloma-animations.css">',
    );
    changed = true;
  }

  if (!html.includes("paloma-animations.js") && html.includes("script.js")) {
    html = html.replace(
      '<script src="script.js"></script>',
      '<script src="script.js"></script>\n  <script src="paloma-animations.js"></script>',
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fp, html, "utf8");
    htmlCount++;
  }
}

console.log(`patched ${htmlCount} html files`);
