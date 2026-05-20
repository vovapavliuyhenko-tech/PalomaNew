/* PALOMA Coffee — coffee.html */
(function () {
  "use strict";

  const MENU = window.PALOMA_COFFEE_MENU || [];
  const grid = document.getElementById("coffeeMenuGrid");
  const filters = document.getElementById("coffeeMenuFilters");
  const hoverSlot = document.getElementById("menuHoverPhotoSlot");

  renderMenu("all");
  initFilters();
  initMenuHoverPhoto();
  initCoffeeVideoFallback();

  function renderMenu(cat) {
    if (!grid) return;

    const items =
      cat === "all" ? MENU : MENU.filter((i) => i.category === cat);

    grid.innerHTML = items
      .map(
        (item) => `
      <article class="menu-item"
               data-photo-bg="${esc(item.bg)}"
               data-menu-category="${esc(item.category)}"
               data-id="${esc(item.id)}"
               data-name="${esc(item.name)}"
               data-price="${item.price}">
        <div class="menu-item__body">
          <div class="menu-item__info">
            <h3 class="menu-item__name">${esc(item.name)}</h3>
            <p class="menu-item__desc">${esc(item.desc)}</p>
            <span class="menu-item__volume">${esc(item.volume)}</span>
          </div>
          <div class="menu-item__right">
            <span class="menu-item__price">${item.price.toLocaleString("ru-RU")} ₽</span>
            <button type="button" class="menu-item__add btn btn--coffee"
                    data-add-to-cart
                    aria-label="Добавить ${esc(item.name)} в корзину">В корзину</button>
          </div>
        </div>
      </article>`,
      )
      .join("");

    bindHoverItems();
  }

  function initFilters() {
    if (!filters) return;

    filters.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-menu-cat]");
      if (!chip) return;
      filters.querySelectorAll(".filter-chip").forEach((c) => {
        c.classList.toggle("is-active", c === chip);
        c.setAttribute("aria-pressed", c === chip ? "true" : "false");
      });
      renderMenu(chip.dataset.menuCat || "all");
    });
  }

  function initMenuHoverPhoto() {
    if (!hoverSlot) return;

    const mql = window.matchMedia("(hover: none), (pointer: coarse)");
    if (mql.matches) {
      hoverSlot.hidden = true;
      return;
    }

    bindHoverItems();
  }

  function bindHoverItems() {
    const img = hoverSlot?.querySelector(".menu-hover-photo__img");
    if (!img || !hoverSlot) return;

    document.querySelectorAll(".coffee-menu-grid .menu-item").forEach((item) => {
      item.addEventListener("mouseenter", () => {
        img.style.background =
          item.dataset.photoBg || "linear-gradient(135deg, #5c3d28, #8a6248)";
        hoverSlot.classList.add("is-visible");
      });
      item.addEventListener("mouseleave", () => {
        hoverSlot.classList.remove("is-visible");
      });
    });
  }

  function initCoffeeVideoFallback() {
    function bind(video, fallback) {
      if (!video || !fallback) return;
      const hide = () => fallback.classList.add("is-hidden");
      const show = () => fallback.classList.remove("is-hidden");
      const hasSource = video.querySelector("source[src]");
      if (!hasSource) return;
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) hide();
      video.addEventListener("loadeddata", hide, { once: true });
      video.addEventListener("error", show, { once: true });
    }

    bind(
      document.querySelector(".coffee-hero__video"),
      document.querySelector(".coffee-hero__video-placeholder"),
    );
    bind(
      document.querySelector(".coffee-hero__mini-video"),
      document.querySelector(".coffee-hero__mini-placeholder"),
    );

    document.querySelectorAll(".coffee-curtain__video").forEach((video) => {
      const wrap = video.closest(".coffee-curtain__bg");
      const fallback = wrap?.querySelector(".coffee-curtain__bg-placeholder");
      bind(video, fallback);
    });
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
