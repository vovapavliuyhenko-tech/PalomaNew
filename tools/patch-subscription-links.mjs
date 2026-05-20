import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const files = fs
  .readdirSync(root)
  .filter((f) => f.endsWith(".html") && f !== "subscription.html");

let count = 0;
for (const file of files) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, "utf8");
  const next = html.replace(/href="catalog\.html\?cat=sub"/g, 'href="subscription.html"');
  if (next !== html) {
    fs.writeFileSync(fp, next);
    count++;
  }
}

const indexPath = path.join(root, "index.html");
let index = fs.readFileSync(indexPath, "utf8");
index = index.replace(
  'href="catalog.html?cat=sub" class="btn btn--dark subscription-card__cta"',
  'href="subscription.html" class="btn btn--dark subscription-card__cta"',
);
fs.writeFileSync(indexPath, index);

console.log(`updated subscription links in ${count + 1} files`);
