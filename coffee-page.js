/* ═══════════════════════════════════════════════════════
   coffee-new.js — страница кофейни PALOMA (editorial)
   ═══════════════════════════════════════════════════════ */
(function initCoffeePageLegacy() {
  "use strict";

  if (!document.getElementById("coffeeHero")) return;

  var noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Reveal ── */
  (function initReveal() {
    var selectors = [
      ".coffee-product-showcase__head",
    ];

    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.classList.add("cf-reveal");
      });
    });

    var photoSelectors = [];

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

  /* ── Video fallback ── */
  (function initVideoFallback() {
    document.querySelectorAll(".coffee-hero__video, .coffee-story-panel__video").forEach(function (video) {
      var wrap =
        video.closest(".coffee-hero__media-frame") ||
        video.closest(".coffee-story-panel__bg") ||
        video.parentElement;
      var ph =
        wrap &&
        wrap.querySelector(
          ".coffee-hero__photo-ph, .coffee-story-panel__placeholder--coffee",
        );
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
      video.addEventListener(
        "loadeddata",
        function () {
          video.classList.add("is-loaded");
        },
        { once: true },
      );
    });
  })();

})();

/* ════════════════════════════════════════════════════════
   COFFEE HERO — анимации и parallax
   ════════════════════════════════════════════════════════ */
(function initCoffeeHero() {
  "use strict";

  var hero = document.getElementById("coffeeHero");
  if (!hero) return;

  var noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = function () {
    return window.innerWidth <= 768;
  };

  var titleLines = hero.querySelectorAll(".coffee-hero__title-line");
  var mediaFrame = hero.querySelector(".coffee-hero__media-frame");
  var video = hero.querySelector(".coffee-hero__video");
  var sub = hero.querySelector(".coffee-hero__sub");
  var bullets = hero.querySelector(".coffee-hero__bullets");
  var actions = hero.querySelector(".coffee-hero__actions");
  var mediaEl = video || hero.querySelector(".coffee-hero__photo-ph");

  titleLines.forEach(function (line) {
    if (noMotion) return;
    var hasWrapper = line.querySelector("span, em");
    if (!hasWrapper) {
      var text = line.textContent;
      line.innerHTML = "<span>" + text + "</span>";
    }
  });

  function runRevealSequence() {
    if (noMotion) {
      titleLines.forEach(function (l) {
        l.classList.add("is-revealed");
      });
      if (sub) sub.classList.add("is-revealed");
      if (bullets) bullets.classList.add("is-revealed");
      if (actions) actions.classList.add("is-revealed");
      if (mediaFrame) mediaFrame.classList.add("is-revealed");
      return;
    }

    if (mediaFrame && !isMobile()) {
      requestAnimationFrame(function () {
        mediaFrame.classList.add("is-revealed");
      });
    } else if (mediaFrame && isMobile()) {
      mediaFrame.classList.add("is-revealed");
    }

    titleLines.forEach(function (line, idx) {
      var delay = parseInt(line.dataset.delay, 10) || idx * 80;
      setTimeout(function () {
        line.classList.add("is-revealed");
      }, delay + 100);
    });

    var lastLine = titleLines[titleLines.length - 1];
    var lastDelay =
      titleLines.length > 0
        ? (parseInt(lastLine && lastLine.dataset.delay, 10) || 0) + 100
        : 100;

    setTimeout(function () {
      if (sub) sub.classList.add("is-revealed");
    }, lastDelay + 80);

    setTimeout(function () {
      if (bullets) bullets.classList.add("is-revealed");
    }, lastDelay + 160);

    setTimeout(function () {
      if (actions) actions.classList.add("is-revealed");
    }, lastDelay + 280);
  }

  if (document.readyState === "complete") {
    setTimeout(runRevealSequence, 120);
  } else {
    window.addEventListener(
      "load",
      function () {
        setTimeout(runRevealSequence, 120);
      },
      { once: true },
    );
  }

  if (noMotion || isMobile() || !mediaEl) return;

  var raf = null;
  var lastScale = null;
  var heroInView = false;

  var viewObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        heroInView = e.isIntersecting;
        if (heroInView) {
          startParallax();
        } else {
          stopParallax();
        }
      });
    },
    { threshold: 0, rootMargin: "10% 0px 0px 0px" },
  );
  viewObserver.observe(hero);

  function startParallax() {
    if (raf) return;
    function loop() {
      updateParallax();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
  }

  function stopParallax() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  function updateParallax() {
    var rect = hero.getBoundingClientRect();
    var heroH = hero.offsetHeight;
    var scrolled = Math.max(0, -rect.top);
    var progress = Math.min(1, scrolled / heroH);
    var scale = 1 + progress * 0.12;
    var rounded = Math.round(scale * 1000) / 1000;

    if (rounded === lastScale) return;
    lastScale = rounded;

    if (video) {
      video.style.transform = "scale(" + rounded + ")";
    } else {
      var ph = hero.querySelector(".coffee-hero__photo-ph");
      if (ph) ph.style.transform = "scale(" + rounded + ")";
    }
  }

  window.addEventListener("beforeunload", stopParallax);
})();

/* Управление классом header на hero */
(function initHeaderOnHero() {
  var header = document.querySelector(".site-header, header");
  var heroEl = document.getElementById("coffeeHero");
  if (!header || !heroEl) return;

  header.classList.add("coffee-hero-active");

  function update() {
    var heroBottom = heroEl.getBoundingClientRect().bottom;
    if (heroBottom <= 0) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
})();

/* ════════════════════════════════════════════════════════
   COFFEE SHOWCASE — рендер карточек + корзина + reveal
   ════════════════════════════════════════════════════════ */
(function initCoffeeShowcase() {
  "use strict";

  var grid = document.getElementById("coffeeShowcaseGrid");
  if (!grid) return;

  var products = (window.PALOMA_COFFEE || []).slice(0, 8);
  if (!products.length) {
    products = (window.PALOMA_COFFEE_MENU || []).slice(0, 8);
  }
  if (!products.length) return;

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getVolStr(product) {
    if (typeof product.volumes === "string") return product.volumes;
    if (Array.isArray(product.volumes)) {
      return product.volumes
        .map(function (v) {
          return v.label;
        })
        .join(" / ");
    }
    return "";
  }

  function getMinPrice(product) {
    if (Array.isArray(product.volumes) && product.volumes.length) {
      return Math.min.apply(
        null,
        product.volumes.map(function (v) {
          return v.price;
        }),
      );
    }
    return Number(product.price) || 0;
  }

  function getPriceLabel(product) {
    if (product.priceLabel) return product.priceLabel;
    var min = getMinPrice(product);
    var prefix =
      Array.isArray(product.volumes) && product.volumes.length > 1 ? "от " : "";
    return prefix + min.toLocaleString("ru-RU") + " ₽";
  }

  function getPh(product) {
    return (
      product.ph ||
      product.placeholderBg ||
      product.imageBg ||
      "#F0E8D8"
    );
  }

  function getDesc(product) {
    return product.desc || product.description || "";
  }

  function addToCartFn(item) {
    if (window.PalomaCart && typeof window.PalomaCart.add === "function") {
      window.PalomaCart.add(item);
      return;
    }

    if (typeof window.addToCart === "function") {
      window.addToCart(item);
      return;
    }

    var CART_KEY = "paloma_cart_v3";
    var cart = [];
    try {
      cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch (_e) {
      cart = [];
    }

    var existing = cart.find(function (i) {
      return i.id === item.id;
    });
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push(Object.assign({}, item, { qty: 1 }));
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart));

    var totalQty = cart.reduce(function (sum, i) {
      return sum + (i.qty || 1);
    }, 0);
    document
      .querySelectorAll(
        "[data-cart-count], .cart-count, .cart-badge, #cartCount, .site-header__cart-count",
      )
      .forEach(function (el) {
        el.textContent = totalQty > 0 ? String(totalQty) : "";
        el.style.display = totalQty > 0 ? "flex" : "none";
      });

    if (typeof window.openCartDrawer === "function") {
      window.openCartDrawer();
    }
  }

  function renderCard(product) {
    var numLabel =
      product.num + " — " + String(product.title || "").toLowerCase();
    var volStr = getVolStr(product);
    var priceLabel = getPriceLabel(product);
    var ph = getPh(product);
    var desc = getDesc(product);

    var photoContent = product.image
      ? '<img src="' +
        esc(product.image) +
        '" alt="' +
        esc(product.title) +
        '" loading="lazy" class="coffee-product-card__img">'
      : "<!-- TODO: assets/images/coffee/showcase/" +
        esc(String(product.id).replace(/^coffee-|^menu-/, "")) +
        ".jpg -->";

    var article = document.createElement("article");
    article.className = "coffee-product-card";
    article.dataset.productId = product.id;
    article.dataset.productName = product.title;
    article.dataset.productPrice = String(getMinPrice(product));
    article.dataset.productCategory = product.category || "coffee";

    article.innerHTML =
      '<div class="coffee-product-card__top">' +
      '<span class="coffee-product-card__num">' +
      esc(numLabel) +
      "</span>" +
      '<span class="coffee-product-card__vol">' +
      esc(volStr) +
      "</span>" +
      "</div>" +
      '<div class="coffee-product-card__photo">' +
      '<div class="coffee-product-card__ph" style="background:' +
      esc(ph) +
      ';" aria-hidden="true"></div>' +
      photoContent +
      '<div class="coffee-product-card__overlay" aria-hidden="true">' +
      '<button class="coffee-product-card__add-btn" type="button" data-add-to-cart aria-label="Добавить ' +
      esc(product.title) +
      ' в корзину">добавить в корзину</button>' +
      "</div>" +
      "</div>" +
      '<div class="coffee-product-card__body">' +
      "<div>" +
      '<h3 class="coffee-product-card__name">' +
      esc(product.title) +
      "</h3>" +
      '<p class="coffee-product-card__desc">' +
      esc(desc) +
      "</p>" +
      "</div>" +
      '<p class="coffee-product-card__price">' +
      esc(priceLabel) +
      "</p>" +
      "</div>";

    return article;
  }

  var fragment = document.createDocumentFragment();
  products.forEach(function (product, index) {
    var card = renderCard(product);
    card.style.transitionDelay = Math.min(index * 60, 360) + "ms";
    fragment.appendChild(card);
  });
  grid.appendChild(fragment);

  grid.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-add-to-cart]");
    if (!btn) return;

    e.stopPropagation();

    var card = btn.closest(".coffee-product-card");
    if (!card) return;

    var imgEl = card.querySelector(".coffee-product-card__img");
    var item = {
      id: card.dataset.productId,
      name: card.dataset.productName,
      price: parseInt(card.dataset.productPrice, 10) || 0,
      category: card.dataset.productCategory || "coffee",
      qty: 1,
      type: "coffee",
      image: imgEl ? imgEl.src : "",
      size: "—",
      addons: [],
      bg: card.querySelector(".coffee-product-card__ph")
        ? card.querySelector(".coffee-product-card__ph").style.background
        : "",
    };

    addToCartFn(item);

    var origText = btn.textContent;
    btn.textContent = "✓ добавлено";
    btn.classList.add("is-added");
    btn.disabled = true;

    setTimeout(function () {
      btn.textContent = origText;
      btn.classList.remove("is-added");
      btn.disabled = false;
    }, 1500);
  });

  var noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (noMotion) {
    grid.querySelectorAll(".coffee-product-card").forEach(function (card) {
      card.classList.add("is-visible");
      card.style.transitionDelay = "0ms";
    });
  } else if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );

    grid.querySelectorAll(".coffee-product-card").forEach(function (card) {
      observer.observe(card);
    });
  } else {
    grid.querySelectorAll(".coffee-product-card").forEach(function (card) {
      card.classList.add("is-visible");
    });
  }
})();

/* ════════════════════════════════════════════════════════
   COFFEE FORMAT TRACK — горизонтальная лента
   progress-bar + drag-to-scroll + reveal
   ════════════════════════════════════════════════════════ */
(function initCoffeeFormatTrack() {
  "use strict";

  var section = document.getElementById("coffeeFormatTrack");
  var scroll = document.getElementById("cfmTrackScroll");
  var progressFill = document.getElementById("cfmProgressFill");

  if (!section || !scroll) return;

  var cards = scroll.querySelectorAll(".coffee-format-card");
  var noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function updateProgress() {
    if (!progressFill) return;
    var maxScroll = scroll.scrollWidth - scroll.clientWidth;
    if (maxScroll <= 0) {
      progressFill.style.width = "100%";
      return;
    }
    var ratio = scroll.scrollLeft / maxScroll;
    progressFill.style.width = (ratio * 100).toFixed(2) + "%";
  }

  scroll.addEventListener("scroll", updateProgress, { passive: true });

  var isDragging = false;
  var startX = 0;
  var startScroll = 0;
  var didDrag = false;

  scroll.addEventListener("mousedown", function (e) {
    if (e.button !== 0) return;
    isDragging = true;
    didDrag = false;
    startX = e.clientX;
    startScroll = scroll.scrollLeft;
    scroll.classList.add("is-dragging");
    e.preventDefault();
  });

  window.addEventListener(
    "mousemove",
    function (e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) didDrag = true;
      scroll.scrollLeft = startScroll - dx;
    },
    { passive: true },
  );

  window.addEventListener("mouseup", function () {
    if (!isDragging) return;
    isDragging = false;
    scroll.classList.remove("is-dragging");
  });

  scroll.addEventListener(
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

  section.setAttribute("tabindex", "0");

  section.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();

    var cardWidth = cards[0] ? cards[0].offsetWidth : 300;
    var dir = e.key === "ArrowRight" ? 1 : -1;

    scroll.scrollBy({
      left: dir * (cardWidth + 1),
      behavior: noMotion ? "auto" : "smooth",
    });
  });

  var resizeTimer;
  window.addEventListener(
    "resize",
    function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateProgress, 80);
    },
    { passive: true },
  );

  if (noMotion) {
    cards.forEach(function (card) {
      card.classList.add("is-visible");
      card.style.transitionDelay = "0ms";
    });
  } else if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          cards.forEach(function (card, idx) {
            var delay = idx * 80;
            card.style.transitionDelay = delay + "ms";
            setTimeout(function () {
              card.classList.add("is-visible");
            }, 10);
          });

          sectionObserver.disconnect();
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -48px 0px",
      },
    );

    sectionObserver.observe(section);
  } else {
    cards.forEach(function (card) {
      card.classList.add("is-visible");
    });
  }

  updateProgress();
})();

/* ════════════════════════════════════════════════════════
   COFFEE STORYTELLING — cinematic fullscreen panels
   ════════════════════════════════════════════════════════ */
(function initCoffeeStorytelling() {
  "use strict";

  var story = document.getElementById("coffeeStory");
  if (!story) return;

  var panels = story.querySelectorAll("[data-coffee-story-panel]");
  if (!panels.length) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    panels.forEach(function (panel) {
      panel.classList.add("is-visible");
      var bg = panel.querySelector("[data-coffee-story-bg]");
      if (bg) bg.style.transform = "none";
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    {
      threshold: 0.38,
      rootMargin: "0px 0px -10% 0px",
    },
  );

  panels.forEach(function (panel) {
    observer.observe(panel);
  });

  var raf = null;

  function updateParallax() {
    panels.forEach(function (panel) {
      var bg = panel.querySelector("[data-coffee-story-bg]");
      if (!bg) return;

      var rect = panel.getBoundingClientRect();
      var viewH = window.innerHeight;
      var progress = 1 - rect.bottom / (viewH + panel.offsetHeight);
      var clamped = Math.max(0, Math.min(1, progress));
      var scale = 1 + clamped * 0.08;

      bg.style.transform = "scale(" + scale.toFixed(4) + ")";
    });

    raf = null;
  }

  function requestUpdate() {
    if (raf) return;
    raf = window.requestAnimationFrame(updateParallax);
  }

  updateParallax();

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
})();

/* ════════════════════════════════════════════════════════
   COFFEE GIFT SPLIT — reveal + small media parallax
   ════════════════════════════════════════════════════════ */
(function initCoffeeGiftSplit() {
  "use strict";

  var section = document.getElementById("coffeeGiftSplit");
  if (!section) return;

  var smallMedia = section.querySelector("[data-coffee-split-small-media]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    section.classList.add("is-visible");
    if (smallMedia) smallMedia.style.transform = "none";
    return;
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          section.classList.add("is-visible");
          observer.unobserve(section);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(section);
  } else {
    section.classList.add("is-visible");
  }

  var raf = null;

  function updateParallax() {
    if (!smallMedia) return;

    var rect = section.getBoundingClientRect();
    var viewH = window.innerHeight;
    var progress = 1 - rect.bottom / (viewH + section.offsetHeight);
    var clamped = Math.max(0, Math.min(1, progress));
    var y = (clamped - 0.5) * 34;

    smallMedia.style.transform = "translate3d(0, " + y.toFixed(2) + "px, 0)";
    raf = null;
  }

  function requestUpdate() {
    if (raf) return;
    raf = window.requestAnimationFrame(updateParallax);
  }

  updateParallax();

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
})();

/* ════════════════════════════════════════════════════════
   COFFEE BEAN MOOD — reveal + bean scroll motion
   ════════════════════════════════════════════════════════ */
(function initCoffeeBeanMood() {
  "use strict";

  var section = document.getElementById("coffeeBeanMood");
  if (!section) return;

  var bean = document.getElementById("coffeeBeanMoodBean");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    section.classList.add("is-visible");
    if (bean) bean.style.transform = "";
    return;
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          section.classList.add("is-visible");
          observer.unobserve(section);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(section);
  } else {
    section.classList.add("is-visible");
  }

  var raf = null;

  function updateBeanMotion() {
    if (!bean) return;

    var rect = section.getBoundingClientRect();
    var viewH = window.innerHeight;
    var progress = 1 - rect.bottom / (viewH + section.offsetHeight);
    var clamped = Math.max(0, Math.min(1, progress));
    var isMobile = window.matchMedia("(max-width: 900px)").matches;

    if (isMobile) {
      var mScale = 1 + clamped * 0.045;
      var mY = (clamped - 0.5) * 18;
      bean.style.transform =
        "translate(-50%, calc(-50% + " +
        mY.toFixed(2) +
        "px)) scale(" +
        mScale.toFixed(4) +
        ")";
    } else {
      var scale = 1 + clamped * 0.06;
      var x = (clamped - 0.5) * 26;
      var y = (clamped - 0.5) * -32;
      bean.style.transform =
        "translate(" +
        x.toFixed(2) +
        "px, calc(-50% + " +
        y.toFixed(2) +
        "px)) scale(" +
        scale.toFixed(4) +
        ")";
    }

    raf = null;
  }

  function requestUpdate() {
    if (raf) return;
    raf = window.requestAnimationFrame(updateBeanMotion);
  }

  updateBeanMotion();

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
})();

/* ════════════════════════════════════════════════════════
   COFFEE MENU — tabs, preview, PalomaCart
   ════════════════════════════════════════════════════════ */
(function initCoffeeMenu() {
  "use strict";

  var section = document.getElementById("coffeeMenu");
  if (!section) return;

  var tabs = section.querySelectorAll("[data-coffee-category]");
  var list = document.getElementById("coffeeMenuList");
  var preview = document.getElementById("coffeeMenuPreview");

  if (!tabs.length || !list) return;

  var CART_KEY = "paloma_cart_v3";
  var activeCategory = "coffee";

  var menuData = {
    coffee: [
      { id: "coffee-cappuccino", title: "Капучино", description: "Мягкий кофе с молочной пеной.", volume: "250 мл", price: 250, priceText: "250 ₽", previewClass: "coffee-menu__preview-placeholder--cappuccino", menuCategory: "coffee" },
      { id: "coffee-latte", title: "Латте", description: "Нежный молочный кофе для спокойного дня.", volume: "300 мл", price: 270, priceText: "270 ₽", previewClass: "coffee-menu__preview-placeholder--latte", menuCategory: "coffee" },
      { id: "coffee-raf-paloma", title: "Раф Paloma", description: "Сливочный авторский раф с мягким ароматом.", volume: "300 мл", price: 330, priceText: "330 ₽", previewClass: "coffee-menu__preview-placeholder--raf", menuCategory: "coffee" },
      { id: "coffee-americano", title: "Американо", description: "Чистый вкус кофе без лишней плотности.", volume: "250 мл", price: 220, priceText: "220 ₽", previewClass: "coffee-menu__preview-placeholder--americano", menuCategory: "coffee" },
      { id: "coffee-flat-white", title: "Флэт уайт", description: "Более насыщенный молочный кофе.", volume: "200 мл", price: 300, priceText: "300 ₽", previewClass: "coffee-menu__preview-placeholder--flat-white", menuCategory: "coffee" },
    ],
    tea: [
      { id: "tea-black", title: "Чёрный чай", description: "Классический согревающий чай.", volume: "350 мл", price: 220, priceText: "220 ₽", previewClass: "coffee-menu__preview-placeholder--black-tea", menuCategory: "tea" },
      { id: "tea-green", title: "Зелёный чай", description: "Лёгкий чай с мягким вкусом.", volume: "350 мл", price: 220, priceText: "220 ₽", previewClass: "coffee-menu__preview-placeholder--green-tea", menuCategory: "tea" },
      { id: "tea-herbal", title: "Травяной чай", description: "Спокойный травяной сбор.", volume: "350 мл", price: 250, priceText: "250 ₽", previewClass: "coffee-menu__preview-placeholder--herbal-tea", menuCategory: "tea" },
    ],
    bakery: [
      { id: "bakery-croissant", title: "Круассан", description: "Слоёная выпечка к кофе или букету.", volume: "1 шт.", price: 250, priceText: "250 ₽", previewClass: "coffee-menu__preview-placeholder--croissant", menuCategory: "bakery" },
      { id: "bakery-cinnamon-roll", title: "Булочка с корицей", description: "Тёплая сладкая выпечка с корицей.", volume: "1 шт.", price: 230, priceText: "230 ₽", previewClass: "coffee-menu__preview-placeholder--cinnamon", menuCategory: "bakery" },
    ],
    desserts: [
      { id: "dessert-day", title: "Десерт дня", description: "Небольшой десерт, который можно добавить к подарку.", volume: "1 шт.", price: 320, priceText: "от 320 ₽", previewClass: "coffee-menu__preview-placeholder--dessert", menuCategory: "desserts" },
      { id: "dessert-macaron", title: "Макарон", description: "Аккуратный сладкий акцент к кофе.", volume: "1 шт.", price: 180, priceText: "180 ₽", previewClass: "coffee-menu__preview-placeholder--macaron", menuCategory: "desserts" },
    ],
    lemonades: [
      { id: "lemonade-floral", title: "Цветочный лимонад", description: "Освежающий напиток с цветочным настроением.", volume: "300 мл", price: 320, priceText: "320 ₽", previewClass: "coffee-menu__preview-placeholder--floral-lemonade", menuCategory: "lemonades" },
      { id: "lemonade-berry", title: "Ягодный лимонад", description: "Лёгкий ягодный лимонад.", volume: "300 мл", price: 320, priceText: "320 ₽", previewClass: "coffee-menu__preview-placeholder--berry-lemonade", menuCategory: "lemonades" },
    ],
  };

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getAllItems() {
    return Object.keys(menuData).reduce(function (acc, key) {
      return acc.concat(menuData[key]);
    }, []);
  }

  function findItem(id) {
    return getAllItems().find(function (item) {
      return item.id === id;
    });
  }

  function isDesktopPreview() {
    return window.matchMedia("(min-width: 901px)").matches;
  }

  function renderPreview(item) {
    if (!preview || !item || !isDesktopPreview()) return;
    preview.innerHTML =
      '<div class="coffee-menu__preview-placeholder ' +
      esc(item.previewClass) +
      '"><span>' +
      esc(item.title) +
      "</span></div>";
  }

  function renderItems(category) {
    var items = menuData[category] || [];
    list.innerHTML = items
      .map(function (item) {
        return (
          '<article class="coffee-menu-item" data-coffee-item="' +
          esc(item.id) +
          '"><div class="coffee-menu-item__main"><h3 class="coffee-menu-item__title">' +
          esc(item.title) +
          '</h3><p class="coffee-menu-item__description">' +
          esc(item.description) +
          '</p><p class="coffee-menu-item__meta">' +
          esc(item.volume) +
          '</p><div class="coffee-menu-item__mobile-photo" aria-hidden="true"><div class="coffee-menu__preview-placeholder ' +
          esc(item.previewClass) +
          '"><span>' +
          esc(item.title) +
          '</span></div></div></div><p class="coffee-menu-item__price">' +
          esc(item.priceText) +
          '</p><button class="coffee-menu-item__add" type="button" data-coffee-add="' +
          esc(item.id) +
          '">в корзину</button></article>'
        );
      })
      .join("");
    if (items[0]) renderPreview(items[0]);
  }

  function setActiveCategory(category) {
    if (!menuData[category]) return;
    activeCategory = category;
    tabs.forEach(function (tab) {
      var isActive = tab.dataset.coffeeCategory === category;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    renderItems(category);
  }

  function getCartFromStorage() {
    try {
      var raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch (_e) {
      return [];
    }
  }

  function saveCartToStorage(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (_e) {
      /* ignore */
    }
  }

  function updateCartCounterFallback(cart) {
    var count = cart.reduce(function (sum, product) {
      return sum + Number(product.qty || product.quantity || 1);
    }, 0);
    document
      .querySelectorAll("[data-cart-count], .cart-count, .header-cart-count, #cartCount, .site-header__cart-count")
      .forEach(function (counter) {
        counter.textContent = count > 0 ? String(count) : "";
        counter.style.display = count > 0 ? "flex" : "none";
        counter.classList.toggle("is-visible", count > 0);
        counter.classList.toggle("is-empty", count === 0);
        counter.toggleAttribute("hidden", count === 0);
      });
  }

  function addCoffeeToCart(item) {
    var cartItem = {
      id: item.id,
      name: item.title,
      price: item.price,
      qty: 1,
      category: item.menuCategory || "coffee",
      type: "coffee-menu",
      size: item.volume || "—",
      bg: "",
      addons: [],
    };

    if (window.PalomaCart && typeof window.PalomaCart.add === "function") {
      window.PalomaCart.add(cartItem);
      return;
    }

    if (typeof window.addToCart === "function") {
      window.addToCart(cartItem);
      return;
    }

    if (typeof window.cartAdd === "function") {
      window.cartAdd(cartItem);
      return;
    }

    var cart = getCartFromStorage();
    var existing = cart.find(function (product) {
      return product.id === cartItem.id;
    });

    if (existing) {
      existing.qty = Number(existing.qty || existing.quantity || 1) + 1;
    } else {
      cart.push(cartItem);
    }

    saveCartToStorage(cart);
    updateCartCounterFallback(cart);

    if (typeof window.updateCartCounter === "function") {
      window.updateCartCounter();
    }

    if (typeof window.renderCart === "function") {
      window.renderCart();
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var category = tab.dataset.coffeeCategory;
      if (!category || category === activeCategory) return;
      setActiveCategory(category);
    });
  });

  list.addEventListener("mouseover", function (event) {
    if (!isDesktopPreview()) return;
    var itemElement = event.target.closest("[data-coffee-item]");
    if (!itemElement) return;
    var item = findItem(itemElement.dataset.coffeeItem);
    if (item) renderPreview(item);
  });

  list.addEventListener("click", function (event) {
    var button = event.target.closest("[data-coffee-add]");
    if (!button) return;
    var item = findItem(button.dataset.coffeeAdd);
    if (!item) return;
    addCoffeeToCart(item);
    var orig = button.textContent;
    button.textContent = "добавлено";
    button.disabled = true;
    window.setTimeout(function () {
      button.textContent = orig;
      button.disabled = false;
    }, 1200);
  });

  window.addEventListener(
    "resize",
    function () {
      var items = menuData[activeCategory] || [];
      if (items[0]) renderPreview(items[0]);
    },
    { passive: true },
  );

  setActiveCategory(activeCategory);
})();

/* ════════════════════════════════════════════════════════
   COFFEE + BOUQUET UPSELL — reveal + anchor scroll
   ════════════════════════════════════════════════════════ */
(function initCoffeeBouquetAdd() {
  "use strict";

  var section = document.getElementById("coffeeBouquetAdd");
  if (!section) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    section.classList.add("is-visible");
    return;
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          section.classList.add("is-visible");
          observer.unobserve(section);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(section);
  } else {
    section.classList.add("is-visible");
  }
})();

(function initCoffeeBouquetAnchorScroll() {
  "use strict";

  var link = document.querySelector(
    '.coffee-bouquet-add__button[href="#coffeeMenu"]',
  );
  var target = document.getElementById("coffeeMenu");

  if (!link || !target) return;

  link.addEventListener("click", function (event) {
    event.preventDefault();

    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  });
})();

/* ════════════════════════════════════════════════════════
   COFFEE LOCATION — reveal + media parallax + menu scroll
   ════════════════════════════════════════════════════════ */
(function initCoffeeLocation() {
  "use strict";

  var section = document.getElementById("coffeeLocation");
  if (!section) return;

  var media = section.querySelector("[data-coffee-location-media]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    section.classList.add("is-visible");
    if (media) media.style.transform = "none";
    return;
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          section.classList.add("is-visible");
          observer.unobserve(section);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(section);
  } else {
    section.classList.add("is-visible");
  }

  var raf = null;

  function updateParallax() {
    if (!media) return;

    var rect = section.getBoundingClientRect();
    var viewH = window.innerHeight;
    var progress = 1 - rect.bottom / (viewH + section.offsetHeight);
    var clamped = Math.max(0, Math.min(1, progress));
    var isMobile = window.matchMedia("(max-width: 900px)").matches;
    var y = isMobile ? 0 : (clamped - 0.5) * -34;

    media.style.transform = "translate3d(0, " + y.toFixed(2) + "px, 0)";
    raf = null;
  }

  function requestUpdate() {
    if (raf) return;
    raf = window.requestAnimationFrame(updateParallax);
  }

  updateParallax();

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
})();

(function initCoffeeLocationMenuScroll() {
  "use strict";

  var link = document.querySelector("[data-coffee-location-menu-link]");
  var target = document.getElementById("coffeeMenu");

  if (!link || !target) return;

  link.addEventListener("click", function (event) {
    event.preventDefault();

    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  });
})();

/* ════════════════════════════════════════════════════════
   COFFEE PAGE — финальные проверки и связи
   ════════════════════════════════════════════════════════ */
(function coffeeFinalChecks() {
  "use strict";

  if (
    !document.body.classList.contains("coffee-page") &&
    !document.getElementById("coffeeHero")
  ) {
    return;
  }

  var mainEl = document.querySelector("main#main, main");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (mainEl) {
    mainEl.addEventListener(
      "click",
      function (e) {
        var link = e.target.closest('a[href="#coffeeMenu"]');
        if (!link || e.defaultPrevented) return;

        var target = document.getElementById("coffeeMenu");
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      },
      false,
    );
  }

  window.addEventListener("load", function () {
    window.setTimeout(function () {
      var docW = document.documentElement.scrollWidth;
      var winW = window.innerWidth;

      if (docW <= winW + 2) return;

      document.querySelectorAll(".coffee-page main *").forEach(function (el) {
        if (el.scrollWidth <= winW + 2) return;
        if (el.classList.contains("coffee-format-track__scroll")) return;
        el.style.maxWidth = "100%";
      });

      if (typeof console !== "undefined" && console.warn) {
        console.warn(
          "[PALOMA Coffee] Horizontal overflow:",
          docW + "px vs viewport " + winW + "px",
        );
      }
    }, 300);
  });
})();
