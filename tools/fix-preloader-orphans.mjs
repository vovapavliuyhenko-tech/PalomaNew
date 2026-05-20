import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const partial = fs
  .readFileSync(path.join(root, "partials", "paloma-loader.html"), "utf8")
  .trim();

const orphanRe =
  /\n<\/div>\s*\n\s*<div class="paloma-loader__shutter"[\s\S]*?<\/div>\s*\n/g;

const loaderBlockRe =
  /<div class="pl" id="palomaLoader"[\s\S]*?(?=\n<div class="site-top"|\n<header|\n<nav class=")/;

let n = 0;
for (const file of fs.readdirSync(root).filter((f) => f.endsWith(".html"))) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, "utf8");
  const before = html;

  html = html.replace(orphanRe, "\n");
  if (loaderBlockRe.test(html)) {
    html = html.replace(loaderBlockRe, `${partial}\n`);
  }

  if (html !== before) {
    fs.writeFileSync(fp, html, "utf8");
    n++;
  }
}

console.log(`fixed ${n} files`);
