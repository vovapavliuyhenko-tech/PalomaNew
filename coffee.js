(function () {
  "use strict";

  /* Меню: фильтр по категориям */
  (function initCoffeeMenuFilter() {
    const chips = document.querySelectorAll(
      ".coffee-menu-filters .filter-chip",
    );
    const items = document.querySelectorAll(".coffee-menu-grid .menu-item");
    if (!chips.length || !items.length) return;

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const cat = chip.dataset.menuCat || "all";
        chips.forEach((c) =>
          c.classList.toggle("is-active", c === chip),
        );
        items.forEach((item) => {
          const itemCat = item.dataset.menuCategory || "";
          const show =
            cat === "all" || itemCat === cat;
          item.classList.toggle("is-hidden", !show);
        });
      });
    });
  })();

  /* Добавление из меню — см. script.js (делегирование) */
  (function initCoffeeBeanRotation() {
    const bean = document.getElementById("coffeeBeanDecor");
    if (!bean) return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const section = bean.closest(".coffee-menu-section");
    if (!section) return;

    function onScroll() {
      const rect = section.getBoundingClientRect();
      const denom = rect.height + window.innerHeight;
      let progress =
        denom > 0 ? (-rect.top + window.innerHeight * 0.2) / denom : 0;
      progress = Math.max(0, Math.min(1, progress));
      const deg = progress * 180;
      bean.style.transform = `translateY(-50%) rotate(${deg}deg)`;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
  })();

  (function initCoffeeVideoFallback() {
    function bind(video, fallback) {
      if (!video || !fallback) return;

      const hide = () => fallback.classList.add("is-hidden");
      const show = () => fallback.classList.remove("is-hidden");

      const hasSource =
        video.querySelector("source[src]") ||
        (video.getAttribute("src") && video.getAttribute("src").length > 0);
      if (!hasSource) return;

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        hide();
      }
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
  })();

  (function initMenuHoverPhoto() {
    const photo = document.createElement("div");
    photo.className = "menu-hover-photo";
    photo.innerHTML = '<div class="menu-hover-photo__img"></div>';
    document.body.appendChild(photo);

    const photoImg = photo.querySelector(".menu-hover-photo__img");
    const mql = window.matchMedia("(hover: none), (pointer: coarse)");
    if (mql.matches) return;

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let rafPhoto;

    document.addEventListener(
      "mousemove",
      (e) => {
        targetX = e.clientX + 28;
        targetY = e.clientY - 80;
      },
      { passive: true },
    );

    function animPhoto() {
      curX += (targetX - curX) * 0.14;
      curY += (targetY - curY) * 0.14;
      photo.style.left = curX + "px";
      photo.style.top = curY + "px";
      rafPhoto = requestAnimationFrame(animPhoto);
    }
    animPhoto();

    document.querySelectorAll(".menu-item[data-photo-bg]").forEach((item) => {
      item.addEventListener("mouseenter", () => {
        const bg =
          item.dataset.photoBg ||
          "linear-gradient(135deg, #5c3d28, #8a6248)";
        if (photoImg) photoImg.style.background = bg;
        photo.classList.add("is-visible");
      });
      item.addEventListener("mouseleave", () => {
        photo.classList.remove("is-visible");
      });
    });
  })();
})();
