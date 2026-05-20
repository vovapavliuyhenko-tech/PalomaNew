/* ════════════════════════════════════════════════════════
   wishlist.js — избранное PALOMA
   Подключать после script.js на всех страницах
   ════════════════════════════════════════════════════════ */
window.PalomaWishlist = (function () {
  "use strict";

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

  function has(id) {
    return load().includes(String(id));
  }

  function add(id) {
    const sid = String(id);
    const ids = load();
    if (!ids.includes(sid)) {
      ids.push(sid);
      save(ids);
    }
    _notify(sid, true);
  }

  function remove(id) {
    const sid = String(id);
    const ids = load().filter((i) => i !== sid);
    save(ids);
    _notify(sid, false);
  }

  function toggle(id) {
    if (has(id)) {
      remove(id);
      return false;
    }
    add(id);
    return true;
  }

  function count() {
    return load().length;
  }

  function _setButtonState(btn, active) {
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
    btn.setAttribute(
      "aria-label",
      active ? "Убрать из избранного" : "Добавить в избранное",
    );
  }

  function updateCountBadge() {
    const n = count();
    document
      .querySelectorAll(
        "[data-wishlist-count], .wishlist-count, .header-wishlist-count, #wishlistCount",
      )
      .forEach((el) => {
        el.textContent = n > 9 ? "9+" : n > 0 ? String(n) : "";
        el.hidden = n === 0;
        el.setAttribute("aria-hidden", n === 0 ? "true" : "false");
        if (el.style) {
          el.style.display = n > 0 ? "flex" : "none";
        }
        el.setAttribute(
          "aria-label",
          n > 0 ? `${n} товаров в избранном` : "0 товаров в избранном",
        );
      });
  }

  function syncButtons() {
    const ids = load();

    document
      .querySelectorAll("[data-wishlist-btn], .product-card__wishlist")
      .forEach((btn) => {
        const id =
          btn.dataset.wishlistBtn ||
          btn.dataset.productId ||
          btn.closest("[data-product-id]")?.dataset.productId ||
          btn.closest(".product-card")?.dataset.id;
        if (!id) return;
        _setButtonState(btn, ids.includes(String(id)));
      });

    const pdpBtn = document.getElementById("pdpWishlist");
    if (pdpBtn?.dataset.productId) {
      _setButtonState(pdpBtn, ids.includes(String(pdpBtn.dataset.productId)));
    }

    updateCountBadge();
  }

  function _notify(id, active) {
    document
      .querySelectorAll(
        `[data-wishlist-btn="${CSS.escape(id)}"], [data-product-id="${CSS.escape(id)}"]`,
      )
      .forEach((el) => {
        if (
          el.classList.contains("product-card__wishlist") ||
          el.hasAttribute("data-wishlist-btn") ||
          el.id === "pdpWishlist"
        ) {
          _setButtonState(el, active);
        }
      });

    const pdp = document.getElementById("pdpWishlist");
    if (pdp?.dataset.productId === String(id)) {
      _setButtonState(pdp, active);
    }

    updateCountBadge();
  }

  function injectButtons() {
    document.querySelectorAll(".product-card").forEach((card) => {
      const media = card.querySelector(".product-card__media");
      if (!media) return;
      if (media.querySelector("[data-wishlist-btn], .product-card__wishlist"))
        return;

      const id = String(
        card.dataset.id || card.dataset.productId || "",
      ).trim();
      if (!id) return;

      card.setAttribute("data-product-id", id);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "product-card__wishlist";
      btn.dataset.wishlistBtn = id;
      btn.dataset.productId = id;
      btn.setAttribute("aria-label", "Добавить в избранное");
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z"/></svg>';
      media.appendChild(btn);
    });
    syncButtons();
  }

  function checkEmpty() {
    const grid = document.getElementById("wishlistGrid");
    const emptyEl = document.getElementById("wishlistEmpty");
    if (!grid || !emptyEl) return;

    const hasCards = grid.querySelectorAll(".product-card").length > 0;
    emptyEl.hidden = hasCards;
    grid.hidden = !hasCards;

    const countEl = document.getElementById("wishlistHeroCount");
    const remaining = grid.querySelectorAll(".product-card").length;
    if (countEl) {
      countEl.textContent = remaining
        ? plural(remaining, "товар", "товара", "товаров")
        : "";
    }
  }

  function plural(n, one, few, many) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
      return `${n} ${few}`;
    return `${n} ${many}`;
  }

  function initClickDelegation() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(
        "[data-wishlist-btn], .product-card__wishlist, #pdpWishlist",
      );
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      const id =
        btn.dataset.wishlistBtn ||
        btn.dataset.productId ||
        btn.closest("[data-product-id]")?.dataset.productId ||
        btn.closest(".product-card")?.dataset.id;

      if (!id) return;

      const nowActive = toggle(id);

      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        btn.style.transform = "scale(1.2)";
        window.setTimeout(() => {
          btn.style.transform = "";
        }, 200);
      }

      if (document.body.classList.contains("wishlist-page") && !nowActive) {
        const card = btn.closest(".product-card");
        if (card) {
          card.style.opacity = "0";
          card.style.transform = "scale(0.94)";
          card.style.transition =
            "opacity 0.35s ease, transform 0.35s ease";
          setTimeout(() => {
            card.remove();
            checkEmpty();
          }, 360);
        }
      }
    });
  }

  function init() {
    initClickDelegation();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        injectButtons();
        syncButtons();
      });
    } else {
      injectButtons();
      syncButtons();
    }
  }

  /* Алиасы для совместимости со script.js / catalog.js */
  const updateUi = syncButtons;

  return {
    load,
    save,
    has,
    add,
    remove,
    toggle,
    count,
    syncButtons,
    updateUi,
    updateCountBadge,
    injectButtons,
    checkEmpty,
    init,
  };
})();

window.palomaInitWishlistIcons = window.PalomaWishlist.injectButtons;
window.PalomaWishlist.init();
