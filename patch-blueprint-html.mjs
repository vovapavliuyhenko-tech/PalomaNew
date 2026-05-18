/**
 * Одноразовый патч HTML под PALOMA Blueprint (лоадер, шрифты, лого, корзина, футер).
 * Запуск: node patch-blueprint-html.mjs (из каталога paloma-static).
 */
import fs from "node:fs";

const FONT_BLOCK = `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Italiana&family=JetBrains+Mono:wght@400;500&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">`;

const PALOMA_LOADER = `  <div class="paloma-loader" id="palomaLoader" aria-hidden="true">
    <div class="paloma-loader__inner">
      <p class="paloma-loader__word">PALOMA</p>
      <div class="paloma-loader__line" aria-hidden="true"></div>
    </div>
    <div class="paloma-loader__curtain paloma-loader__curtain--t"></div>
    <div class="paloma-loader__curtain paloma-loader__curtain--b"></div>
  </div>
`;

function swapLoader(html) {
  const m = /<div class="site-top"\s+id="siteTop">/.exec(html);
  if (!m) return html;
  const pre = html.slice(0, m.index);
  const tail = html.slice(m.index);
  const skip = /<a href="#main" class="skip-link">[\s\S]*?<\/a>/i.exec(pre);
  if (!skip) return html;

  const before = pre.slice(0, skip.index + skip[0].length).trimEnd();
  const junk = pre
    .slice(skip.index + skip[0].length)
    .replace(/^\s*<div class="preloader"[\s\S]*$/, "")
    .trim();

  let bridge = `\n\n${PALOMA_LOADER}`;
  if (junk) bridge += `\n`;
  return `${before}${bridge}\n\n${tail.trimStart()}`;
}

function swapFonts(html) {
  let s = html;
  s = s.replace(
    /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*\n\s*<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*\n\s*<link href="https:\/\/fonts\.googleapis\.com\/css2[^"]*" rel="stylesheet">/gi,
    FONT_BLOCK,
  );
  s = s.replace(
    /<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*\n\s*<link href="https:\/\/fonts\.googleapis\.com\/css2[^"]*" rel="stylesheet">/gi,
    FONT_BLOCK,
  );
  if (!s.includes("family=Italiana")) {
    s = s.replace(
      /<link href="https:\/\/fonts\.googleapis\.com\/css2[^"]*" rel="stylesheet">/i,
      FONT_BLOCK,
    );
  }
  return s;
}

function swapTheme(html) {
  return html.replace(
    /<meta name="theme-color" content="#faf8f4">/gi,
    '<meta name="theme-color" content="#FBF6E8">',
  );
}

/** Лого + тег строки */
function swapHeaderLogo(html) {
  return html.replace(
    /<a([^>]*?)class="site-header__logo">\s*PALOMA\s*<\/a>/g,
    `<a$1class="site-header__logo">\n          <span class="site-header__logo-word">PALOMA</span>\n          <span class="site-header__logo-tag">flowers · coffee · you</span>\n        </a>`,
  );
}

function swapCart(html) {
  return html.replace(
    /<a([^>]*?)class="([^"]*\bsite-header__icon--cart[^"]*)"([^>]*)>/g,
    (_, a1, cls, a3) => {
      let c = cls;
      if (!c.includes("site-header__cart")) c += " site-header__cart";
      return `<a${a1}class="${c}"${a3}>`;
    },
  );
}

function swapFooter(html) {
  if (!html.includes("site-footer")) return html;

  html = html.replace(
    /<div class="site-footer__giant"([^>]*)>\s*PALOMA\s*<\/div>/gi,
    '<p class="site-footer__wordmark" aria-hidden="true">PALOMA</p>',
  );

  if (!html.includes("site-footer__giraffe")) {
    html = html.replace(
      /<footer class="site-footer"([^>]*)>/i,
      `<footer class="site-footer"$1>
    <img src="assets/images/giraffe.svg" alt="" class="site-footer__giraffe-silhouette" width="160" height="320" loading="lazy" />`,
    );
  }
  return html;
}

function normalizeCatalog(html) {
  return html.replace(
    /(\bfilter-btn\s+filter-chip\b)(?! chip)/gi,
    "$1 chip",
  );
}

const FILES = fs.readdirSync(".").filter((f) => f.endsWith(".html"));

for (const f of FILES) {
  let s = fs.readFileSync(f, "utf8");

  /* Дедуп случайный: если уже Blueprint */
  if (s.includes("paloma-loader") && s.includes("family=Italiana")) {
    s = swapHeaderLogo(s);
    s = swapCart(s);
    s = swapFooter(s);
    s = normalizeCatalog(s);
    fs.writeFileSync(f, s, "utf8");
    console.log("- touch", f);
    continue;
  }

  s = swapLoader(s);
  s = swapFonts(s);
  s = swapTheme(s);
  s = swapHeaderLogo(s);
  s = swapCart(s);
  s = swapFooter(s);
  s = normalizeCatalog(s);

  fs.writeFileSync(f, s, "utf8");
  console.log("+ patched", f);
}
