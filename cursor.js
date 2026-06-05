/* ════════════════════════════════════════════════════════
   cursor.js — кастомный курсор PALOMA
   Хвост-комета: тонкий сужающийся след изгибается по траектории
   движения (запятая/полумесяц), в покое — маленькая точка.
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

  /* Длина и плавность хвоста */
  const NODES    = noMotion ? 1 : 18;   /* число узлов в шлейфе */
  const EASE     = 0.34;                 /* как быстро узлы догоняют предыдущий */
  const HEAD_W   = 8;                    /* толщина у головы, px */
  const COLOR    = "#2a120c";

  /* ── Элементы ── */
  document.body.classList.add("paloma-cursor-active");

  /* Canvas со шлейфом */
  const canvas = document.createElement("canvas");
  canvas.id = "palomaCursorCanvas";
  canvas.className = "paloma-cursor-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  /* DOM-кружок «смотреть» (виден только на ховере) */
  const cursor = document.createElement("div");
  cursor.className = "paloma-cursor is-hidden";
  cursor.id = "palomaCursorEl";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = '<span class="paloma-cursor__label">смотреть</span>';
  document.body.appendChild(cursor);

  let dpr = Math.max(1, window.devicePixelRatio || 1);
  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width  = Math.floor(window.innerWidth  * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width  = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  /* ── Состояние ── */
  let mx = -300, my = -300;
  const nodes = [];
  for (let i = 0; i < NODES; i++) nodes.push({ x: -300, y: -300 });
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
      for (const n of nodes) { n.x = mx; n.y = my; }
      cursor.classList.remove("is-hidden");
      isVisible = true;
    }
  }, { passive: true });

  document.addEventListener("mouseleave", () => {
    cursor.classList.add("is-hidden");
    isVisible = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    /* Цепочка узлов тянется к мыши — формирует изогнутый шлейф */
    nodes[0].x += (mx - nodes[0].x) * EASE;
    nodes[0].y += (my - nodes[0].y) * EASE;
    for (let i = 1; i < NODES; i++) {
      nodes[i].x += (nodes[i - 1].x - nodes[i].x) * EASE;
      nodes[i].y += (nodes[i - 1].y - nodes[i].y) * EASE;
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    /* На ховере/в текстовом поле шлейф прячем — показываем DOM-кружок */
    if (!isVisible || isHovering || isTextField || noMotion) {
      /* DOM-кружок позиционируем под мышью */
      cursor.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      return;
    }
    cursor.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;

    /* Сужающийся хвост: сегменты с убывающей толщиной + скруглением */
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = COLOR;
    ctx.fillStyle = COLOR;

    /* голова — точка */
    ctx.beginPath();
    ctx.arc(nodes[0].x, nodes[0].y, HEAD_W / 2, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < NODES - 1; i++) {
      const t = i / (NODES - 1);
      const w = HEAD_W * (1 - t);
      if (w < 0.4) break;
      ctx.beginPath();
      ctx.lineWidth = w;
      ctx.moveTo(nodes[i].x, nodes[i].y);
      /* сглаживаем кривую через среднюю точку */
      const mxp = (nodes[i].x + nodes[i + 1].x) / 2;
      const myp = (nodes[i].y + nodes[i + 1].y) / 2;
      ctx.quadraticCurveTo(nodes[i].x, nodes[i].y, mxp, myp);
      ctx.lineTo(nodes[i + 1].x, nodes[i + 1].y);
      ctx.stroke();
    }
  }

  loop();

  window.addEventListener("beforeunload", () => { if (raf) cancelAnimationFrame(raf); });
  window.PalomaCursor = { setHover, setTextMode, isActive: true };
  window.palomaRebindCursorHovers = function () {};
})();
