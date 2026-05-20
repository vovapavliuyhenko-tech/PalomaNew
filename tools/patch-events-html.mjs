import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = path.join(root, "events.html");
const mainPath = path.join(root, "partials", "events-main.html");

let html = fs.readFileSync(htmlPath, "utf8");
const main = fs.readFileSync(mainPath, "utf8");

html = html.replace(
  /<title>[\s\S]*?<\/title>/,
  "<title>Цветочное оформление событий — PALOMA Новороссийск</title>",
);

html = html.replace(
  /<meta name="description" content="[^"]*">/,
  '<meta name="description" content="PALOMA — цветочное оформление свадеб, мероприятий, витрин и фотозон. Флористическая концепция, монтаж декора, букет невесты. Новороссийск и побережье.">',
);

if (!html.includes("events.css")) {
  html = html.replace(
    '<link rel="stylesheet" href="clients.css">',
    '<link rel="stylesheet" href="clients.css">\n  <link rel="stylesheet" href="events.css">',
  );
}

html = html.replace(/<body([^>]*)>/, '<body class="page-events"$1>'.replace("class=\"\"", ""));

html = html.replace(/<body class="page-events" class="">/, '<body class="page-events">');
html = html.replace(/<body class="page-events">/, '<body class="page-events">');
if (!html.includes('class="page-events"')) {
  html = html.replace("<body>", '<body class="page-events">');
}

html = html.replace(
  /  <main id="main">[\s\S]*?  <\/main>/,
  main.trim(),
);

if (!html.includes("events-gallery-data.js")) {
  html = html.replace(
    '  <script src="clients.js"></script>',
    '  <script src="events-gallery-data.js"></script>\n  <script src="events.js"></script>\n  <script src="clients.js"></script>',
  );
}

fs.writeFileSync(htmlPath, html);
console.log("patched events.html");
