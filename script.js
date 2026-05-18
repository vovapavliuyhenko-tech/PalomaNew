(function () {
  "use strict";

  function syncBodyOverflow() {
    const modalOpen = document
      .getElementById("productModal")
      ?.classList.contains("is-open");
    const cartOpen = document
      .getElementById("cartDrawer")
      ?.classList.contains("is-open");
    document.body.style.overflow =
      modalOpen || cartOpen ? "hidden" : "";
  }

  /* Loader PALOMA Blueprint */
  (function initPalomaLoader() {
    const loader = document.getElementById("palomaLoader");
    if (!loader) return;

    const doneKey = "paloma_loader_done";
    const legacyKeys = ["paloma_pl_done", "paloma_loader_seen"];
    const already =
      sessionStorage.getItem(doneKey) ||
      legacyKeys.some((k) => sessionStorage.getItem(k));
    if (already) {
      loader.style.display = "none";
      return;
    }

    document.body.classList.add("loader-lock");

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function finish() {
      legacyKeys.forEach((k) => sessionStorage.setItem(k, "1"));
      sessionStorage.setItem(doneKey, "1");
      document.body.classList.remove("loader-lock");
      syncBodyOverflow();
    }

    if (reducedMotion) {
      setTimeout(() => {
        loader.style.opacity = "0";
        loader.style.transition = "opacity 500ms ease";
        setTimeout(() => {
          loader.style.display = "none";
          finish();
        }, 520);
      }, 700);
      return;
    }

    const MIN_MS = 1200;
    const startTime = Date.now();

    function hideLoader() {
      const elapsed = Date.now() - startTime;
      const wait = Math.max(0, MIN_MS - elapsed);
      setTimeout(() => {
        loader.classList.add("is-leaving");
        setTimeout(() => {
          loader.style.display = "none";
          finish();
        }, 720);
      }, wait);
    }

    const fallback = setTimeout(hideLoader, 2500);

    if (document.readyState === "complete") {
      clearTimeout(fallback);
      hideLoader();
    } else {
      window.addEventListener(
        "load",
        () => {
          clearTimeout(fallback);
          hideLoader();
        },
        { once: true }
      );
    }
  })();

  /* Корзина v3 (миграция с paloma_cart_v1) */
  window.PalomaCart = (function () {
    const STORAGE_KEY = "paloma_cart_v3";
    const LEGACY_KEY = "paloma_cart_v1";

    try {
      if (!localStorage.getItem(STORAGE_KEY) && localStorage.getItem(LEGACY_KEY)) {
        localStorage.setItem(STORAGE_KEY, localStorage.getItem(LEGACY_KEY));
      }
    } catch (e) {
      /* ignore */
    }

    let items = [];
    try {
      items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(items)) items = [];
    } catch (e) {
      items = [];
    }

    const drawer = document.getElementById("cartDrawer");
    const bodyEl = document.getElementById("cartBody");
    const emptyEl = document.getElementById("cartEmpty");
    const footerEl = document.getElementById("cartFooter");
    const subtotalEl = document.getElementById("cartSubtotal");
    const totalEl = document.getElementById("cartTotal");
    const checkoutBtn = document.getElementById("cartCheckout");

    function escHtml(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    function calcTotal(arr) {
      return arr.reduce((s, i) => s + i.price * (i.qty || 1), 0);
    }

    function setCartCountHeader() {
      const count = items.reduce((s, i) => s + (i.qty || 1), 0);
      document
        .querySelectorAll(".site-header__cart-count, #cartCount")
        .forEach((el) => {
          el.textContent = count > 0 ? String(count) : "0";
          el.classList.toggle("is-empty", count === 0);
        });
    }

    function render() {
      if (!bodyEl || !footerEl || !emptyEl) {
        setCartCountHeader();
        return;
      }

      if (items.length === 0) {
        bodyEl.innerHTML = "";
        bodyEl.style.display = "none";
        footerEl.classList.remove("is-visible");
        emptyEl.classList.remove("is-hidden");
        if (subtotalEl) subtotalEl.textContent = "0 ₽";
        if (totalEl) totalEl.textContent = "0 ₽";
        setCartCountHeader();
        return;
      }

      emptyEl.classList.add("is-hidden");
      bodyEl.style.display = "block";
      footerEl.classList.add("is-visible");

      bodyEl.innerHTML = items
        .map((item) => {
          const id = escHtml(item.id);
          const qty = item.qty || 1;
          const meta =
            (item.size && item.size !== "—"
              ? `Размер ${escHtml(item.size)}`
              : "") +
            (item.addons && item.addons.length
              ? ` · ${escHtml(item.addons.filter(Boolean).join(", "))}`
              : "");
          return `
        <div class="cart-item" data-id="${id}">
          <div class="cart-item__img" style="background: ${item.bg || "var(--color-bg-alt)"};"></div>
          <div class="cart-item__info">
            <div class="cart-item__name">${escHtml(item.name)}</div>
            <div class="cart-item__meta">${meta || " "}</div>
            <div class="cart-item__bottom">
              <span class="cart-item__price">${(
                item.price * qty
              ).toLocaleString("ru-RU")} ₽</span>
              <div class="cart-item__qty">
                <button type="button" class="quantity-btn" data-action="dec" data-cart-id="${id}" aria-label="Меньше">−</button>
                <span class="cart-item__qty-val">${qty}</span>
                <button type="button" class="quantity-btn" data-action="inc" data-cart-id="${id}" aria-label="Больше">+</button>
              </div>
            </div>
          </div>
          <button type="button" class="cart-item__remove" data-action="remove" data-cart-id="${id}" aria-label="Удалить">×</button>
        </div>`;
        })
        .join("");

      const subtotal = calcTotal(items);
      if (subtotalEl)
        subtotalEl.textContent = subtotal.toLocaleString("ru-RU") + " ₽";
      if (totalEl)
        totalEl.textContent = subtotal.toLocaleString("ru-RU") + " ₽";
      setCartCountHeader();
    }

    function add(item) {
      const id = String(item.id);
      const existing = items.find((i) => i.id === id);
      const qtyAdd = item.qty || 1;
      const clean = {
        id,
        name: item.name || "Товар",
        size: item.size || "S",
        addons: Array.isArray(item.addons)
          ? item.addons.filter(Boolean)
          : [],
        price: Number(item.price) || 0,
        qty: qtyAdd,
        bg: item.bg || "",
        category: item.category || "",
      };
      if (existing) existing.qty = (existing.qty || 1) + qtyAdd;
      else items.push(clean);
      save();
      render();
      open();
    }

    function remove(idx) {
      items.splice(idx, 1);
      save();
      render();
    }

    function reloadFromStorage() {
      try {
        items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (!Array.isArray(items)) items = [];
      } catch {
        items = [];
      }
      render();
    }

    function removeById(id) {
      const idx = items.findIndex((i) => i.id === id);
      if (idx !== -1) remove(idx);
    }

    function bumpQtyById(id, delta) {
      const it = items.find((i) => i.id === id);
      if (!it) return;
      const next = (it.qty || 1) + delta;
      if (next < 1) removeById(id);
      else {
        it.qty = next;
        save();
        render();
      }
    }

    function getItems() {
      return items.map((i) => ({
        ...i,
        addons: Array.isArray(i.addons) ? [...i.addons] : [],
      }));
    }

    function emptyCart() {
      items = [];
      save();
      render();
    }

    function open() {
      drawer?.classList.add("is-open");
      if (drawer) drawer.setAttribute("aria-hidden", "false");
      document
        .getElementById("cartOpenBtn")
        ?.setAttribute("aria-expanded", "true");
      syncBodyOverflow();
    }

    function close() {
      drawer?.classList.remove("is-open");
      if (drawer) drawer.setAttribute("aria-hidden", "true");
      document
        .getElementById("cartOpenBtn")
        ?.setAttribute("aria-expanded", "false");
      syncBodyOverflow();
    }

    function generateMessage(formData) {
      const d = formData || {};
      const list = getItems();
      const total = calcTotal(list);
      const lines = list.map((i) => {
        let line = `• ${i.name} × ${i.qty || 1} — ${(
          i.price * (i.qty || 1)
        ).toLocaleString("ru-RU")} ₽`;
        const bits = [];
        if (i.size && i.size !== "—") bits.push(`размер ${i.size}`);
        if (i.addons && i.addons.length)
          bits.push(i.addons.filter(Boolean).join(", "));
        if (bits.length) line += ` (${bits.join("; ")})`;
        return line;
      });

      const delivMap = {
        pickup: "Самовывоз — Энгельса, 74",
        ask: "Уточнить у получателя",
        courier: "Курьером",
      };

      const payMap = {
        card: "Карта или СБП через ЮKassa",
        transfer: "Перевод после подтверждения",
        cash: "Наличные/карта при самовывозе",
        prepay: "Предоплата — свадебная флористика / оформление цветами",
      };

      const contactMap = {
        telegram: "Telegram",
        whatsapp: "WhatsApp",
        call: "Звонок",
        nocontact: "Не связываться без необходимости",
      };

      return [
        "🌸 Заказ PALOMA flowers coffee you",
        "",
        "📦 Состав:",
        lines.join("\n"),
        "",
        `💰 Итого: ${total.toLocaleString("ru-RU")} ₽`,
        "",
        `👤 Заказчик: ${d.name || "—"}`,
        `📞 Телефон: ${d.phone || "—"}`,
        d.telegram ? `✈️ Telegram: ${d.telegram}` : "",
        d.email ? `📧 Email: ${d.email}` : "",
        `💬 Связь: ${contactMap[d.contactMethod] || d.contactMethod || "—"}`,
        "",
        d.recipientName
          ? `🎁 Получатель: ${d.recipientName} ${d.recipientPhone || ""}`.trim()
          : "",
        "",
        `🚚 Доставка: ${delivMap[d.delivery] || d.delivery || "—"}`,
        d.delivery === "courier" && d.address
          ? `📍 Адрес: ${d.address}`
          : "",
        d.delivery === "courier" && d.date ? `📅 Дата: ${d.date}` : "",
        d.delivery === "courier" && d.interval
          ? `🕐 Интервал: ${d.interval}`
          : "",
        "",
        `💳 Оплата: ${payMap[d.payment] || d.payment || "—"}`,
        d.cardText ? `💌 Открытка: ${d.cardText}` : "",
        d.comment ? `📝 Комментарий: ${d.comment}` : "",
      ]
        .filter((l) => l !== "")
        .join("\n");
    }

    document.querySelectorAll("[data-cart-close]").forEach((el) => {
      el.addEventListener("click", close);
    });

    bodyEl?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const cid = btn.getAttribute("data-cart-id");
      if (!cid) return;
      const action = btn.dataset.action;
      if (action === "inc") bumpQtyById(cid, 1);
      if (action === "dec") bumpQtyById(cid, -1);
      if (action === "remove") removeById(cid);
    });

    checkoutBtn?.addEventListener("click", () => {
      if (items.length === 0) return;
      close();
      window.location.assign("cart.html");
    });

    document.getElementById("cartOpenBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      open();
    });

    render();

    return {
      add,
      open,
      close,
      remove,
      getItems,
      emptyCart,
      reloadFromStorage,
      removeById,
      bumpQtyById,
      calcTotal: () => calcTotal(items),
      render,
      generateMessage,
    };
  })();

  /* Dropdown «Каталог» — desktop hover + aria, touch ≤1024 */
  (function initCatalogDropdown() {
    const wrap = document.querySelector(
      ".site-header__dropdown-wrap--catalog"
    );
    if (!wrap) return;

    let timeout;
    const trigger = wrap.querySelector(".site-header__link--has-dropdown");

    wrap.addEventListener("mouseenter", () => {
      clearTimeout(timeout);
      wrap.classList.add("is-open");
      trigger?.setAttribute("aria-expanded", "true");
    });
    wrap.addEventListener("mouseleave", () => {
      timeout = window.setTimeout(() => {
        wrap.classList.remove("is-open");
        trigger?.setAttribute("aria-expanded", "false");
      }, 160);
    });

    trigger?.addEventListener("click", (e) => {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        const open = wrap.classList.toggle("is-open");
        trigger?.setAttribute("aria-expanded", open ? "true" : "false");
      }
    });

    document.addEventListener("click", (e) => {
      if (!(e.target instanceof Node)) return;
      if (wrap.contains(e.target)) return;
      wrap.classList.remove("is-open");
      trigger?.setAttribute("aria-expanded", "false");
    });
  })();

  /* Product modal */
  (function initProductModal() {
    const modal = document.getElementById("productModal");
    if (!modal) return;

    const modalTitle = document.getElementById("modalTitle");
    const modalPrice = document.getElementById("modalPrice");
    const modalDesc = document.getElementById("modalDesc");
    const modalComposition = document.getElementById("modalComposition");
    const modalPairs = document.getElementById("modalPairs");
    const modalTotal = document.getElementById("modalTotal");
    const modalMainImg = document.getElementById("modalMainImg");
    const thumbs = modal.querySelectorAll(".product-modal__thumb");
    const sizePills = modal.querySelectorAll(".size-pill");
    const addonInputs = modal.querySelectorAll(".addon input[type='checkbox']");
    const addBtn = document.getElementById("modalAddToCart");

    let currentProduct = null;
    let basePrice = 0;
    let currentMod = 0;

    function addonSum() {
      let s = 0;
      addonInputs.forEach((i) => {
        if (i.checked)
          s += parseInt(i.getAttribute("data-addon-price"), 10) || 0;
      });
      return s;
    }

    function recalcTotal() {
      let total = basePrice + currentMod + addonSum();
      if (modalTotal)
        modalTotal.textContent =
          total.toLocaleString("ru-RU") + " ₽";
    }

    function openModal(card) {
      const rawCat = (card.dataset.category || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      const primaryCat = rawCat[0] || "";
      currentProduct = {
        id: card.dataset.id,
        name: card.dataset.name,
        price: parseInt(card.dataset.price, 10) || 0,
        composition: card.dataset.composition || "—",
        desc: card.dataset.desc || "—",
        pairs: card.dataset.pairs || "—",
        category: primaryCat,
      };
      basePrice = currentProduct.price;
      currentMod = 0;
      sizePills.forEach((p, i) => p.classList.toggle("is-active", i === 0));
      addonInputs.forEach((i) => {
        i.checked = false;
      });

      if (modalTitle) modalTitle.textContent = currentProduct.name;
      if (modalPrice)
        modalPrice.textContent =
          currentProduct.price.toLocaleString("ru-RU") + " ₽";
      if (modalDesc) modalDesc.textContent = currentProduct.desc;
      if (modalComposition)
        modalComposition.textContent = currentProduct.composition;
      if (modalPairs) modalPairs.textContent = currentProduct.pairs || "—";

      const mainImg =
        card.querySelector(".product-card__image--main") ||
        card.querySelector(".product-card__img--main");
      if (modalMainImg && mainImg) {
        if (mainImg.tagName === "IMG") {
          const u = mainImg.currentSrc || mainImg.src;
          modalMainImg.style.background = u
            ? `url(${JSON.stringify(u)}) center/cover no-repeat`
            : "";
        } else {
          modalMainImg.style.background = getComputedStyle(mainImg).background;
        }
      }

      thumbs.forEach((t, i) =>
        t.classList.toggle("is-active", i === 0)
      );

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      syncBodyOverflow();
      recalcTotal();
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      syncBodyOverflow();
    }

    document.querySelectorAll(".product-card").forEach((card) => {
      (
        card.querySelector("[data-add-to-cart]") ||
          card.querySelector(".btn.btn--dark")
      )?.addEventListener(
        "click",
        (e) => {
          e.stopPropagation();
          const main =
            card.querySelector(".product-card__image--main") ||
            card.querySelector(".product-card__img--main");
          const rawCat = (card.dataset.category || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);
          let bg = "";
          if (main) {
            if (main.tagName === "IMG") {
              const u = main.currentSrc || main.src;
              bg = u ? `url(${u}) center/cover` : "";
            } else bg = getComputedStyle(main).background;
          }
          window.PalomaCart?.add({
            id:
              card.dataset.id +
              "-quick-m-" +
              (card.dataset.price || "0"),
            name: card.dataset.name || "",
            size: "M",
            addons: [],
            price: parseInt(card.dataset.price, 10) || 0,
            qty: 1,
            bg,
            category: rawCat[0] || "",
          });
        }
      );

      card.querySelector(".btn.btn--light")?.addEventListener(
        "click",
        (e) => {
          e.stopPropagation();
          openModal(card);
        }
      );

      card.addEventListener("click", (ev) => {
        if (ev.target.closest(".product-card__wishlist")) return;
        if (ev.target.closest(".product-card__actions")) return;
        openModal(card);
      });
    });

    modal.querySelectorAll("[data-close]").forEach((el) => {
      el.addEventListener("click", closeModal);
    });

    sizePills.forEach((p) => {
      p.addEventListener("click", () => {
        sizePills.forEach((x) => x.classList.remove("is-active"));
        p.classList.add("is-active");
        currentMod = parseInt(p.getAttribute("data-mod"), 10) || 0;
        recalcTotal();
      });
    });

    addonInputs.forEach((i) =>
      i.addEventListener("change", recalcTotal)
    );

    thumbs.forEach((t) => {
      t.addEventListener("click", () => {
        thumbs.forEach((x) => x.classList.remove("is-active"));
        t.classList.add("is-active");
        if (modalMainImg)
          modalMainImg.style.background =
            getComputedStyle(t).background;
      });
    });

    addBtn?.addEventListener("click", () => {
      if (!currentProduct || !modalMainImg) return;
      const size =
        modal.querySelector(".size-pill.is-active")?.getAttribute(
          "data-size"
        ) || "S";
      const addons = [...addonInputs]
        .filter((i) => i.checked)
        .map((i) => {
          const lab = i.closest(".addon");
          return lab
            ? lab.textContent.replace(/\s*\+[\d\s₽]+$/, "").trim()
            : "";
        })
        .filter(Boolean);
      const lineTotal =
        basePrice +
        currentMod +
        addonSum();

      window.PalomaCart?.add({
        id:
          currentProduct.id +
          "-" +
          size +
          "-" +
          addons.join("_"),
        name: currentProduct.name,
        size,
        addons,
        price: lineTotal,
        qty: 1,
        bg: modalMainImg.style.background || "",
        category: currentProduct.category || "",
      });
      closeModal();
    });
  })();

  /* Страница каталога: фильтры */
  (function initCatalogFilters() {
    const filters = document.querySelectorAll(
      "#catalogFiltersBar .filter-chip, #catalogFiltersBar .filter-btn",
    );
    const cards = document.querySelectorAll(
      ".catalog-grid .product-card",
    );
    if (filters.length === 0 || cards.length === 0) return;

    const CAT_MAP = {
      best: "bestsellers",
      comp: "compositions",
      sub: "subscription",
    };

    function resolveFilter(cat) {
      return CAT_MAP[cat] || cat;
    }

    function applyFilter(cat) {
      const want = resolveFilter(cat);
      cards.forEach((card) => {
        const raw = (
          card.getAttribute("data-category") || ""
        ).trim();
        const cardCats =
          raw.length > 0 ? raw.split(/\s+/).filter(Boolean) : [];
        const show =
          cat === "all" || cardCats.includes(want);
        card.classList.toggle("is-filtered-out", !show);
      });
      filters.forEach((f) =>
        f.classList.toggle("is-active", f.dataset.cat === cat)
      );
    }

    filters.forEach((f) => {
      f.addEventListener("click", () =>
        applyFilter(f.dataset.cat || "all")
      );
    });

    const qp = new URLSearchParams(window.location.search);
    const urlCat = qp.get("cat");
    if (urlCat) {
      const resolved = resolveFilter(urlCat);
      const match = [...filters].find(
        (f) =>
          f.dataset.cat === urlCat ||
          resolveFilter(f.dataset.cat || "") === resolved,
      );
      if (match) applyFilter(match.dataset.cat || "all");
      else applyFilter(urlCat);
    }
  })();

  /* Каталог: показать ещё карточки */
  (function initCatalogShowMore() {
    const btn = document.getElementById("catalogShowMoreBtn");
    const grid = document.getElementById("catalogGrid");
    if (!btn || !grid) return;

    const hiddenCards = [
      ...grid.querySelectorAll(".product-card.is-hidden"),
    ];
    if (hiddenCards.length === 0) {
      btn.hidden = true;
      return;
    }

    btn.addEventListener("click", () => {
      hiddenCards.forEach((c) =>
        c.classList.remove("is-hidden"),
      );
      btn.hidden = true;
      btn.setAttribute("aria-expanded", "true");
      window.PalomaWishlist?.injectButtons?.();
      window.PalomaWishlist?.updateUi?.();
      window.palomaRebindCursorHovers?.();
    });
  })();

  /* Кастомный курсор — desktop + лёгкий trail */
  (function initCustomCursor() {
    const cursor = document.getElementById("customCursor");
    if (!cursor) return;

    const ring = cursor.querySelector(".custom-cursor__ring");
    if (!ring) return;

    const noMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isTouch =
      window.matchMedia("(hover: none), (pointer: coarse)").matches ||
      window.innerWidth < 1025;
    if (isTouch || noMotion) return;

    document.body.classList.add("custom-cursor-enabled");

    const TRAIL_N = 8;
    const trail = [];
    for (let i = 0; i < TRAIL_N; i++) {
      const dot = document.createElement("div");
      dot.className = "cursor-trail-dot";
      dot.style.opacity = String((1 - i / TRAIL_N) * 0.35);
      document.body.appendChild(dot);
      trail.push({ el: dot, x: -200, y: -200 });
    }

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let ringInit = true;

    document.addEventListener(
      "mousemove",
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (ringInit) {
          ringX = mouseX;
          ringY = mouseY;
          ringInit = false;
        }
      },
      { passive: true }
    );

    const hoverSelectors =
      'a, button, .product-card, .faq-row, .review-arrow, .reviews-arrow, .product-card__wishlist, .category-card, .catalog-nav-item, .filter-chip, .filter-btn, .site-header__icon--cart, .site-header__icon, .quantity-btn, .cart-item__remove, .product-modal__close, .size-pill, .product-modal__thumb, .cart-drawer__close, .cart-drawer__checkout, .client-nav-card, .faq-tab, .faq-acc__head, .info-card, .hscroll-card, .hscroll-section__arrow, .menu-item, .menu-item__add, .coffee-hero__link, .w-package-card__cta, .w-portfolio__case-link, .w-service-row, .process-step__cta, .curtain-block__cta, [data-cursor="hover"]';

    function onEnter() {
      cursor.classList.add("is-hovering");
    }
    function onLeave() {
      cursor.classList.remove("is-hovering");
    }

    function bindHovers() {
      document.querySelectorAll(hoverSelectors).forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    }

    bindHovers();
    window.palomaRebindCursorHovers = bindHovers;

    function tick() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      const hovering = cursor.classList.contains("is-hovering");
      const scale = hovering ? 1.8 : 1;
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      ring.style.transform = `translate3d(${ringX - mouseX}px, ${
        ringY - mouseY
      }px, 0) scale(${scale})`;

      for (let i = TRAIL_N - 1; i > 0; i--) {
        trail[i].x += (trail[i - 1].x - trail[i].x) * 0.28;
        trail[i].y += (trail[i - 1].y - trail[i].y) * 0.28;
        trail[i].el.style.left = trail[i].x + "px";
        trail[i].el.style.top = trail[i].y + "px";
      }
      trail[0].x += (mouseX - trail[0].x) * 0.3;
      trail[0].y += (mouseY - trail[0].y) * 0.3;
      trail[0].el.style.left = trail[0].x + "px";
      trail[0].el.style.top = trail[0].y + "px";

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    document.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      cursor.style.opacity = "1";
    });
  })();

  /* Отзывы — карусель (reviews track) + legacy fade-слайдер */
  (function initReviewsCarousel() {
    const track = document.getElementById("reviewsTrack");
    const prevBtn = document.getElementById("reviewsPrev");
    const nextBtn = document.getElementById("reviewsNext");
    if (track) {
      const slides = track.querySelectorAll(".review-slide");
      const total = slides.length;
      if (total) {
        let cur = 0;
        const go = (i) => {
          cur = (i + total) % total;
          track.style.transform = `translateX(${-cur * 100}%)`;
        };
        prevBtn?.addEventListener("click", () => go(cur - 1));
        nextBtn?.addEventListener("click", () => go(cur + 1));
        let sx = 0;
        track.addEventListener(
          "touchstart",
          (e) => {
            sx = e.touches[0].clientX;
          },
          { passive: true }
        );
        track.addEventListener(
          "touchend",
          (e) => {
            const dx = e.changedTouches[0].clientX - sx;
            if (Math.abs(dx) > 50) go(dx < 0 ? cur + 1 : cur - 1);
          },
          { passive: true }
        );
        return;
      }
    }

    const slider = document.getElementById("reviewsSlider");
    if (!slider) return;

    const slides = slider.querySelectorAll(".reviews__slide");
    const dots = document.querySelectorAll(".reviews__dot");
    const prevLegacy = document.getElementById("reviewsPrev");
    const nextLegacy = document.getElementById("reviewsNext");

    let current = 0;
    const total = slides.length;
    let autoplayInterval;

    const motionOk = !window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function goTo(index) {
      current = (index + total) % total;
      slides.forEach((s, i) =>
        s.classList.toggle("is-active", i === current)
      );
      dots.forEach((d, i) =>
        d.classList.toggle("is-active", i === current)
      );
    }

    function next() {
      goTo(current + 1);
    }
    function prev() {
      goTo(current - 1);
    }

    function resetAutoplay() {
      clearInterval(autoplayInterval);
      if (motionOk) startAutoplay();
    }

    function startAutoplay() {
      autoplayInterval = setInterval(next, 6000);
    }

    prevLegacy?.addEventListener("click", () => {
      prev();
      resetAutoplay();
    });
    nextLegacy?.addEventListener("click", () => {
      next();
      resetAutoplay();
    });
    dots.forEach((d) => {
      d.addEventListener("click", () => {
        goTo(parseInt(d.dataset.dot, 10));
        resetAutoplay();
      });
    });

    if (motionOk) {
      startAutoplay();
      slider.addEventListener("mouseenter", () =>
        clearInterval(autoplayInterval)
      );
      slider.addEventListener("mouseleave", () => startAutoplay());
    }
  })();

  /* Header: скролл */
  const siteHeader = document.getElementById("siteHeader");
  if (siteHeader) {
    const heroEl =
      document.querySelector(".paloma-hero") ||
      document.querySelector(".hero-scene") ||
      document.querySelector(".hero") ||
      document.querySelector(".coffee-hero") ||
      document.querySelector(".w-hero");

    function onHeaderScroll() {
      if (!heroEl) {
        siteHeader.classList.add("is-scrolled");
        return;
      }
      if (window.scrollY > 60) siteHeader.classList.add("is-scrolled");
      else siteHeader.classList.remove("is-scrolled");
    }

    window.addEventListener("scroll", onHeaderScroll, { passive: true });
    window.addEventListener("resize", onHeaderScroll);
    onHeaderScroll();
  }

  /* Мобильное меню */
  (function initMobileNav() {
    const toggle = document.getElementById("menuToggle");
    const backdrop = document.getElementById("menuBackdrop");
    const panel = document.getElementById("mobileNav");
    if (!toggle || !backdrop || !panel) return;

    let previouslyFocused = null;

    function isMobileBp() {
      return window.matchMedia("(max-width: 1024px)").matches;
    }

    function openNav() {
      if (!isMobileBp()) return;
      previouslyFocused = document.activeElement;
      document.body.classList.add("is-nav-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Закрыть меню");
      panel.setAttribute("aria-hidden", "false");
      backdrop.setAttribute("aria-hidden", "false");
      panel.querySelector(".site-header__mobile-link")?.focus({
        preventScroll: true,
      });
    }

    function closeNav() {
      document.body.classList.remove("is-nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Открыть меню");
      panel.setAttribute("aria-hidden", "true");
      backdrop.setAttribute("aria-hidden", "true");
      if (
        previouslyFocused &&
        typeof previouslyFocused.focus === "function"
      ) {
        previouslyFocused.focus({ preventScroll: true });
      }
      previouslyFocused = null;
    }

    const inner = panel.querySelector(".site-header__mobile-inner");
    if (inner && !inner.querySelector("[data-mobile-footer-injected]")) {
      inner.insertAdjacentHTML(
        "beforeend",
        `<div class="site-header__mobile-footer" data-mobile-footer-injected>
          <a href="https://t.me/paloma_novorossiysk" class="site-header__mobile-muted" target="_blank" rel="noopener noreferrer">Telegram</a>
          <a href="https://wa.me/79180000000" class="site-header__mobile-muted" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href="tel:+78612000000" class="btn btn--dark site-header__mobile-cta">Позвонить нам</a>
        </div>`,
      );
    }

    toggle.addEventListener("click", () => {
      if (document.body.classList.contains("is-nav-open")) closeNav();
      else openNav();
    });
    backdrop.addEventListener("click", closeNav);

    panel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeNav());
    });

    window.addEventListener(
      "resize",
      () => {
        if (!isMobileBp()) closeNav();
      },
      { passive: true }
    );
  })();

  /* Showcase — показать скрытые карточки */
  const showMoreBtn = document.getElementById("showMoreBtn");
  const hiddenCards = document.querySelectorAll(".product-card.is-hidden");

  showMoreBtn?.addEventListener("click", () => {
    hiddenCards.forEach((card) =>
      card.classList.remove("is-hidden")
    );
    showMoreBtn.setAttribute("aria-expanded", "true");
    showMoreBtn.hidden = true;
    window.PalomaWishlist?.injectButtons?.();
    window.PalomaWishlist?.updateUi?.();
    window.palomaRebindCursorHovers?.();
  });

  /* Горизонтальные process-секции (главная, кофейня, свадьбы) */
  (function initHorizontalProcesses() {
    const configs = [
      { viewportId: "processViewport", trackId: "processTrack" },
      { viewportId: "coffeeProcessViewport", trackId: "coffeeProcessTrack" },
      { viewportId: "wProcessViewport", trackId: "wProcessTrack" },
    ];

    const isMobile = () => window.innerWidth <= 768;
    const noMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    configs.forEach(({ viewportId, trackId }) => {
      const vpEl = document.getElementById(viewportId);
      const trackEl = document.getElementById(trackId);
      if (!vpEl || !trackEl) return;

      if (isMobile() || noMotion) {
        trackEl.style.cssText =
          "position:static;height:auto;overflow-x:auto;transform:none!important;" +
          "scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;";
        vpEl.style.height = "auto";
        trackEl
          .querySelectorAll(
            ".process-card,.coffee-process__card,.w-process__card,.process-step",
          )
          .forEach((c) => {
            c.style.scrollSnapAlign = "start";
          });
        return;
      }

      let raf;
      function update() {
        const rect = vpEl.getBoundingClientRect();
        const totalDist = vpEl.offsetHeight - window.innerHeight;
        const scrolled = Math.max(0, -rect.top);
        const progress =
          totalDist > 0 ? Math.min(1, scrolled / totalDist) : 0;
        const pad =
          parseFloat(getComputedStyle(trackEl).paddingLeft) || 80;
        const maxT = Math.max(
          0,
          trackEl.scrollWidth - (window.innerWidth - pad * 2),
        );
        trackEl.style.transform = `translateX(${-progress * maxT}px)`;
      }

      function onScroll() {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(update);
      }

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", update);
      update();
    });
  })();

  /* Hero: лёгкий scale фона (PALOMA) */
  (function initPalomaHeroParallax() {
    const hero = document.querySelector(".paloma-hero");
    const bg = hero?.querySelector(".paloma-hero__bg");
    if (!hero || !bg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf;
    function update() {
      const heroH = hero.offsetHeight || 1;
      const progress = Math.min(window.scrollY / heroH, 1);
      bg.style.transform = `scale(${1 + progress * 0.06})`;
    }
    window.addEventListener(
      "scroll",
      () => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(update);
      },
      { passive: true }
    );
    update();
  })();

  /* Избранное — localStorage */
  (function initWishlist() {
    const KEY = "paloma_wishlist";
    function load() {
      try {
        return JSON.parse(localStorage.getItem(KEY) || "[]");
      } catch {
        return [];
      }
    }
    function save(ids) {
      try {
        localStorage.setItem(KEY, JSON.stringify(ids));
      } catch {
        /* ignore */
      }
    }
    function injectButtons() {
      document.querySelectorAll(".product-card").forEach((card) => {
        const media = card.querySelector(".product-card__media");
        if (!media || media.querySelector(".product-card__wishlist")) return;
        const id = String(card.dataset.id || "").trim();
        if (id) card.setAttribute("data-product-id", id);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "product-card__wishlist";
        btn.setAttribute("aria-label", "В избранное");
        btn.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z"/></svg>';
        media.insertBefore(btn, media.firstChild);
      });
    }
    function updateUi() {
      const ids = load();
      document.querySelectorAll(".product-card__wishlist").forEach((btn) => {
        const card = btn.closest("[data-product-id]");
        const id = card?.getAttribute("data-product-id");
        if (id) btn.classList.toggle("is-active", ids.includes(id));
      });
      const n = ids.length;
      document.querySelectorAll(".header-wishlist-count").forEach((el) => {
        el.textContent = n > 9 ? "9+" : String(n);
        el.hidden = n === 0;
        el.setAttribute("aria-hidden", n === 0 ? "true" : "false");
      });
    }
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".product-card__wishlist");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const card = btn.closest("[data-product-id]");
      const id = card?.getAttribute("data-product-id");
      if (!id) return;
      let ids = load();
      if (ids.includes(id)) ids = ids.filter((i) => i !== id);
      else ids.push(id);
      save(ids);
      updateUi();
      btn.style.transform = "scale(1.2)";
      setTimeout(() => {
        btn.style.transform = "";
      }, 200);
    });
    injectButtons();
    updateUi();
    window.PalomaWishlist = { load, save, updateUi, injectButtons };
  })();

  (function initProductCardReveal() {
    const cards = document.querySelectorAll(".product-card");
    if (!cards.length) return;
    if (typeof IntersectionObserver !== "function") {
      cards.forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("is-revealed"), i * 80);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    cards.forEach((el) => io.observe(el));
  })();

  (function initSectionRevealLite() {
    if (typeof IntersectionObserver !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = document.querySelectorAll(
      ".showcase__header, .process__header, .process-section__header, .reviews__header, .reviews-section__top, .paloma-location__content"
    );
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(40px)";
      el.style.transition =
        "opacity 600ms var(--ease-soft, cubic-bezier(.22,1,.36,1)), transform 600ms var(--ease-soft, cubic-bezier(.22,1,.36,1))";
      io.observe(el);
    });
    const st = document.createElement("style");
    st.textContent =
      ".showcase__header.is-revealed,.process__header.is-revealed,.process-section__header.is-revealed,.reviews__header.is-revealed,.reviews-section__top.is-revealed,.paloma-location__content.is-revealed{opacity:1!important;transform:none!important}";
    document.head.appendChild(st);
  })();

  /* Активный пункт меню */
  (function markActiveNav() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".site-header__link[href]").forEach((link) => {
      if (
        link.classList.contains("site-header__link--has-dropdown")
      ) {
        return;
      }
      const raw = link.getAttribute("href") || "";
      const href = raw.split("?")[0].split("/").pop();
      if (!href || href.startsWith("#")) return;
      link.classList.toggle("is-active", href === path);
    });
  })();

  /* Кофейное меню: add-to-cart через делегирование */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-to-cart]");
    if (!btn || btn.id === "modalAddToCart") return;
    const menuItem = btn.closest(".menu-item");
    if (!menuItem || !window.PalomaCart) return;
    e.preventDefault();
    e.stopPropagation();
    const idBase = menuItem.dataset.id || "item";
    const price =
      parseInt(String(menuItem.dataset.price || "0").replace(/\D/g, ""), 10) ||
      0;
    const name = menuItem.dataset.name || "PALOMA Coffee";
    window.PalomaCart.add({
      id: `cafe-${idBase}`,
      name,
      price,
      qty: 1,
      bg:
        menuItem.dataset.photoBg ||
        "linear-gradient(135deg, #5c3d28, #8a6248)",
      category: menuItem.dataset.menuCategory || "coffee",
      size: "—",
      addons: [],
    });
  });

  /* Escape: модалка → корзина → выпадающие шапки (≤1024) → меню */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    const modalEl = document.getElementById("productModal");
    if (modalEl?.classList.contains("is-open")) {
      modalEl.classList.remove("is-open");
      modalEl.setAttribute("aria-hidden", "true");
      syncBodyOverflow();
      return;
    }

    const drawerEl = document.getElementById("cartDrawer");
    if (drawerEl?.classList.contains("is-open")) {
      window.PalomaCart.close();
      return;
    }

    const openWraps = document.querySelectorAll(
      ".site-header__dropdown-wrap.is-open"
    );
    if (openWraps.length > 0) {
      openWraps.forEach((w) => {
        w.classList.remove("is-open");
        const t = w.querySelector(".site-header__link--has-dropdown");
        if (t) {
          const exp = t.getAttribute("aria-expanded");
          if (exp !== null)
            t.setAttribute("aria-expanded", "false");
        }
      });
      return;
    }

    if (document.body.classList.contains("is-nav-open")) {
      document.getElementById("menuToggle")?.click();
    }
  });

  syncBodyOverflow();
})();
