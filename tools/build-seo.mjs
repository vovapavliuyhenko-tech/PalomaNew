/* ════════════════════════════════════════════════════════
   tools/build-seo.mjs — SEO-страницы PALOMA при каждой публикации

   Запускается в GitHub Actions перед выкладкой (deploy-pages.yml),
   а также раз в сутки — чтобы новые товары из админки попадали в поиск.

   Что делает:
   1. Берёт товары из базы (основной сервер → резервный → запасной файл).
   2. Для каждого букета собирает отдельную страницу /buket/<slug>/ —
      с готовыми заголовком, описанием, ценой, фото, canonical, Open Graph
      и разметкой Product + BreadcrumbList. Раньше все товары были одной
      страницей product.html?slug=…, и поиск видел 142 копии пустой
      «Товар — PALOMA».
   3. Страницы разделов /katalog/<раздел>/ — свой заголовок, H1, текст
      и ссылки на все букеты раздела.
   4. sitemap.xml и feed-yandex.xml (фид для Яндекс Товаров / Директа).
   5. Список адресов для IndexNow (Яндекс узнаёт о страницах сразу).

   Запуск руками: node tools/build-seo.mjs
   ════════════════════════════════════════════════════════ */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { buildLandings, landingLinks } from "./seo-landings.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const SITE = "https://paloma.website";
const API = [
  "https://functions.yandexcloud.net/d4ek26aklvok10biu54h",
  "https://palomanew.onrender.com",
];
const TODAY = new Date().toISOString().slice(0, 10);
const CITY = "Новороссийске";

const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const write = (f, s) => { const p = path.join(ROOT, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const money = (n) => Number(n).toLocaleString("ru-RU").replace(/ /g, " ") + " ₽";
const abs = (p) => (!p ? "" : /^https?:/.test(p) ? p : SITE + "/" + String(p).replace(/^\/+/, ""));

/* ── 1. товары ── */
async function loadProducts() {
  for (const base of API) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 70000);
      const r = await fetch(base + "?a=products", { signal: ctrl.signal });
      clearTimeout(t);
      const d = await r.json();
      if (d && d.ok && Array.isArray(d.products) && d.products.length > 20) {
        console.log("товары из", base, d.products.length);
        return d.products;
      }
    } catch (e) { console.log("нет ответа", base, e.message); }
  }
  const ctx = { window: {} };
  vm.runInNewContext(read("paloma-products.js"), ctx);
  console.log("товары из запасного файла", ctx.window.PALOMA_PRODUCTS.length);
  return ctx.window.PALOMA_PRODUCTS;
}

const CATS = {
  mono: { label: "Монобукеты", h1: "Монобукеты в Новороссийске", text: "Монобукеты из одного вида цветов: гортензии, пионовидные и французские розы, хризантемы, георгины. Выберите количество — от компактного букета до пышного. Покажем фото перед отправкой, доставим по Новороссийску в день заказа." },
  duo: { label: "Дуобукеты", h1: "Дуобукеты — два цветка в одном букете", text: "Дуобукеты PALOMA: гортензия с пионовидной розой, кустовая роза с гортензией и другие сочетания двух цветов. Собираем вручную и присылаем фото до доставки." },
  authors: { label: "Авторские букеты", h1: "Авторские букеты в Новороссийске", text: "Авторские букеты флористов PALOMA: сезонные цветы, необычные сочетания и фактурная зелень. Каждый букет собирается вручную — перед отправкой пришлём фото." },
  wedding: { label: "Свадебные букеты", h1: "Свадебные букеты и букет невесты", text: "Свадебные букеты PALOMA в Новороссийске: букет невесты, бутоньерки и композиции для церемонии. Подберём цветы под платье и стиль свадьбы, согласуем детали заранее." },
  compositions: { label: "Композиции и корзины", h1: "Цветочные композиции и корзины", text: "Цветочные корзины и композиции PALOMA — подарок, который не нужно ставить в вазу. Хризантемы, гортензии, розы и сезонные цветы с доставкой по Новороссийску." },
  vases: { label: "Вазы и подарки", h1: "Вазы и подарки к букету", text: "Дизайнерские вазы, шоколад и подарки к букету в PALOMA. Добавьте к заказу вазу или сладости — доставим вместе с цветами." },
  online: { label: "Онлайн-витрина", h1: "Букеты в наличии — онлайн-витрина", text: "Онлайн-витрина PALOMA: букеты, которые можно заказать прямо сейчас с доставкой по Новороссийску, Геленджику и Анапе. Фото букета — до отправки." },
  season: { label: "Самый сезон", h1: "Сезонные букеты", text: "Букеты из цветов, которые сейчас в самом сезоне: самые свежие и выразительные. Обновляем подборку каждую неделю." },
  newyear: { label: "Новый год", h1: "Новогодние подарки и ёлочные игрушки", text: "Новогодний раздел PALOMA: ёлочные игрушки, украшения и подарки к праздникам. Добавьте к букету или закажите отдельно — доставим по Новороссийску вместе с цветами." },
  autumn: { label: "Осенние букеты", h1: "Осенние букеты в Новороссийске", text: "Осенние букеты PALOMA: георгины, хризантемы, целозия, шиповник и тёплые оттенки сезона. Доставка по Новороссийску, фото перед отправкой." },
  bestsellers: { label: "Бестселлеры", h1: "Самые популярные букеты", text: "Бестселлеры PALOMA — букеты, которые выбирают чаще всего. Проверенные сочетания и понятные цены." },
};

const minPrice = (p) => (Number(p.price) || 0) + Math.min(0, ...((p.sizes || []).map((s) => s.priceDelta || 0)));
const maxPrice = (p) => (Number(p.price) || 0) + Math.max(0, ...((p.sizes || []).map((s) => s.priceDelta || 0)));
const cats = (p) => (Array.isArray(p.categories) ? p.categories : p.category ? [p.category] : []);
const isGift = (p) => cats(p).length && cats(p).every((c) => c === "vases");
const purl = (p) => `/buket/${encodeURIComponent(p.slug || p.id)}/`;

/* ── 2. страницы товаров ── */
function productPage(tpl, p, all) {
  const slug = p.slug || p.id;
  const url = SITE + purl(p);
  const c0 = cats(p).find((c) => CATS[c]) || "";
  const catLabel = c0 ? CATS[c0].label : "Каталог";
  const many = (p.sizes || []).length > 1;
  const lo = minPrice(p), hi = maxPrice(p);
  const priceTxt = money(lo);
  const gift = isGift(p);
  const title = gift
    ? `${p.name} — купить в Новороссийске, ${priceTxt} | PALOMA`
    : `${p.name} — купить букет с доставкой в ${CITY}, ${priceTxt} | PALOMA`;
  const desc = (`${p.name}: ${priceTxt}. ${p.desc || p.composition || ""} ` +
    (gift ? "Можно добавить к букету и доставить вместе." : "Доставка по Новороссийску, Геленджику и Анапе, фото букета до отправки."))
    .replace(/\s+/g, " ").trim().slice(0, 300);
  const img = abs(p.image);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": url + "#product",
        name: p.name,
        description: (p.desc || p.composition || p.name).slice(0, 500),
        image: img ? [img] : undefined,
        sku: p.id,
        brand: { "@type": "Brand", name: "PALOMA" },
        category: catLabel,
        url,
        offers: many
          ? { "@type": "AggregateOffer", priceCurrency: "RUB", lowPrice: lo, highPrice: hi, offerCount: p.sizes.length,
              availability: "https://schema.org/InStock", seller: { "@id": SITE + "/#business" } }
          : { "@type": "Offer", priceCurrency: "RUB", price: lo, url, availability: "https://schema.org/InStock",
              seller: { "@id": SITE + "/#business" } },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: SITE + "/" },
          { "@type": "ListItem", position: 2, name: "Каталог", item: SITE + "/catalog.html" },
          ...(c0 ? [{ "@type": "ListItem", position: 3, name: catLabel, item: SITE + `/katalog/${c0}/` }] : []),
          { "@type": "ListItem", position: c0 ? 4 : 3, name: p.name, item: url },
        ],
      },
    ],
  };
  let s = tpl;
  s = s.replace(/<html([^>]*)>/, `<html$1 data-slug="${esc(slug)}">`);
  /* у общей product.html стоит noindex (она дубль) — здесь индексируем */
  s = s.replace('<meta name="robots" content="noindex, follow">', '<meta name="robots" content="index, follow, max-image-preview:large">');
  s = s.replace(/<head>/, `<head>\n  <base href="/">`);
  s = s.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  s = s.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc.slice(0, 160))}">`);
  s = s.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
  s = s.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`);
  s = s.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(p.name)} — PALOMA, Новороссийск">`);
  s = s.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc.slice(0, 200))}">`);
  if (img) s = s.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${esc(img)}">`);
  s = s.replace(/<meta property="og:type" content="[^"]*">/, `<meta property="og:type" content="product">`);
  s = s.replace("</head>", `  <script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`);
  /* видимое содержимое — сразу в HTML, скрипт потом его дополнит */
  s = s.replace('<li id="pdpBreadcrumbName" aria-current="page">Товар</li>', `<li id="pdpBreadcrumbName" aria-current="page">${esc(p.name)}</li>`);
  s = s.replace('<a href="#" id="pdpBreadcrumbCatLink">Категория</a>', c0 ? `<a href="/katalog/${c0}/" id="pdpBreadcrumbCatLink">${esc(catLabel)}</a>` : '<a href="/catalog.html" id="pdpBreadcrumbCatLink">Каталог</a>');
  s = s.replace('<p class="pdp-info__cat" id="pdpCat"></p>', `<p class="pdp-info__cat" id="pdpCat">${esc(catLabel)}</p>`);
  s = s.replace('<h1 class="pdp-info__name" id="pdpName"></h1>', `<h1 class="pdp-info__name" id="pdpName">${esc(p.name)}</h1>`);
  s = s.replace('<p class="pdp-info__price" id="pdpPrice"></p>', `<p class="pdp-info__price" id="pdpPrice">${esc(priceTxt)}</p>`);
  s = s.replace('<span class="pdp-info__row-val" id="pdpComposition"></span>', `<span class="pdp-info__row-val" id="pdpComposition">${esc(p.composition || "")}</span>`);
  s = s.replace('<p class="pdp-info__desc" id="pdpDesc"></p>', `<p class="pdp-info__desc" id="pdpDesc">${esc(p.desc || "")}</p>`);
  if (img) s = s.replace('<img decoding="async" class="pdp-gallery__main-img" id="pdpMainImg" src="" alt="" loading="eager">',
    `<img decoding="async" class="pdp-gallery__main-img" id="pdpMainImg" src="${esc(p.image)}" alt="${esc(p.name + " — букет PALOMA")}" loading="eager" fetchpriority="high">`);
  /* «Похожие» — ссылки на соседние букеты раздела (перелинковка) */
  const near = all.filter((x) => x !== p && c0 && cats(x).includes(c0)).slice(0, 8);
  if (near.length) {
    s = s.replace("</main>", `  <nav class="seo-links" aria-label="Ещё в разделе «${esc(catLabel)}»"><p class="seo-links__t">Ещё в разделе «${esc(catLabel)}»</p>` +
      near.map((x) => `<a href="${purl(x)}">${esc(x.name)}</a>`).join("") + `</nav>\n  </main>`);
  }
  /* якоря «#…» с <base> вели бы на главную — привязываем к этой странице */
  s = s.replace(/href="#([^"]*)"/g, (m, h) => `href="${purl(p)}#${h}"`);
  return s;
}

/* ── 3. страницы разделов ── */
function categoryPage(tpl, cat, list) {
  const C = CATS[cat];
  const url = SITE + `/katalog/${cat}/`;
  const lo = list.length ? Math.min(...list.map(minPrice)) : 0;
  const title = `${C.h1} — от ${money(lo)}, доставка | PALOMA`;
  const desc = `${C.text}`.slice(0, 160);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", name: C.h1, url, description: C.text,
        mainEntity: { "@type": "ItemList", numberOfItems: list.length,
          itemListElement: list.slice(0, 50).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: SITE + purl(p), name: p.name })) } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Каталог", item: SITE + "/catalog.html" },
        { "@type": "ListItem", position: 3, name: C.label, item: url } ] },
    ],
  };
  let s = tpl;
  s = s.replace(/<html([^>]*)>/, `<html$1 data-cat="${cat}">`);
  s = s.replace(/<head>/, `<head>\n  <base href="/">`);
  s = s.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  s = s.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`);
  s = s.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
  s = s.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`);
  s = s.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(C.h1)} — PALOMA">`);
  s = s.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`);
  s = s.replace("</head>", `  <script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`);
  s = s.replace('<h1 class="catalog-hero__title">Каталог</h1>', `<h1 class="catalog-hero__title">${esc(C.h1)}</h1>`);
  const block = `<section class="seo-cat" aria-label="${esc(C.label)}"><p class="seo-cat__text">${esc(C.text)}</p>` +
    `<nav class="seo-links" aria-label="Все позиции раздела"><p class="seo-links__t">${esc(C.label)}: ${list.length} ${list.length % 10 === 1 && list.length % 100 !== 11 ? "позиция" : "позиций"}</p>` +
    list.map((p) => `<a href="${purl(p)}">${esc(p.name)} — ${money(minPrice(p))}</a>`).join("") +
    `</nav>` + landingLinks(esc) + `</section>`;
  s = s.replace("</main>", `  ${block}\n  </main>`);
  s = s.replace(/href="#([^"]*)"/g, (m, h) => `href="/katalog/${cat}/#${h}"`);
  return s;
}

/* ── 4. sitemap и фид ── */
function sitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    urls.map((u) => `  <url>\n    <loc>${esc(u.loc)}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${u.freq || "weekly"}</changefreq>\n    <priority>${u.pr || "0.6"}</priority>\n` +
      (u.img ? `    <image:image><image:loc>${esc(u.img)}</image:loc></image:image>\n` : "") + `  </url>`).join("\n") + `\n</urlset>\n`;
}

function yml(list) {
  const catIds = Object.keys(CATS);
  const date = new Date().toISOString().slice(0, 16).replace("T", " ");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<yml_catalog date="${date}">\n  <shop>\n    <name>PALOMA</name>\n    <company>PALOMA — студия цветов и кофе, Новороссийск</company>\n    <url>${SITE}</url>\n` +
    `    <currencies><currency id="RUR" rate="1"/></currencies>\n    <categories>\n` +
    catIds.map((c, i) => `      <category id="${i + 1}">${esc(CATS[c].label)}</category>`).join("\n") + `\n    </categories>\n    <offers>\n` +
    list.map((p) => {
      const c = cats(p).find((x) => CATS[x]);
      return `      <offer id="${esc(p.id)}" available="true">\n        <url>${SITE}${purl(p)}</url>\n        <price>${minPrice(p)}</price>\n        <currencyId>RUR</currencyId>\n` +
        `        <categoryId>${c ? catIds.indexOf(c) + 1 : 1}</categoryId>\n` + (p.image ? `        <picture>${esc(abs(p.image))}</picture>\n` : "") +
        `        <name>${esc(p.name)}</name>\n        <vendor>PALOMA</vendor>\n        <description>${esc((p.desc || p.composition || p.name).slice(0, 2900))}</description>\n` +
        `        <sales_notes>Доставка по Новороссийску, Геленджику, Анапе. Фото букета до отправки.</sales_notes>\n        <delivery>true</delivery>\n        <pickup>true</pickup>\n      </offer>`;
    }).join("\n") + `\n    </offers>\n  </shop>\n</yml_catalog>\n`;
}

/* ── запуск ── */
const products = (await loadProducts()).filter((p) => p && p.slug && p.name && p.price > 0);
const ptpl = read("product.html"), ctpl = read("catalog.html");

fs.rmSync(path.join(ROOT, "buket"), { recursive: true, force: true });
fs.rmSync(path.join(ROOT, "katalog"), { recursive: true, force: true });
fs.rmSync(path.join(ROOT, "povod"), { recursive: true, force: true });
fs.rmSync(path.join(ROOT, "dostavka"), { recursive: true, force: true });
for (const p of products) write(`buket/${p.slug}/index.html`, productPage(ptpl, p, products));
const catPages = [];
for (const cat of Object.keys(CATS)) {
  const list = products.filter((p) => cats(p).includes(cat)).sort((a, b) => minPrice(a) - minPrice(b));
  if (!list.length) continue;
  write(`katalog/${cat}/index.html`, categoryPage(ctpl, cat, list));
  catPages.push(cat);
}

/* статические страницы — из прежней карты сайта, без старых product.html?slug */
const old = fs.existsSync(path.join(ROOT, "sitemap.xml")) ? read("sitemap.xml") : "";
const statics = [...old.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => !/product\.html\?|\/buket\/|\/katalog\/|\/povod\/|\/dostavka\//.test(u));
const urls = [
  ...statics.map((loc) => ({ loc, freq: /\/$|catalog\.html$/.test(loc) ? "daily" : "weekly", pr: /\/$/.test(loc) ? "1.0" : /catalog\.html$/.test(loc) ? "0.9" : "0.7" })),
  ...catPages.map((c) => ({ loc: `${SITE}/katalog/${c}/`, freq: "daily", pr: "0.9" })),
  /* посадочные страницы под поводы и города */
  ...buildLandings({ tpl: read("delivery.html"), products, write, esc, money, abs, purl, minPrice, cats, SITE })
    .map((loc) => ({ loc, freq: "weekly", pr: "0.85" })),
  ...products.map((p) => ({ loc: SITE + purl(p), freq: "weekly", pr: isGift(p) ? "0.6" : "0.8", img: abs(p.image) })),
];
/* запасной каталог сайта — свежий снимок базы, чтобы новый посетитель
   сразу видел новые букеты, даже пока сервер не ответил */
if (products.length > 20) {
  write("paloma-products.js", "/* PALOMA — запасная копия каталога: снимок базы на " + TODAY + " (tools/build-seo.mjs при публикации).\n" +
    "   Сайт берёт каталог из базы (products-live.js); эта копия видна, только если сервер не ответил. */\n" +
    "window.PALOMA_PRODUCTS = " + JSON.stringify(products, null, 2) + ";\n");
}
write("sitemap.xml", sitemap(urls));
write("feed-yandex.xml", yml(products));
write("indexnow-urls.txt", urls.map((u) => u.loc).join("\n") + "\n");
console.log(`готово: ${products.length} товаров, ${catPages.length} разделов, ${urls.length} адресов в sitemap`);
