import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlFiles = fs.readdirSync(root).filter((f) => f.endsWith(".html"));
const pages = new Set(htmlFiles);
const broken = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const re = /href=["']([^"'#?]+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1].trim();
    if (/^(https?:|mailto:|tel:)/i.test(href)) continue;
    if (/^(assets|images|videos)\//.test(href)) continue;
    const target = href.includes("/") ? href : href.split("?")[0];
    const base = target.includes("/") ? path.basename(target) : target;
    if (pages.has(base)) continue;
    const full = path.join(root, target);
    if (!fs.existsSync(full)) broken.push({ file, href });
  }
}

const banned = [
  /промокод/i,
  /скидк/i,
  /\bакци/i,
  /бонус/i,
  /зачёркнут|зачеркнут/i,
  /организац\w*\s+свадьб/i,
  /свадьб\w*\s+под\s+ключ/i,
];

const hits = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.(html|js|css|md)$/i.test(ent.name)) {
      const text = fs.readFileSync(p, "utf8");
      for (const re of banned) {
        if (re.test(text)) hits.push({ file: path.relative(root, p), re: String(re) });
      }
    }
  }
}
walk(root);

console.log(JSON.stringify({ broken: broken.slice(0, 50), bannedHits: hits.slice(0, 40), brokenCount: broken.length, bannedCount: hits.length }, null, 2));
