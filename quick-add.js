/* ═══════════════════════════════════════════════════════════
   quick-add.js — быстрый выбор размера прямо на карточке товара
   (главная страница). Использует существующий PalomaCart.add,
   схема lineId «id-size» совпадает со страницей товара product.js.
   Ничего в корзине/каруселях не ломает: только дополняет карточки.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  function money(n) {
    return Math.round(n).toLocaleString("ru-RU") + " ₽";
  }

  function bySlug() {
    var map = {};
    (window.PALOMA_PRODUCTS || []).forEach(function (p) {
      if (p && p.slug) map[p.slug] = p;
    });
    return map;
  }

  function slugFromCard(card) {
    var more = card.querySelector(".home-product-card__more, .home-product-card__title a, .home-product-card__media");
    if (!more) return null;
    var href = more.getAttribute("href") || "";
    var m = href.match(/[?&]slug=([a-z0-9-]+)/i);
    return m ? m[1] : null;
  }

  /* ── Общий поповер выбора размера ─────────────────────────── */
  var pop, els = {}, current = null;

  function buildPopover() {
    pop = document.createElement("div");
    pop.className = "pqa";
    pop.hidden = true;
    pop.innerHTML =
      '<div class="pqa__backdrop" data-pqa-close></div>' +
      '<div class="pqa__panel" role="dialog" aria-modal="true" aria-labelledby="pqaTitle">' +
      '<button class="pqa__close" type="button" data-pqa-close aria-label="Закрыть">' +
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>' +
      '<div class="pqa__head">' +
      '<span class="pqa__media"><img alt="" decoding="async"></span>' +
      '<span class="pqa__headtext"><span class="pqa__title" id="pqaTitle"></span>' +
      '<span class="pqa__hint">Цена зависит от размера S/M/L/XL и дополнений</span></span>' +
      '</div>' +
      '<div class="pqa__sizes" role="group" aria-label="Размер букета"></div>' +
      '<p class="pqa__price"></p>' +
      '<button class="pqa__add" type="button">В корзину</button>' +
      '<a class="pqa__more" href="#">Подробнее о букете</a>' +
      '</div>';
    document.body.appendChild(pop);

    els.panel = pop.querySelector(".pqa__panel");
    els.img = pop.querySelector(".pqa__media img");
    els.title = pop.querySelector(".pqa__title");
    els.sizes = pop.querySelector(".pqa__sizes");
    els.price = pop.querySelector(".pqa__price");
    els.add = pop.querySelector(".pqa__add");
    els.more = pop.querySelector(".pqa__more");

    pop.addEventListener("click", function (e) {
      if (e.target.closest("[data-pqa-close]")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !pop.hidden) close();
    });
    els.add.addEventListener("click", commit);
  }

  function selectSize(sizeObj, btn) {
    current.size = sizeObj;
    els.sizes.querySelectorAll(".pqa__size").forEach(function (b) {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-pressed", b === btn ? "true" : "false");
    });
    var total = current.product.price + (sizeObj.priceDelta || 0);
    els.price.textContent = money(total);
  }

  function open(product) {
    if (!pop) buildPopover();
    current = { product: product, size: null };

    els.img.src = product.image || "";
    els.img.alt = product.name || "";
    els.title.textContent = product.name || "Букет";
    els.more.setAttribute("href", "product.html?slug=" + encodeURIComponent(product.slug));

    var sizes = Array.isArray(product.sizes) && product.sizes.length
      ? product.sizes
      : [{ code: "M", label: "M", priceDelta: 0 }];

    els.sizes.innerHTML = "";
    els.sizes.hidden = sizes.length < 2;
    sizes.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "pqa__size";
      b.textContent = s.label || s.code;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () { selectSize(s, b); });
      els.sizes.appendChild(b);
      if (i === 0) selectSize(s, b);
    });

    pop.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () { pop.classList.add("is-open"); });
    els.add.focus();
  }

  function close() {
    if (!pop) return;
    pop.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(function () { pop.hidden = true; }, 260);
  }

  function commit() {
    if (!current || !window.PalomaCart) return;
    var p = current.product;
    var s = current.size || { code: "M", label: "M", priceDelta: 0 };
    window.PalomaCart.add({
      id: p.id + "-" + String(s.code || s.label || "m").toLowerCase(),
      name: p.name,
      price: p.price + (s.priceDelta || 0),
      qty: 1,
      size: s.label || s.code || "",
      image: p.image || "",
      category: (p.categories && p.categories[0]) || "",
      slug: p.slug || "",
    });
    close();
  }

  /* ── Дополняем карточки на главной ────────────────────────── */
  function enhance() {
    var map = bySlug();
    document.querySelectorAll(".home-product-card").forEach(function (card) {
      if (card.dataset.qaReady) return;
      var slug = slugFromCard(card);
      var product = slug && map[slug];
      if (!product) return;
      var actions = card.querySelector(".home-product-card__actions");
      if (!actions) return;
      card.dataset.qaReady = "1";

      var base = product.price;
      var add = document.createElement("button");
      add.type = "button";
      add.className = "home-product-card__add";
      add.setAttribute("data-quick-add", slug);
      add.innerHTML = 'В корзину · от ' + money(base);
      actions.insertBefore(add, actions.firstChild);

      var more = actions.querySelector(".home-product-card__more");
      if (more) more.classList.add("home-product-card__more--secondary");

      /* микро-подсказка к цене «от …» */
      var priceEl = card.querySelector(".home-product-card__price");
      if (priceEl && !priceEl.querySelector(".home-product-card__pricehint")) {
        var hint = document.createElement("span");
        hint.className = "home-product-card__pricehint";
        hint.setAttribute("tabindex", "0");
        hint.setAttribute("role", "note");
        hint.setAttribute("aria-label", "Цена зависит от размера S/M/L/XL и дополнений");
        hint.setAttribute("title", "Цена зависит от размера S/M/L/XL и дополнений");
        hint.textContent = "?";
        priceEl.appendChild(hint);
      }
    });
  }

  /* делегирование: работает и для клонов карусели */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-quick-add]");
    if (!btn) return;
    e.preventDefault();
    var product = bySlug()[btn.getAttribute("data-quick-add")];
    if (product) open(product);
  });

  function boot() {
    enhance();
    /* повтор после возможной динамической дорисовки */
    setTimeout(enhance, 400);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
