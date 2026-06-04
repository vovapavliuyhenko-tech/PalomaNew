/* ════════════════════════════════════════════════════════
   cursor.js — кастомный курсор PALOMA
   Небольшой круг + затухающий след
   ════════════════════════════════════════════════════════ */
(function initPalomaCursor() {
  "use strict";

  const isTouch =
    window.matchMedia("(hover: none)").matches ||
    window.matchMedia("(pointer: coarse)").matches ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;

  if (isTouch) return;
  if (document.getElementById("palomaCursorEl")) return;

  const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Настройки ──────────────────────────────────────────
     CURSOR_LAG близко к 1 = курсор почти мгновенно
     следует за мышкой, хвост плавно догоняет            */
  const CURSOR_LAG  = noMotion ? 1 : 0.92;   /* основной круг — очень быстро  */

  const TRAIL_COUNT = noMotion ? 0 : 10;
  /* Каждый следующий круг меньше и прозрачнее.
     Lag убывает → каждый следующий отстаёт сильнее.     */
  const TRAIL_SIZES   = [8.5, 8, 7.5, 7, 6.5, 6, 5, 4.5, 4, 3];
  const TRAIL_OPACITY = [0.72, 0.62, 0.52, 0.43, 0.35, 0.27, 0.20, 0.13, 0.08, 0.04];
  const TRAIL_LAGS    = [0.58, 0.46, 0.37, 0.30, 0.24, 0.19, 0.15, 0.12, 0.09, 0.07];

  /* ── Создаём элементы ── */
  document.body.classList.add("paloma-cursor-active");

  const cursor = document.createElement("div");
  cursor.className = "paloma-cursor is-hidden";
  cursor.id = "palomaCursorEl";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);

  const trail = [];
  for (let i = 0; i < TRAIL_COUNT; i++) {
    const dot = document.createElement("div");
    dot.className = "paloma-cursor-trail";
    dot.setAttribute("aria-hidden", "true");
    dot.style.cssText = `width:${TRAIL_SIZES[i]}px;height:${TRAIL_SIZES[i]}px;opacity:0`;
    document.body.appendChild(dot);
    trail.push({ el: dot, x: -300, y: -300, lag: TRAIL_LAGS[i], op: TRAIL_OPACITY[i] });
  }

  /* ── Состояние ── */
  let mx = -300, my = -300;
  let cx = -300, cy = -300;
  let isHovering = false, isTextField = false, isVisible = false;
  let raf;

  const HOVER_SELECTOR = [
    "a", "button", "[role='button']",
    "input[type='submit']", "input[type='button']",
    ".product-card", ".product-card__wishlist", ".product-card__btn",
    ".catalog-filter-btn", ".filter-chip", ".filter-btn",
    ".site-header__icon", ".site-header__cart",
    ".reviews-arrow", ".cart-qty-btn", ".pdp-size-btn",
    ".checkout-delivery-card", ".checkout-payment-card",
    ".checkout-interval-btn", ".checkout-toggle-btn",
    "[data-add-to-cart]", "[data-wishlist-btn]", "[data-cursor='hover']",
    ".curtain__card-btn", ".process-step__cta", ".paloma-hero__cta",
    ".client-nav-card", ".hscroll-card", ".menu-item",
    ".cof-menu__item", "label[for]", "select",
  ].join(", ");

  const TEXT_SELECTOR =
    'input[type="text"],input[type="tel"],input[type="email"],input[type="date"],input[type="number"],input[type="search"],textarea';

  function lerp(a, b, t) { return a + (b - a) * t; }

  function setHover(on) {
    if (isTextField) return;
    isHovering = on;
    cursor.classList.toggle("is-hovering", on);
    cursor.classList.remove("is-text");
  }

  function setTextMode(on) {
    isTextField = on;
    isHovering  = false;
    cursor.classList.toggle("is-text", on);
    cursor.classList.remove("is-hovering");
  }

  /* ── Events ── */
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!isVisible) {
      cx = mx; cy = my;
      trail.forEach(t => { t.x = mx; t.y = my; });
      cursor.classList.remove("is-hidden");
      isVisible = true;
    }
  }, { passive: true });

  document.addEventListener("mouseleave", () => {
    cursor.classList.add("is-hidden");
    trail.forEach(t => { t.el.style.opacity = "0"; });
    isVisible = false;
  });

  document.addEventListener("mouseenter", () => {
    if (mx > -300) { cursor.classList.remove("is-hidden"); isVisible = true; }
  });

  document.addEventListener("mouseover", (e) => {
    const el = e.target;
    if (!(el instanceof Element)) return;
    if (el.matches(TEXT_SELECTOR))      { setTextMode(true);  return; }
    if (el.closest(HOVER_SELECTOR))       setHover(true);
  }, { passive: true });

  document.addEventListener("mouseout", (e) => {
    const el = e.target;
    if (!(el instanceof Element)) return;
    if (el.matches(TEXT_SELECTOR)) { setTextMode(false); return; }
    const rel = e.relatedTarget;
    if (!(rel instanceof Element) || !rel.closest(HOVER_SELECTOR)) setHover(false);
  }, { passive: true });

  document.addEventListener("mousedown", () => cursor.classList.add("is-pressing"),    { passive: true });
  document.addEventListener("mouseup",   () => cursor.classList.remove("is-pressing"), { passive: true });

  /* ── RAF loop ── */
  function loop() {
    raf = requestAnimationFrame(loop);
    if (!isVisible) return;

    /* Основной круг — моментально за мышкой */
    cx = lerp(cx, mx, CURSOR_LAG);
    cy = lerp(cy, my, CURSOR_LAG);
    cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;

    if (!noMotion) {
      /* Каждый круг тянется к предыдущему с убывающим лагом */
      let px = cx, py = cy;
      trail.forEach(t => {
        t.x = lerp(t.x, px, t.lag);
        t.y = lerp(t.y, py, t.lag);
        t.el.style.transform = `translate(${t.x}px,${t.y}px) translate(-50%,-50%)`;
        /* Прозрачность по расстоянию от курсора: чем дальше — тем прозрачнее */
        const dist = Math.hypot(t.x - cx, t.y - cy);
        const fade = Math.max(0, 1 - dist / 80);
        t.el.style.opacity = String(t.op * fade);
        px = t.x; py = t.y;
      });
    }
  }

  loop();

  window.addEventListener("beforeunload", () => { if (raf) cancelAnimationFrame(raf); });
  window.PalomaCursor = { setHover, setTextMode, isActive: true };
  window.palomaRebindCursorHovers = function () {};
})();
