/* ════════════════════════════════════════════════════════
   cursor.js — кастомный курсор PALOMA
   Референс: millennium-carpets.ru
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

  const noMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ── Tunables ── */
  const CURSOR_LAG = noMotion ? 1 : 0.14;
  const TRAIL_COUNT = noMotion ? 0 : 10;
  const TRAIL_SIZES = [10, 9, 8, 7, 7, 6, 5, 5, 4, 3];
  const TRAIL_OPACITY = [0.18, 0.16, 0.14, 0.12, 0.1, 0.09, 0.08, 0.06, 0.05, 0.03];
  const TRAIL_LAGS = [0.1, 0.09, 0.08, 0.08, 0.07, 0.07, 0.06, 0.05, 0.05, 0.04];

  document.body.classList.add("paloma-cursor-active");

  const cursor = document.createElement("div");
  cursor.className = "paloma-cursor is-hidden";
  cursor.id = "palomaCursorEl";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = '<div class="paloma-cursor__dot"></div>';
  document.body.appendChild(cursor);

  const trail = [];
  for (let i = 0; i < TRAIL_COUNT; i++) {
    const dot = document.createElement("div");
    dot.className = "paloma-cursor-trail";
    dot.setAttribute("aria-hidden", "true");
    dot.style.width = `${TRAIL_SIZES[i]}px`;
    dot.style.height = `${TRAIL_SIZES[i]}px`;
    dot.style.opacity = "0";
    document.body.appendChild(dot);
    trail.push({
      el: dot,
      x: -200,
      y: -200,
      lag: TRAIL_LAGS[i],
      baseOpacity: TRAIL_OPACITY[i],
    });
  }

  let mx = -200;
  let my = -200;
  let cx = -200;
  let cy = -200;
  let isHovering = false;
  let isTextField = false;
  let isVisible = false;
  let raf;

  const HOVER_SELECTOR = [
    "a",
    "button",
    "[role='button']",
    "input[type='submit']",
    "input[type='button']",
    ".product-card",
    ".product-card__wishlist",
    ".product-card__btn",
    ".catalog-filter-btn",
    ".filter-chip",
    ".filter-btn",
    ".site-header__icon",
    ".site-header__cart",
    ".reviews-arrow",
    ".cart-qty-btn",
    ".pdp-size-btn",
    ".checkout-delivery-card",
    ".checkout-payment-card",
    ".checkout-interval-btn",
    ".checkout-toggle-btn",
    "[data-add-to-cart]",
    "[data-wishlist-btn]",
    "[data-cursor='hover']",
    ".curtain__card-btn",
    ".process-step__cta",
    ".paloma-hero__cta",
    ".client-nav-card",
    ".hscroll-card",
    ".menu-item",
    "label[for]",
    "select",
  ].join(", ");

  const TEXT_SELECTOR =
    'input[type="text"], input[type="tel"], input[type="email"], input[type="date"], input[type="number"], input[type="search"], textarea';

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function setHover(active) {
    if (isTextField) return;
    isHovering = active;
    cursor.classList.toggle("is-hovering", active);
    cursor.classList.remove("is-text");
  }

  function setTextMode(active) {
    isTextField = active;
    isHovering = false;
    cursor.classList.toggle("is-text", active);
    cursor.classList.remove("is-hovering");
  }

  document.addEventListener(
    "mousemove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!isVisible) {
        cx = mx;
        cy = my;
        trail.forEach((t) => {
          t.x = mx;
          t.y = my;
        });
        cursor.classList.remove("is-hidden");
        isVisible = true;
      }
    },
    { passive: true },
  );

  document.addEventListener("mouseleave", () => {
    cursor.classList.add("is-hidden");
    isVisible = false;
  });

  document.addEventListener("mouseenter", () => {
    if (mx >= 0) {
      cursor.classList.remove("is-hidden");
      isVisible = true;
    }
  });

  document.addEventListener(
    "mouseover",
    (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.matches(TEXT_SELECTOR)) {
        setTextMode(true);
        return;
      }
      if (target.closest(HOVER_SELECTOR)) setHover(true);
    },
    { passive: true },
  );

  document.addEventListener(
    "mouseout",
    (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.matches(TEXT_SELECTOR)) {
        setTextMode(false);
        return;
      }
      const related = e.relatedTarget;
      if (!(related instanceof Element) || !related.closest(HOVER_SELECTOR)) {
        setHover(false);
      }
    },
    { passive: true },
  );

  document.addEventListener(
    "mousedown",
    () => {
      cursor.classList.add("is-pressing");
    },
    { passive: true },
  );

  document.addEventListener(
    "mouseup",
    () => {
      cursor.classList.remove("is-pressing");
    },
    { passive: true },
  );

  function loop() {
    raf = requestAnimationFrame(loop);
    if (!isVisible) return;

    cx = lerp(cx, mx, CURSOR_LAG);
    cy = lerp(cy, my, CURSOR_LAG);
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;

    if (!noMotion) {
      let prevX = cx;
      let prevY = cy;
      trail.forEach((t, i) => {
        t.x = lerp(t.x, prevX, t.lag);
        t.y = lerp(t.y, prevY, t.lag);
        t.el.style.transform = `translate(${t.x}px, ${t.y}px) translate(-50%, -50%)`;
        const dist = Math.hypot(t.x - mx, t.y - my);
        const fade = Math.max(0, 1 - dist / 120);
        t.el.style.opacity = String(t.baseOpacity * fade);
        prevX = t.x;
        prevY = t.y;
      });
    }
  }

  loop();

  window.addEventListener("beforeunload", () => {
    if (raf) cancelAnimationFrame(raf);
  });

  window.PalomaCursor = { setHover, setTextMode, isActive: true };
  window.palomaRebindCursorHovers = function palomaRebindCursorHovers() {};
})();
