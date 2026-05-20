import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let n = 0;

for (const file of fs.readdirSync(root).filter((f) => f.endsWith(".html"))) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, "utf8");
  if (!html.includes("`n")) continue;
  html = html.replace(
    /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">`n<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>/g,
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  );
  html = html.replace(/`n/g, "\n");
  fs.writeFileSync(fp, html, "utf8");
  n++;
}

console.log(`fixed preconnect in ${n} files`);
