import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const d = "motion".replace("motion", "div");
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "coffee.html");
let html = fs.readFileSync(file, "utf8");

const menuSection = `    <section class="coffee-menu-section" id="coffee-menu">
      <${d} class="menu-hover-photo-slot" id="menuHoverPhotoSlot" aria-hidden="true">
        <${d} class="menu-hover-photo">
          <${d} class="menu-hover-photo__img" role="presentation"></${d}>
        </${d}>
      </${d}>

      <header class="coffee-menu-section__header">
        <span class="coffee-menu-section__eyebrow">[ Меню ]</span>
        <h2 class="coffee-menu-section__title">PALOMA Coffee</h2>
        <p class="coffee-menu-section__lead">Кофе, чай, выпечка и лимонады — всё можно добавить к букету или заказать отдельно.</p>
      </header>

      <${d} class="coffee-menu-filters" id="coffeeMenuFilters" role="tablist" aria-label="Категории меню">
        <button type="button" class="filter-chip is-active" data-menu-cat="all" aria-pressed="true">Все</button>
        <button type="button" class="filter-chip" data-menu-cat="coffee" aria-pressed="false">Кофе</button>
        <button type="button" class="filter-chip" data-menu-cat="tea" aria-pressed="false">Чай</button>
        <button type="button" class="filter-chip" data-menu-cat="pastry" aria-pressed="false">Выпечка</button>
        <button type="button" class="filter-chip" data-menu-cat="desserts" aria-pressed="false">Десерты</button>
        <button type="button" class="filter-chip" data-menu-cat="lemonades" aria-pressed="false">Лимонады</button>
      </${d}>

      <${d} class="coffee-menu-grid" id="coffeeMenuGrid" aria-live="polite"></${d}>
    </section>`;

const curtains = `    <section class="coffee-curtains" id="coffee-process" aria-label="Этапы приготовления кофе">
      <article class="coffee-curtain" style="--curtain-z: 1">
        <${d} class="coffee-curtain__bg">
          <video class="coffee-curtain__video" muted loop playsinline preload="metadata" aria-hidden="true">
            <source src="assets/video/coffee-beans.mp4" type="video/mp4">
          </video>
          <${d} class="coffee-curtain__bg-placeholder coffee-curtain__bg-placeholder--1" aria-hidden="true"></${d}>
        </${d}>
        <${d} class="coffee-curtain__overlay" aria-hidden="true"></${d}>
        <${d} class="coffee-curtain__mini coffee-curtain__mini--1" aria-hidden="true"></${d}>
        <${d} class="coffee-curtain__content">
          <span class="coffee-curtain__num">01</span>
          <h3 class="coffee-curtain__title">Зёрна</h3>
          <p class="coffee-curtain__text">Отбираем зерно под сезон и вкус — основа каждой чашки в PALOMA.</p>
        </${d}>
      </article>

      <article class="coffee-curtain" style="--curtain-z: 2">
        <${d} class="coffee-curtain__bg">
          <video class="coffee-curtain__video" muted loop playsinline preload="metadata" aria-hidden="true">
            <source src="assets/video/coffee-grind.mp4" type="video/mp4">
          </video>
          <${d} class="coffee-curtain__bg-placeholder coffee-curtain__bg-placeholder--2" aria-hidden="true"></${d}>
        </${d}>
        <${d} class="coffee-curtain__overlay" aria-hidden="true"></${d}>
        <${d} class="coffee-curtain__mini coffee-curtain__mini--2" aria-hidden="true"></${d}>
        <${d} class="coffee-curtain__content">
          <span class="coffee-curtain__num">02</span>
          <h3 class="coffee-curtain__title">Помол</h3>
          <p class="coffee-curtain__text">Помол под способ заваривания — чтобы раскрыть аромат и баланс.</p>
        </${d}>
      </article>

      <article class="coffee-curtain" style="--curtain-z: 3">
        <${d} class="coffee-curtain__bg">
          <video class="coffee-curtain__video" muted loop playsinline preload="metadata" aria-hidden="true">
            <source src="assets/video/coffee-brew.mp4" type="video/mp4">
          </video>
          <${d} class="coffee-curtain__bg-placeholder coffee-curtain__bg-placeholder--3" aria-hidden="true"></${d}>
        </${d}>
        <${d} class="coffee-curtain__overlay" aria-hidden="true"></${d}>
        <${d} class="coffee-curtain__mini coffee-curtain__mini--3" aria-hidden="true"></${d}>
        <${d} class="coffee-curtain__content">
          <span class="coffee-curtain__num">03</span>
          <h3 class="coffee-curtain__title">Приготовление</h3>
          <p class="coffee-curtain__text">Температура, молоко и текстура — бариста собирает вкус аккуратно.</p>
        </${d}>
      </article>

      <article class="coffee-curtain" style="--curtain-z: 4">
        <${d} class="coffee-curtain__bg">
          <video class="coffee-curtain__video" muted loop playsinline preload="metadata" aria-hidden="true">
            <source src="assets/video/coffee-serve.mp4" type="video/mp4">
          </video>
          <${d} class="coffee-curtain__bg-placeholder coffee-curtain__bg-placeholder--4" aria-hidden="true"></${d}>
        </${d}>
        <${d} class="coffee-curtain__overlay" aria-hidden="true"></${d}>
        <${d} class="coffee-curtain__mini coffee-curtain__mini--4" aria-hidden="true"></${d}>
        <${d} class="coffee-curtain__content">
          <span class="coffee-curtain__num">04</span>
          <h3 class="coffee-curtain__title">Подача</h3>
          <p class="coffee-curtain__text">Чашка к букету, с собой или в зале — часть атмосферы PALOMA.</p>
        </${d}>
      </article>
    </section>

    <section class="coffee-cta-final" aria-label="Заказать кофе">
      <${d} class="coffee-cta-final__inner">
        <a href="#coffee-menu" class="btn btn--coffee-hero coffee-cta-final__primary" data-cursor="hover">
          Добавить кофе к букету
        </a>
        <a href="catalog.html" class="btn btn--coffee-outline coffee-cta-final__secondary" data-cursor="hover">
          Перейти в каталог
        </a>
      </${d}>
    </section>`;

const menuRe =
  /    <section class="coffee-menu-section" id="coffee-menu">[\s\S]*?    <\/section>\r?\n\r?\n    <section class="coffee-combo/;
const tailRe =
  /    <section class="coffee-combo[\s\S]*?  <\/main>/;

if (!menuRe.test(html)) {
  console.error("menu pattern not found");
  process.exit(1);
}
html = html.replace(menuRe, menuSection + '\r\n\r\n    <section class="coffee-combo');

if (!tailRe.test(html)) {
  console.error("tail pattern not found");
  process.exit(1);
}
html = html.replace(tailRe, curtains + "\r\n\r\n  </main>");

if (!html.includes("coffee-menu-data.js")) {
  html = html.replace(
    '  <script src="coffee.js"></script>',
    '  <script src="coffee-menu-data.js"></script>\r\n  <script src="coffee.js"></script>',
  );
}

fs.writeFileSync(file, html);
console.log("patched menu + curtains");
