/* ════════════════════════════════════════════════════════
   cursor.js — кастомный курсор PALOMA (лёгкая версия)
   Одна точка-следящая (transform только) + кружок «смотреть»
   при наведении на кнопки/фото. Без SVG-фильтров, blend-цепочек
   и idle-анимаций — поэтому не лагает и не «залипает».
   ════════════════════════════════════════════════════════ */
(function initPalomaCursor() {
  "use strict";

  const isTouch =
    window.matchMedia("(hover: none)").matches ||
    window.matchMedia("(pointer: coarse)").matches ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;

  if (isTouch) return;
  if (document.getElementById("inkDot")) return;

  document.body.classList.add("paloma-cursor-active");

  /* ── Точка-курсор ── */
  const dot = document.createElement("div");
  dot.className = "ink-dot";
  dot.id = "inkDot";
  dot.setAttribute("aria-hidden", "true");
  document.body.appendChild(dot);

  /* ── Кружок «смотреть» ── */
  const look = document.createElement("div");
  look.className = "ink-look";
  look.id = "inkLook";
  look.setAttribute("aria-hidden", "true");
  look.innerHTML = '<span class="ink-look__label">смотреть</span>';
  document.body.appendChild(look);

  /* Мягкое подтягивание точки (1 = мгновенно, меньше = плавный шлейф) */
  const FOLLOW = 0.28;

  let mouseX = -100, mouseY = -100;
  let dotX = -100, dotY = -100;
  let visible = false;
  let isHovering = false;
  let isTextField = false;
  let raf = 0;

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

  /* ── Наведение / текстовые поля ── */
  function setHover(on) {
    if (isTextField) return;
    isHovering = on;
    dot.classList.toggle("is-hidden", on);
    if (on) {
      /* мгновенно ставим кружок под курсор */
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
      dot.classList.add("is-text");
    } else {
      dot.classList.remove("is-text");
    }
  }

  /* ── События ── */
  window.addEventListener(
    "mousemove",
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        visible = true;
        dot.classList.add("is-visible");
      }
    },
    { passive: true },
  );

  document.addEventListener("mouseleave", () => {
    dot.classList.remove("is-visible");
    look.classList.remove("is-on");
    visible = false;
  });
  document.addEventListener("mouseenter", () => {
    if (mouseX > -100) {
      dot.classList.add("is-visible");
      visible = true;
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

  /* ── Цикл отрисовки (лёгкий: только transform) ── */
  function render() {
    raf = requestAnimationFrame(render);
    dotX += (mouseX - dotX) * FOLLOW;
    dotY += (mouseY - dotY) * FOLLOW;
    dot.style.transform =
      `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
    look.style.transform =
      `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  }
  render();

  /* На случай сворачивания вкладки — перезапуск цикла, чтобы курсор
     не «застывал» после возврата на страницу */
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !raf) render();
  });

  window.addEventListener("beforeunload", () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  });

  /* Совместимость со старым API */
  window.PalomaCursor = { setHover, setTextMode, isActive: true };
  window.palomaRebindCursorHovers = function () {};
})();
