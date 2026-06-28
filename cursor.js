/* ════════════════════════════════════════════════════════
   cursor.js — кастомный курсор PALOMA
   «Чернильный/жидкий» курсор: цепочка точек слипается в каплю
   через SVG goo-фильтр и тянется за мышью. При наведении на
   кнопки/фото капля уходит, появляется кружок «смотреть».

   Оптимизация против лагов и «залипания»:
   • 12 точек вместо 20;
   • НЕТ idle-swirl (он давал застывший сгусток);
   • цикл отрисовки ОСТАНАВЛИВАЕТСЯ, когда мышь стоит и капля
     догнала курсор — поэтому в покое нагрузка нулевая;
   • перезапуск на mousemove и при возврате на вкладку.
   ════════════════════════════════════════════════════════ */
(function initPalomaCursor() {
  "use strict";

  const isTouch =
    window.matchMedia("(hover: none)").matches ||
    window.matchMedia("(pointer: coarse)").matches ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;

  if (isTouch) return;
  if (document.getElementById("inkCursor")) return;

  document.body.classList.add("paloma-cursor-active");

  /* ── SVG goo-фильтр (слипание точек в чернильную каплю) ── */
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "ink-icon");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML =
    '<defs><filter id="palomaGoo">' +
    '<feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/>' +
    '<feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 32 -14" result="goo"/>' +
    '<feComposite in="SourceGraphic" in2="goo" operator="atop"/>' +
    "</filter></defs>";
  document.body.appendChild(svg);

  /* ── Контейнер капли + точки ── */
  const cursor = document.createElement("div");
  cursor.className = "ink-cursor";
  cursor.id = "inkCursor";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);

  /* ── Кружок «смотреть» ── */
  const look = document.createElement("div");
  look.className = "ink-look";
  look.id = "inkLook";
  look.setAttribute("aria-hidden", "true");
  look.innerHTML = '<span class="ink-look__label">смотреть</span>';
  document.body.appendChild(look);

  /* ── Параметры ── */
  const amount = 12;
  const width = 24;
  const TRAIL = 0.42; // жёстче = быстрее догоняет, меньше «подтягивания»

  let mouseX = -100, mouseY = -100;
  let visible = false;
  let isHovering = false;
  let isTextField = false;
  let raf = 0;
  let lastMoveAt = 0;
  let idlePhase = 0;

  const dots = [];

  const HOVER_SELECTOR = [
    "a", "button", "[role='button']",
    "input[type='submit']", "input[type='button']",
    "label[for]", "select",
    ".product-card", ".product-card__media", ".product-card__wishlist",
    ".product-card__btn", ".catalog-filter-btn", ".filter-chip", ".filter-btn",
    ".site-header__icon", ".site-header__cart",
    ".reviews-arrow", ".cart-qty-btn", ".pdp-size-btn",
    ".checkout-delivery-card", ".checkout-payment-card",
    ".checkout-interval-btn", ".checkout-toggle-btn",
    "[data-add-to-cart]", "[data-wishlist-btn]", "[data-cursor='hover']",
    ".curtain__card-btn", ".process-step__cta", ".paloma-hero__cta",
    ".client-nav-card", ".hscroll-card", ".menu-item", ".cof-menu__item",
    ".cookie-bar__btn",
    /* фото */
    ".ea-proj", ".ea-proc__ph", ".home-article-card", ".home-article-card__media",
    ".gallery img", "[data-lightbox]", ".sf2-soc",
  ].join(", ");

  const TEXT_SELECTOR =
    'input[type="text"],input[type="tel"],input[type="email"],input[type="date"],input[type="number"],input[type="search"],textarea';

  /* Тёмные секции — кружок «смотреть» становится розовым */
  const DARK_SELECTOR = ".site-footer, [data-cursor-dark]";

  /* ── Точка цепочки ── */
  for (let i = 0; i < amount; i++) {
    const el = document.createElement("span");
    const scale = 1 - 0.05 * i;
    el.style.transform = `translate(-100px, -100px) translate(-50%, -50%) scale(${scale})`;
    cursor.appendChild(el);
    dots.push({ x: -100, y: -100, scale: scale, el: el });
  }

  /* ── Наведение / текстовые поля ── */
  function setHover(on) {
    if (isTextField) return;
    isHovering = on;
    cursor.classList.toggle("is-hidden", on);
    if (on) {
      look.style.transform =
        `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    }
    look.classList.toggle("is-on", on);
  }

  function setTextMode(on) {
    isTextField = on;
    if (on) {
      isHovering = false;
      look.classList.remove("is-on");
      cursor.classList.add("is-text");
    } else {
      cursor.classList.remove("is-text");
    }
  }

  /* ── Запуск/перезапуск цикла ── */
  function kick() {
    lastMoveAt = performance.now();
    if (!raf) raf = requestAnimationFrame(render);
  }

  /* ── События ── */
  window.addEventListener(
    "mousemove",
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        visible = true;
        cursor.classList.add("is-visible");
      }
      kick();
    },
    { passive: true },
  );

  document.addEventListener("mouseleave", () => {
    cursor.classList.remove("is-visible");
    look.classList.remove("is-on");
    visible = false;
  });
  document.addEventListener("mouseenter", () => {
    if (mouseX > -100) {
      cursor.classList.add("is-visible");
      visible = true;
      kick();
    }
  });

  document.addEventListener(
    "mouseover",
    (e) => {
      const el = e.target;
      if (!(el instanceof Element)) return;
      look.classList.toggle("on-dark", !!el.closest(DARK_SELECTOR));
      if (el.matches(TEXT_SELECTOR)) {
        setTextMode(true);
        return;
      }
      if (el.closest(HOVER_SELECTOR)) setHover(true);
    },
    { passive: true },
  );
  document.addEventListener(
    "mouseout",
    (e) => {
      const el = e.target;
      if (!(el instanceof Element)) return;
      if (el.matches(TEXT_SELECTOR)) {
        setTextMode(false);
        return;
      }
      const rel = e.relatedTarget;
      if (!(rel instanceof Element) || !rel.closest(HOVER_SELECTOR)) setHover(false);
    },
    { passive: true },
  );

  document.addEventListener("mousedown", () => look.classList.add("is-pressing"), { passive: true });
  document.addEventListener("mouseup", () => look.classList.remove("is-pressing"), { passive: true });

  /* ── Цикл отрисовки ── */
  function render() {
    /* кружок «смотреть» — мгновенно под курсором */
    look.style.transform =
      `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

    const still = performance.now() - lastMoveAt > 140;

    if (still) {
      /* ПОКОЙ: капля «дышит» — компактно шевелится вокруг курсора */
      idlePhase += 0.05;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const a = idlePhase + (i / dots.length) * Math.PI * 2;
        const r = 4 + 2.5 * Math.sin(idlePhase * 0.7 + i);
        const tx = mouseX + Math.cos(a) * r;
        const ty = mouseY + Math.sin(a * 1.1) * r;
        d.x += (tx - d.x) * 0.18;
        d.y += (ty - d.y) * 0.18;
        d.el.style.transform =
          `translate(${d.x}px, ${d.y}px) translate(-50%, -50%) scale(${d.scale})`;
      }
    } else {
      /* ДВИЖЕНИЕ: цепочка тянется за мышью (голова — курсор) */
      let prevX = mouseX, prevY = mouseY;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += (prevX - d.x) * TRAIL;
        d.y += (prevY - d.y) * TRAIL;
        d.el.style.transform =
          `translate(${d.x}px, ${d.y}px) translate(-50%, -50%) scale(${d.scale})`;
        prevX = d.x; prevY = d.y;
      }
    }

    /* петля крутится, пока курсор в окне; уходит — засыпает */
    if (visible) {
      raf = requestAnimationFrame(render);
    } else {
      raf = 0;
    }
  }

  /* перезапуск после возврата на вкладку */
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) kick();
  });

  window.addEventListener("beforeunload", () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  });

  /* Совместимость со старым API */
  window.PalomaCursor = { setHover, setTextMode, isActive: true };
  window.palomaRebindCursorHovers = function () {};
})();
