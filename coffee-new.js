/* ═══════════════════════════════════════════════════════
   coffee-new.js — страница кофейни PALOMA (editorial)
   ═══════════════════════════════════════════════════════ */
(function initCoffeePage() {
  "use strict";

  if (!document.querySelector(".cf-page")) return;

  var noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Reveal ── */
  (function initReveal() {
    var selectors = [
      ".ct-taste__header",
      ".cf-union__text",
      ".cf-plus__text",
      ".cf-location__text",
    ];

    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.classList.add("cf-reveal");
      });
    });

    var photoSelectors = [
      ".cf-hero__media",
      ".cf-union__photo",
      ".cf-plus__photo",
      ".cf-location__map",
    ];

    photoSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.classList.add("cf-reveal-photo");
      });
    });

    if (noMotion) {
      document
        .querySelectorAll(".cf-reveal, .cf-reveal-photo")
        .forEach(function (el) {
          el.classList.add("is-visible");
        });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );

    document.querySelectorAll(".cf-reveal, .cf-reveal-photo").forEach(function (el) {
      io.observe(el);
    });
  })();

  /* ── Hero parallax ── */
  (function initHeroParallax() {
    var heroBg = document.querySelector(".cf-hero__photo-ph, .cf-hero__video");
    if (!heroBg || noMotion) return;
    var raf;
    window.addEventListener(
      "scroll",
      function () {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          var p = Math.min(1, window.scrollY / window.innerHeight);
          heroBg.style.transform = "scale(" + (1 + p * 0.06) + ")";
        });
      },
      { passive: true },
    );
  })();

  /* ── Video fallback ── */
  (function initVideoFallback() {
    document.querySelectorAll(".cf-hero__video, .cfs-scene__video").forEach(function (video) {
      var wrap = video.parentElement;
      var ph =
        wrap &&
        wrap.querySelector(".cf-hero__photo-ph, .cfs-scene__bg-ph--1");
      if (!ph) return;

      function hidePh() {
        ph.style.opacity = "0";
        ph.style.visibility = "hidden";
      }

      function showPh() {
        ph.style.opacity = "1";
        ph.style.visibility = "visible";
      }

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) hidePh();
      video.addEventListener("loadeddata", hidePh, { once: true });
      video.addEventListener("error", showPh, { once: true });
      video.addEventListener("loadeddata", function () {
        video.classList.add("is-loaded");
      }, { once: true });
    });
  })();

})();

/* ════════════════════════════════════════════════════════
   COFFEE TASTE CARDS — «Выберите свой вкус»
   ════════════════════════════════════════════════════════ */
(function initCoffeeTasteBlock() {
  "use strict";

  var grid = document.getElementById("ctTasteGrid");
  if (!grid) return;

  var allProducts = window.PALOMA_COFFEE || [];
  var products = allProducts.slice(0, 8);
  if (!products.length) return;

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cartFallback(item) {
    var KEY = "paloma_cart_v3";
    var items = [];
    try {
      items = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (_e) {
      items = [];
    }
    var existing = items.find(function (i) {
      return i.id === item.id;
    });
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      items.push(Object.assign({}, item, { qty: 1 }));
    }
    localStorage.setItem(KEY, JSON.stringify(items));
    var count = items.reduce(function (s, i) {
      return s + (i.qty || 1);
    }, 0);
    document
      .querySelectorAll(
        "[data-cart-count], .cart-count, #cartCount, .site-header__cart-count",
      )
      .forEach(function (el) {
        el.textContent = count > 0 ? String(count) : "";
        el.style.display = count > 0 ? "flex" : "none";
      });
  }

  function renderCard(product) {
    var volStr = product.volumes
      ? product.volumes.map(function (v) {
          return v.label;
        }).join(" / ")
      : "";
    var minPrice = product.volumes
      ? Math.min.apply(
          null,
          product.volumes.map(function (v) {
            return v.price;
          }),
        )
      : product.price;
    var pricePrefix =
      product.volumes && product.volumes.length > 1 ? "от " : "";

    var article = document.createElement("article");
    article.className = "ct-product-card";
    article.dataset.productId = product.id;
    article.dataset.productName = product.title;
    article.dataset.productPrice = String(minPrice);
    article.dataset.productBg = product.placeholderBg || "";
    article.dataset.productCat = product.category || "coffee";

    var imgHtml = product.image
      ? '<img class="ct-product-card__img" src="' +
        esc(product.image) +
        '" alt="' +
        esc(product.title) +
        '" loading="lazy" onerror="this.style.display=\'none\'">'
      : "";

    var descHtml = product.description
      ? '<p class="ct-product-card__desc">' + esc(product.description) + "</p>"
      : "";

    article.innerHTML =
      '<div class="ct-product-card__header">' +
      '<span class="ct-product-card__num">' +
      esc(product.num) +
      " — " +
      esc(product.title.toLowerCase()) +
      "</span>" +
      '<span class="ct-product-card__volume" aria-label="Объём: ' +
      esc(volStr) +
      '">' +
      esc(volStr) +
      "</span>" +
      "</div>" +
      '<div class="ct-product-card__photo" aria-label="' +
      esc(product.title) +
      '">' +
      '<div class="ct-product-card__ph" style="background:' +
      esc(product.placeholderBg || "#F0E8D8") +
      ';" aria-hidden="true"></div>' +
      imgHtml +
      '<div class="ct-product-card__cta" aria-hidden="true">' +
      '<button class="ct-product-card__cta-btn" data-add-to-cart type="button" aria-label="Добавить ' +
      esc(product.title) +
      ' в корзину">добавить в корзину</button>' +
      "</div>" +
      "</div>" +
      '<div class="ct-product-card__body">' +
      '<h3 class="ct-product-card__name">' +
      esc(product.title) +
      "</h3>" +
      descHtml +
      '<div class="ct-product-card__footer">' +
      '<span class="ct-product-card__price">' +
      pricePrefix +
      minPrice.toLocaleString("ru-RU") +
      " ₽</span>" +
      '<a href="#cf-menu" class="ct-product-card__more" aria-label="Подробнее о ' +
      esc(product.title) +
      ' — перейти к меню">подробнее →</a>' +
      "</div>" +
      "</div>";

    return article;
  }

  var fragment = document.createDocumentFragment();
  products.forEach(function (product, i) {
    var card = renderCard(product);
    card.style.setProperty("--card-index", i);
    fragment.appendChild(card);
  });
  grid.appendChild(fragment);

  grid.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-add-to-cart]");
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    var card = btn.closest("[data-product-id]");
    if (!card) return;

    var imgEl = card.querySelector(".ct-product-card__img");
    var item = {
      id: card.dataset.productId,
      name: card.dataset.productName || "Кофе",
      price: parseInt(card.dataset.productPrice, 10) || 0,
      qty: 1,
      bg: card.dataset.productBg || "",
      category: card.dataset.productCat || "coffee",
      image: imgEl ? imgEl.src : "",
      size: "—",
      addons: [],
    };

    if (window.PalomaCart && window.PalomaCart.add) {
      window.PalomaCart.add(item);
    } else {
      cartFallback(item);
    }

    var orig = btn.textContent;
    btn.textContent = "✓ добавлено";
    btn.classList.add("is-added");
    btn.disabled = true;
    setTimeout(function () {
      btn.textContent = orig;
      btn.classList.remove("is-added");
      btn.disabled = false;
    }, 1600);
  });

  if ("IntersectionObserver" in window) {
    var noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!noMotion) {
      var style = document.createElement("style");
      style.textContent =
        "#ctTasteGrid .ct-product-card {" +
        "opacity:0;transform:translateY(20px);" +
        "transition:opacity 0.55s cubic-bezier(0.22,1,0.36,1)," +
        "transform 0.55s cubic-bezier(0.22,1,0.36,1);" +
        "transition-delay:calc(var(--card-index, 0) % 2 * 80ms);}" +
        "#ctTasteGrid .ct-product-card.is-visible {opacity:1;transform:translateY(0);}";
      document.head.appendChild(style);

      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.06, rootMargin: "0px 0px -24px 0px" },
      );
      grid.querySelectorAll(".ct-product-card").forEach(function (c) {
        io.observe(c);
      });
    } else {
      grid.querySelectorAll(".ct-product-card").forEach(function (c) {
        c.style.opacity = "1";
        c.style.transform = "none";
      });
    }
  }
})();

/* ════════════════════════════════════════════════════════
   CF-MOODS — горизонтальный scroll + progress + стрелки
   ════════════════════════════════════════════════════════ */
(function initCoffeeMoods() {
  "use strict";

  var track = document.getElementById("cfMoodsTrack");
  var progress = document.getElementById("cfMoodsProgress");
  var prevBtn = document.getElementById("cfMoodsPrev");
  var nextBtn = document.getElementById("cfMoodsNext");
  var section = document.getElementById("cfMoods");

  if (!track) return;

  var noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function updateProgress() {
    var maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) {
      if (progress) progress.style.width = "100%";
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }
    var ratio = track.scrollLeft / maxScroll;
    if (progress) progress.style.width = (ratio * 100).toFixed(2) + "%";
    if (prevBtn) prevBtn.disabled = track.scrollLeft <= 1;
    if (nextBtn) nextBtn.disabled = track.scrollLeft >= maxScroll - 1;
  }

  track.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  var resizeTimer;
  window.addEventListener(
    "resize",
    function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateProgress, 100);
    },
    { passive: true },
  );

  function getScrollStep() {
    var card = track.querySelector(".cf-mood-card");
    return card ? card.offsetWidth + 1 : track.clientWidth * 0.85;
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      track.scrollBy({
        left: -getScrollStep(),
        behavior: noMotion ? "auto" : "smooth",
      });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      track.scrollBy({
        left: getScrollStep(),
        behavior: noMotion ? "auto" : "smooth",
      });
    });
  }

  var isDragging = false;
  var didDrag = false;
  var startX = 0;
  var scrollStart = 0;

  track.addEventListener("mousedown", function (e) {
    if (e.button !== 0) return;
    isDragging = true;
    didDrag = false;
    startX = e.clientX;
    scrollStart = track.scrollLeft;
    track.classList.add("is-dragging");
    e.preventDefault();
  });

  window.addEventListener(
    "mousemove",
    function (e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) didDrag = true;
      track.scrollLeft = scrollStart - dx;
    },
    { passive: true },
  );

  window.addEventListener("mouseup", function () {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove("is-dragging");
  });

  track.addEventListener(
    "click",
    function (e) {
      if (didDrag) {
        e.preventDefault();
        e.stopPropagation();
        didDrag = false;
      }
    },
    true,
  );

  if (section) {
    section.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        track.scrollBy({
          left: getScrollStep(),
          behavior: noMotion ? "auto" : "smooth",
        });
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        track.scrollBy({
          left: -getScrollStep(),
          behavior: noMotion ? "auto" : "smooth",
        });
      }
    });
  }

  if (!noMotion && "IntersectionObserver" in window) {
    var header = section && section.querySelector(".cf-moods__header");
    if (header) {
      header.style.opacity = "0";
      header.style.transform = "translateY(24px)";
      header.style.transition =
        "opacity 0.7s cubic-bezier(0.22,1,0.36,1)," +
        "transform 0.7s cubic-bezier(0.22,1,0.36,1)";

      var headerIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              header.style.opacity = "1";
              header.style.transform = "translateY(0)";
              headerIo.unobserve(header);
            }
          });
        },
        { threshold: 0.15 },
      );
      headerIo.observe(header);
    }

    var cards = track.querySelectorAll(".cf-mood-card");
    cards.forEach(function (card, i) {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      card.style.transition =
        "opacity 0.6s cubic-bezier(0.22,1,0.36,1) " +
        i * 80 +
        "ms," +
        "transform 0.6s cubic-bezier(0.22,1,0.36,1) " +
        i * 80 +
        "ms," +
        "background 0.4s ease";
    });

    var cardsIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            cardsIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" },
    );

    cards.forEach(function (card) {
      cardsIo.observe(card);
    });
  }
})();

/* ════════════════════════════════════════════════════════
   COFFEE STORYTELLING — reveal + bg scale + sticky
   ════════════════════════════════════════════════════════ */
(function initCoffeeStorytelling() {
  "use strict";

  var wrap = document.getElementById("cfsWrap");
  var scenes = document.querySelectorAll(".cfs-scene");

  if (!wrap || !scenes.length) return;

  var isMobile = function () {
    return window.innerWidth <= 768;
  };
  var noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (noMotion || isMobile()) {
    scenes.forEach(function (scene) {
      scene.classList.add("is-active");
    });
    return;
  }

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var scene = entry.target;

        if (entry.isIntersecting) {
          scene.classList.add("is-active");
          scene.classList.add("is-entering");
        } else {
          var rect = scene.getBoundingClientRect();

          if (rect.top < 0) {
            scene.classList.remove("is-entering");
          } else {
            scene.classList.remove("is-active");
            scene.classList.remove("is-entering");
          }
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
  );

  scenes.forEach(function (scene) {
    revealObserver.observe(scene);
  });

  var raf = null;
  var activeScenes = new Set();

  var bgObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          activeScenes.add(entry.target);
          if (!raf) startRaf();
        } else {
          activeScenes.delete(entry.target);
          if (activeScenes.size === 0) stopRaf();
        }
      });
    },
    { threshold: 0, rootMargin: "15% 0px 15% 0px" },
  );

  scenes.forEach(function (scene) {
    bgObserver.observe(scene);
  });

  function startRaf() {
    function loop() {
      activeScenes.forEach(updateSceneBg);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
  }

  function stopRaf() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  function updateSceneBg(scene) {
    var bg =
      scene.querySelector(".cfs-scene__bg-ph") ||
      scene.querySelector(".cfs-scene__video");
    if (!bg) return;

    var rect = scene.getBoundingClientRect();
    var sceneH = scene.offsetHeight;
    var viewH = window.innerHeight;
    var progress = 1 - rect.bottom / (sceneH + viewH);
    var clamped = Math.max(0, Math.min(1, progress));
    var scale = 1 + clamped * 0.08;
    bg.style.transform = "scale(" + scale.toFixed(4) + ")";
  }

  var resizeTimer;
  window.addEventListener(
    "resize",
    function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (isMobile()) {
          revealObserver.disconnect();
          bgObserver.disconnect();
          stopRaf();
          scenes.forEach(function (scene) {
            scene.classList.add("is-active");
            var bg = scene.querySelector(".cfs-scene__bg-ph, .cfs-scene__video");
            if (bg) bg.style.transform = "";
          });
        }
      }, 150);
    },
    { passive: true },
  );

  window.addEventListener("beforeunload", stopRaf);
})();

/* ════════════════════════════════════════════════════════
   CFGR — блок «Зерно»: параллакс + reveal
   ════════════════════════════════════════════════════════ */
(function initGrainBlock() {
  "use strict";

  var section = document.getElementById("cfGrain");
  if (!section) return;

  var beanWrap = section.querySelector(".cfgr__bean-wrap");
  var content = section.querySelector(".cfgr__content");
  var noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (noMotion) {
    if (content) content.classList.add("is-visible");
  } else if (content && "IntersectionObserver" in window) {
    var revealIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            content.classList.add("is-visible");
            revealIO.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    revealIO.observe(content);
  } else if (content) {
    content.classList.add("is-visible");
  }

  if (!beanWrap || noMotion || window.innerWidth <= 900) return;

  var raf = null;
  var isInView = false;
  var lastTransform = null;

  var viewIO = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        isInView = e.isIntersecting;
        if (isInView) startLoop();
        else stopLoop();
      });
    },
    { threshold: 0, rootMargin: "20% 0px 20% 0px" },
  );
  viewIO.observe(section);

  function startLoop() {
    if (raf) return;
    function loop() {
      update();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
  }

  function stopLoop() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  function update() {
    var rect = section.getBoundingClientRect();
    var sectionH = section.offsetHeight;
    var viewH = window.innerHeight;
    var raw = 1 - rect.bottom / (sectionH + viewH);
    var progress = Math.max(0, Math.min(1, raw));
    var translateY = 40 - progress * 80;
    var scale = 1 + progress * 0.06;
    var transform =
      "translateY(calc(-50% + " +
      translateY.toFixed(2) +
      "px)) scale(" +
      scale.toFixed(4) +
      ")";

    if (transform === lastTransform) return;
    lastTransform = transform;
    beanWrap.style.transform = transform;
  }

  window.addEventListener("beforeunload", stopLoop);
})();

/* ════════════════════════════════════════════════════════
   CFM — меню кофейни PALOMA
   Tabs + фильтрация + hover-фото + корзина
   ════════════════════════════════════════════════════════ */
(function initCoffeeMenu() {
  "use strict";

  var section = document.getElementById("cf-menu");
  var tabs = document.getElementById("cfmTabs");
  var list = document.getElementById("cfmList");
  var photoFill = document.getElementById("cfmPhotoFill");
  var photoLabel = document.getElementById("cfmPhotoLabel");
  var tabLine = document.getElementById("cfmTabsLine");

  if (!section || !list) return;

  var products = window.PALOMA_COFFEE_MENU || [];
  var currentCat = "all";
  var hoverTimer = null;
  var noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cartFallback(item) {
    var KEY = "paloma_cart_v3";
    var items = [];
    try {
      items = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (_e) {
      items = [];
    }
    var ex = items.find(function (i) {
      return i.id === item.id;
    });
    if (ex) ex.qty = (ex.qty || 1) + 1;
    else {
      items.push({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: 1,
        bg: item.bg || "",
        category: item.category || "coffee",
        size: "—",
        addons: [],
      });
    }
    localStorage.setItem(KEY, JSON.stringify(items));
    var count = items.reduce(function (s, i) {
      return s + (i.qty || 1);
    }, 0);
    document.querySelectorAll("[data-cart-count], .cart-count").forEach(function (el) {
      el.textContent = count > 0 ? String(count) : "";
      el.style.display = count > 0 ? "flex" : "none";
    });
  }

  function renderList(cat) {
    currentCat = cat;
    var filtered =
      cat === "all"
        ? products
        : products.filter(function (p) {
            return p.category === cat;
          });

    list.innerHTML = "";

    filtered.forEach(function (item, idx) {
      var li = document.createElement("li");
      li.className = "cfm__item";
      li.dataset.cat = item.category;
      li.dataset.id = item.id;
      li.dataset.bg = item.imageBg || "";
      li.setAttribute("tabindex", "0");
      li.setAttribute("aria-label", item.title + ", " + item.priceLabel);

      li.innerHTML =
        '<div class="cfm__item-left">' +
        '<span class="cfm__item-num" aria-hidden="true">' +
        esc(item.num) +
        "</span>" +
        '<div class="cfm__item-info">' +
        "<h3 class=\"cfm__item-title\">" +
        esc(item.title) +
        "</h3>" +
        '<div class="cfm__item-meta">' +
        '<span class="cfm__item-volume">' +
        esc(item.volumes) +
        "</span>" +
        (item.desc
          ? '<span class="cfm__item-desc">' + esc(item.desc) + "</span>"
          : "") +
        "</div></div></div>" +
        '<div class="cfm__item-right">' +
        '<span class="cfm__item-price">' +
        esc(item.priceLabel) +
        "</span>" +
        '<button class="cfm__item-btn" data-add-to-cart' +
        ' data-product-id="' +
        esc(item.id) +
        '"' +
        ' data-product-name="' +
        esc(item.title) +
        '"' +
        ' data-product-price="' +
        item.price +
        '"' +
        ' data-product-bg="' +
        esc(item.imageBg || "") +
        '"' +
        ' data-product-cat="' +
        esc(item.category) +
        '"' +
        ' type="button" aria-label="Добавить ' +
        esc(item.title) +
        ' в корзину">в корзину</button></div>';

      if (!noMotion) {
        li.style.opacity = "0";
        li.style.transform = "translateY(8px)";
        li.style.transition =
          "opacity 0.4s ease " +
          idx * 40 +
          "ms, transform 0.4s ease " +
          idx * 40 +
          "ms";
      }

      list.appendChild(li);

      if (!noMotion) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            li.style.opacity = "1";
            li.style.transform = "translateY(0)";
          });
        });
      }
    });

    bindRowEvents();
  }

  function showPhoto(bg, label, image) {
    if (!photoFill) return;
    if (image) {
      photoFill.style.backgroundImage = 'url("' + image + '")';
      photoFill.style.background = "";
    } else {
      photoFill.style.backgroundImage = "";
      photoFill.style.background = bg || "rgba(27,26,24,0.06)";
    }
    if (photoLabel) photoLabel.textContent = label || "";
    photoFill.classList.add("is-visible");
  }

  function hidePhoto() {
    if (!photoFill) return;
    photoFill.classList.remove("is-visible");
  }

  function bindRowEvents() {
    if (window.innerWidth <= 1024) return;

    list.querySelectorAll(".cfm__item").forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        clearTimeout(hoverTimer);
        var product = products.find(function (p) {
          return p.id === row.dataset.id;
        });
        showPhoto(
          row.dataset.bg || "",
          row.querySelector(".cfm__item-title")
            ? row.querySelector(".cfm__item-title").textContent
            : "",
          product && product.image ? product.image : "",
        );
      });

      row.addEventListener("mouseleave", function () {
        hoverTimer = setTimeout(hidePhoto, 80);
      });

      row.addEventListener("focus", function () {
        clearTimeout(hoverTimer);
        var product = products.find(function (p) {
          return p.id === row.dataset.id;
        });
        showPhoto(
          row.dataset.bg || "",
          row.querySelector(".cfm__item-title")
            ? row.querySelector(".cfm__item-title").textContent
            : "",
          product && product.image ? product.image : "",
        );
      });

      row.addEventListener("blur", function () {
        hoverTimer = setTimeout(hidePhoto, 80);
      });
    });
  }

  function updateTabLine(activeTab) {
    if (!tabLine || !activeTab || !tabs) return;
    var tabsRect = tabs.getBoundingClientRect();
    var tabRect = activeTab.getBoundingClientRect();
    tabLine.style.left =
      tabRect.left - tabsRect.left + tabs.scrollLeft + "px";
    tabLine.style.width = tabRect.width + "px";
  }

  if (tabs) {
    tabs.addEventListener("click", function (e) {
      var tab = e.target.closest(".cfm__tab");
      if (!tab) return;

      var cat = tab.dataset.cat;
      if (cat === currentCat) return;

      tabs.querySelectorAll(".cfm__tab").forEach(function (t) {
        var active = t.dataset.cat === cat;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });

      updateTabLine(tab);
      hidePhoto();
      renderList(cat);
    });

    tabs.addEventListener(
      "scroll",
      function () {
        updateTabLine(tabs.querySelector(".cfm__tab.is-active"));
      },
      { passive: true },
    );
  }

  list.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-add-to-cart]");
    if (!btn || !btn.closest(".cfm__item")) return;

    e.preventDefault();
    e.stopPropagation();

    var item = {
      id: btn.dataset.productId,
      name: btn.dataset.productName || "Кофе",
      price: parseInt(btn.dataset.productPrice, 10) || 0,
      qty: 1,
      bg: btn.dataset.productBg || "",
      category: btn.dataset.productCat || "coffee",
      size: "—",
      addons: [],
    };

    if (window.PalomaCart && window.PalomaCart.add) {
      window.PalomaCart.add(item);
    } else {
      cartFallback(item);
    }

    var orig = btn.textContent;
    btn.textContent = "✓";
    btn.classList.add("is-added");
    btn.disabled = true;
    setTimeout(function () {
      btn.textContent = orig;
      btn.classList.remove("is-added");
      btn.disabled = false;
    }, 1400);
  });

  var resizeTimer;
  window.addEventListener(
    "resize",
    function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        updateTabLine(tabs && tabs.querySelector(".cfm__tab.is-active"));
        if (window.innerWidth <= 1024) hidePhoto();
      }, 100);
    },
    { passive: true },
  );

  renderList("all");
  setTimeout(function () {
    updateTabLine(tabs && tabs.querySelector(".cfm__tab.is-active"));
  }, 100);
})();
