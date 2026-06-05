/* ════════════════════════════════════════════════════════
   cursor.js — кастомный курсор PALOMA
   Одно полупрозрачное кольцо, плавно следует за мышью.
   На ховере кнопок — большой круг «смотреть».
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

  /* Чем ближе к 1 — тем меньше отставание. 0.35 = лёгкая инерция. */
  const CURSOR_LAG = noMotion ? 1 : 0.35;

  /* ── Создаём элемент ── */
  document.body.classList.add("paloma-cursor-active");

  const cursor = document.createElement("div");
  cursor.className = "paloma-cursor is-hidden";
  cursor.id = "palomaCursorEl";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = '<span class="paloma-cursor__label">смотреть</span>';
  document.body.appendChild(cursor);

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
      cursor.classList.remove("is-hidden");
      isVisible = true;
    }
  }, { passive: true });

  document.addEventListener("mouseleave", () => {
    cursor.classList.add("is-hidden");
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
    cx = lerp(cx, mx, CURSOR_LAG);
    cy = lerp(cy, my, CURSOR_LAG);
    cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
  }

  loop();

  window.addEventListener("beforeunload", () => { if (raf) cancelAnimationFrame(raf); });
  window.PalomaCursor = { setHover, setTextMode, isActive: true };
  window.palomaRebindCursorHovers = function () {};
})();
