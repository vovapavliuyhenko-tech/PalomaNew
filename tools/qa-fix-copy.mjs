import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const REPLACEMENTS = [
  [
    /<a href="weddings\.html" class="site-header__link">Свадьбы<\/a>/g,
    '<a href="event-decoration.html" class="site-header__link">Оформление</a>',
  ],
  [
    /<a href="weddings\.html" class="site-header__mobile-link">Свадьбы<\/a>/g,
    '<a href="event-decoration.html" class="site-header__mobile-link">Оформление</a>',
  ],
  [
    /<a href="weddings\.html" class="site-header__mobile-link" aria-current="page">Свадьбы<\/a>/g,
    '<a href="event-decoration.html" class="site-header__mobile-link" aria-current="page">Оформление</a>',
  ],
  [
    /<li><a href="weddings\.html">Свадебная флористика<\/a><\/li>/g,
    '<li><a href="event-decoration.html">Цветочное оформление</a></li>',
  ],
  [
    /<span class="e-services__name">Свадьбы<\/span>/g,
    '<span class="e-services__name">Цветочное оформление</span>',
  ],
  [
    /Церемония, столы гостей, фотозона, доставка, монтаж и при необходимости демонтаж под ключ\./g,
    "Церемония, столы гостей, фотозона, доставка, монтаж и демонтаж — полный цикл цветочного оформления пространства.",
  ],
  [
    /<span class="w-hero__eyebrow">PALOMA × Свадьбы<\/span>/g,
    '<span class="w-hero__eyebrow">PALOMA × Цветочное оформление</span>',
  ],
  [
    /Шаг за шагом — от первой встречи до монтажа в день вашей свадьбы\./g,
    "Шаг за шагом — от первой встречи до монтажа в день события.",
  ],
  [
    /<h2 class="hscroll-section__title">Ключевые свадьбы<\/h2>/g,
    '<h2 class="hscroll-section__title">Ключевые проекты</h2>',
  ],
  [
    /Обсудить свадьбу/g,
    "Обсудить оформление",
  ],
  [
    /aria-label="Обсудить свадьбу в WhatsApp"/g,
    'aria-label="Обсудить оформление в WhatsApp"',
  ],
  [
    /<h2 class="client-faq__title">Про свадьбу<\/h2>/g,
    '<h2 class="client-faq__title">Про оформление</h2>',
  ],
  [
    /Флористическое оформление корпоративов, дней рождения, ужинов и фотосессий\. Концепция, монтаж и демонтаж под ключ\./g,
    "Флористическое оформление корпоративов, дней рождения, ужинов и фотосессий. Концепция, монтаж и оформление пространства.",
  ],
  [
    /PALOMA занимается цветочным оформлением — не организацией свадьбы «под ключ», а именно флористикой пространства и образами\./g,
    "PALOMA занимается цветочным оформлением и флористической концепцией — оформлением пространства, образами и деталями, без ведения мероприятия.",
  ],
  [
    /prepay: "Предоплата — свадьбы \/ цветочное оформление"/g,
    'prepay: "Предоплата — цветочное оформление"',
  ],
];

function patchFile(fp) {
  let text = fs.readFileSync(fp, "utf8");
  let changed = false;
  for (const [re, rep] of REPLACEMENTS) {
    if (re.test(text)) {
      text = text.replace(re, rep);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(fp, text, "utf8");
  return changed;
}

let n = 0;
for (const file of fs.readdirSync(root)) {
  if (file.endsWith(".html")) {
    if (patchFile(path.join(root, file))) n++;
  }
}

for (const rel of [
  "partials/events-main.html",
  "blog-data.js",
  "build-client-pages.mjs",
  "cart.js",
]) {
  const fp = path.join(root, rel);
  if (fs.existsSync(fp) && patchFile(fp)) n++;
}

console.log(`copy-patched ${n} files`);
