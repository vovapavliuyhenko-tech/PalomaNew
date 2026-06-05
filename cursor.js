/* ════════════════════════════════════════════════════════
   cursor.js — кастомный курсор PALOMA
   Точка (следует мгновенно) + кольцо-контур (плавно догоняет).
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

  /* Кольцо плавно догоняет точку. Меньше = сильнее отставание/инерция. */
  const RING_LAG = noMotion ? 1 : 0.18;

  /* ── Создаём элементы ── */
  document.body.classList.add("paloma-cursor-active");

  /* Кольцо — оно же превращается в большой круг «смотреть» */
  const ring = document.createElement("div");
  ring.className = "paloma-cursor is-hidden";
  ring.id = "palomaCursorEl";
  ring.setAttribute("aria-hidden", "true");
  ring.innerHTML = '<span class="paloma-cursor__label">смотреть</span>';
  document.body.appendChild(ring);

  /* Точка — следует за мышью мгновенно */
  const dot = document.createElement("div");
  dot.className = "paloma-cursor-dot is-hidden";
  dot.setAttribute("aria-hidden", "true");
  document.body.appendChild(dot);

  /* ── Состояние ── */
  let mx = -300, my = -300;
  let rx = -300, ry = -300;
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
    ring.classList.toggle("is-hovering", on);
    ring.classList.remove("is-text");
    dot.classList.toggle("is-suppressed", on);
  }

  function setTextMode(on) {
    isTextField = on;
    isHovering  = false;
    ring.classList.toggle("is-text", on);
    ring.classList.remove("is-hovering");
    dot.classList.toggle("is-suppressed", on);
  }

  /* ── Events ── */
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!isVisible) {
      rx = mx; ry = my;
      ring.classList.remove("is-hidden");
      dot.classList.remove("is-hidden");
      isVisible = true;
    }
  }, { passive: true });

  document.addEventListener("mouseleave", () => {
    ring.classList.add("is-hidden");
    dot.classList.add("is-hidden");
    isVisible = false;
  });

  document.addEventListener("mouseenter", () => {
    if (mx > -300) {
      ring.classList.remove("is-hidden");
      dot.classList.remove("is-hidden");
      isVisible = true;
    }
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

  document.addEventListener("mousedown", () => ring.classList.add("is-pressing"),    { passive: true });
  document.addEventListener("mouseup",   () => ring.classList.remove("is-pressing"), { passive: true });

  /* ── RAF loop ── */
  function loop() {
    raf = requestAnimationFrame(loop);
    if (!isVisible) return;

    /* Точка — мгновенно за мышью */
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;

    /* Кольцо — плавно догоняет */
    rx = lerp(rx, mx, RING_LAG);
    ry = lerp(ry, my, RING_LAG);
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
  }

  loop();

  window.addEventListener("beforeunload", () => { if (raf) cancelAnimationFrame(raf); });
  window.PalomaCursor = { setHover, setTextMode, isActive: true };
  window.palomaRebindCursorHovers = function () {};
})();
