import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const partialsDir = path.join(root, "partials");

const eventDecoNavCard =
  '<a href="event-decoration.html" class="client-nav-card" data-cursor="hover">' +
  '<motion class="client-nav-card__icon" aria-hidden="true">'.replace("motion", "div") +
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">' +
  '<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 9h18M8 3v4M16 3v4"/></svg></div>' +
  '<div class="client-nav-card__body"><div class="client-nav-card__title">Оформление мероприятий</div>' +
  '<div class="client-nav-card__desc">Цветочный декор событий</div></div></a>';

function replaceMain(html, partialName) {
  const partial = fs.readFileSync(
    path.join(partialsDir, partialName),
    "utf8",
  );
  return html.replace(/<main id="main"[\s\S]*?<\/main>/, partial.trim());
}

function ensureAssets(html) {
  let next = html;
  if (!next.includes("clients-pages.css")) {
    next = next.replace(
      '<link rel="stylesheet" href="clients.css">',
      '<link rel="stylesheet" href="clients.css">\n  <link rel="stylesheet" href="clients-pages.css">',
    );
  }
  if (!next.includes("clients-pages.js")) {
    next = next.replace(
      '<script src="clients.js"></script>',
      '<script src="clients.js"></script>\n  <script src="clients-pages.js"></script>',
    );
  }
  return next;
}

function patchNav(html) {
  let next = html;
  next = next.replace(
    /<a href="events\.html" class="client-nav-card"[\s\S]*?<div class="client-nav-card__title">Мероприятия<\/div>[\s\S]*?<\/a>/,
    eventDecoNavCard,
  );
  next = next.replace(
    /<a href="events\.html" class="site-header__mobile-link">Мероприятия<\/a>/,
    '<a href="event-decoration.html" class="site-header__mobile-link">Оформление мероприятий</a>',
  );
  const footerEvents = /<li><a href="events\.html">Мероприятия<\/a><\/li>/;
  if (footerEvents.test(next) && !next.includes("event-decoration.html")) {
    next = next.replace(
      footerEvents,
      '<li><a href="event-decoration.html">Оформление мероприятий</a></li>\n            <li><a href="events.html">Оформление</a></li>',
    );
  } else if (!next.includes("event-decoration.html")) {
    next = next.replace(
      /(<li><a href="faq\.html">Вопрос-ответ<\/a><\/li>)/,
      '$1\n            <li><a href="event-decoration.html">Оформление мероприятий</a></li>',
    );
  }
  return next;
}

const pagePartials = {
  "delivery.html": "delivery-main.html",
  "payment.html": "payment-main.html",
  "care.html": "care-main.html",
  "faq.html": "faq-main.html",
};

for (const [file, partial] of Object.entries(pagePartials)) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, "utf8");
  html = replaceMain(html, partial);
  html = ensureAssets(html);
  html = patchNav(html);
  fs.writeFileSync(fp, html, "utf8");
  console.log("patched", file);
}

const deliveryTpl = fs.readFileSync(path.join(root, "delivery.html"), "utf8");
let eventDeco = deliveryTpl.replace(
  /<title>[\s\S]*?<\/title>/,
  "<title>Оформление мероприятий — цветочный декор PALOMA</title>",
);
eventDeco = eventDeco.replace(
  /<meta name="description" content="[^"]*">/,
  '<meta name="description" content="Цветочное оформление мероприятий в Новороссийске: свадьбы, корпоративы, частные события. Заявка и портфолио PALOMA.">',
);
eventDeco = replaceMain(eventDeco, "event-decoration-main.html");
fs.writeFileSync(path.join(root, "event-decoration.html"), eventDeco, "utf8");
console.log("created event-decoration.html");

const htmlFiles = fs.readdirSync(root).filter((f) => f.endsWith(".html"));
let navCount = 0;
for (const file of htmlFiles) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, "utf8");
  const next = patchNav(html);
  if (next !== html) {
    fs.writeFileSync(fp, next, "utf8");
    navCount++;
  }
}
console.log(`nav updated in ${navCount} files`);
