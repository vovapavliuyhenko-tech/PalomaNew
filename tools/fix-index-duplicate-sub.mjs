import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const p = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "index.html",
);
let html = fs.readFileSync(p, "utf8");
const marker = '<section class="reviews-section"';
const firstSub = html.indexOf('<section class="subscription-section"');
const secondSub = html.indexOf(
  '<section class="subscription-section"',
  firstSub + 1,
);
if (secondSub === -1) {
  console.log("no duplicate");
  process.exit(0);
}
const reviewsAt = html.indexOf(marker, secondSub);
const endSection = html.lastIndexOf("</section>", reviewsAt);
html = html.slice(0, secondSub) + html.slice(endSection + "</section>".length);
fs.writeFileSync(p, html, "utf8");
console.log("removed duplicate subscription");
