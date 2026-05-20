import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatePath = path.join(root, "events.html");
const mainPath = path.join(root, "partials", "subscription-main.html");
const outPath = path.join(root, "subscription.html");

let html = fs.readFileSync(templatePath, "utf8");
const main = fs.readFileSync(mainPath, "utf8");

html = html.replace(/<body class="page-events">/, '<body class="page-subscription">');
html = html.replace(
  /<title>[\s\S]*?<\/title>/,
  "<title>Цветочная подписка — PALOMA Новороссийск</title>",
);
html = html.replace(
  /<meta name="description" content="[^"]*">/,
  '<meta name="description" content="Цветочная подписка PALOMA — регулярные букеты для дома, офиса или подарка. Выберите размер, период и частоту, оформите онлайн.">',
);

html = html.replace(
  /<link rel="stylesheet" href="events\.css">/,
  '<link rel="stylesheet" href="subscription.css">',
);

html = html.replace(
  /  <main id="main"[\s\S]*?  <\/main>/,
  main.trim(),
);

html = html.replace(
  /<script src="events-gallery-data\.js"><\/script>\s*<script src="events\.js"><\/script>\s*/,
  '<script src="subscription-pricing.js"></script>\n  <script src="subscription.js"></script>\n  ',
);

html = html.replace(
  /href="catalog\.html\?cat=sub"/g,
  'href="subscription.html"',
);

fs.writeFileSync(outPath, html);
console.log("wrote subscription.html");
