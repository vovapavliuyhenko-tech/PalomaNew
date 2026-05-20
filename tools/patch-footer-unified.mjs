import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const footerPartial = fs.readFileSync(
  path.join(root, "partials", "site-footer.html"),
  "utf8",
).trim();

const footerRe = /<footer class="site-footer"[\s\S]*?<\/footer>/;

let patched = 0;
let skipped = 0;

for (const file of fs.readdirSync(root).filter((f) => f.endsWith(".html"))) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, "utf8");
  if (!footerRe.test(html)) {
    skipped++;
    continue;
  }
  html = html.replace(footerRe, footerPartial);
  fs.writeFileSync(fp, html, "utf8");
  patched++;
}

console.log(`Footer patched: ${patched}, skipped: ${skipped}`);
