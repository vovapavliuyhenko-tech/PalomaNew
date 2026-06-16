/* ═══════════════════════════════════════════════════════════════════
   PALOMA Coffee — интерактив страницы кофейни (.coffee-ea)
   Меню (фильтр + фото при наведении + попап-карточка + корзина),
   горизонтальные этапы, reveal по скроллу.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();

  var inited = false;
  function init() {
    if (inited) return;
    inited = true;

    /* ── reveal по скроллу ── */
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document
      .querySelectorAll(".ea-page [data-reveal]")
      .forEach(function (el) {
        io.observe(el);
      });

    /* ── МЕНЮ (карточки как в каталоге) ── */
    var MENU = window.PALOMA_COFFEE_MENU || [];
    var catLabels = {
      all: "Всё меню",
      classic: "Классика",
      cacaoraf: "Какао и раф",
      smoothie: "Смузи",
      milkshake: "Коктейли",
      tea: "Чай",
      cold: "Холодные",
    };
    /* фото по разделам — доступные кадры кофейни */
    var imgByCat = {
      classic: "images/paloma/coffee/cup-classic.jpg",
      cacaoraf: "images/paloma/coffee/cup-raf.jpg",
      smoothie: "images/paloma/coffee/cup-smoothie.jpg",
      milkshake: "images/paloma/coffee/cup-milkshake.jpg",
      tea: "images/paloma/coffee/cup-tea.jpg",
      cold: "images/paloma/coffee/cup-cold.jpg",
    };
    function itemImg(it) {
      return it.image || imgByCat[it.category] || "";
    }

    var filtersBox = document.getElementById("cfMenuFilters");
    var grid = document.getElementById("cfMenuGrid");
    var countBox = document.getElementById("cfMenuCount");
    var active = "all";

    function plural(n) {
      var m10 = n % 10, m100 = n % 100;
      if (m10 === 1 && m100 !== 11) return n + " позиция";
      if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return n + " позиции";
      return n + " позиций";
    }

    if (filtersBox && grid && MENU.length) {
      var cats = ["all"].concat(
        MENU.map(function (i) {
          return i.category;
        }).filter(function (v, i, a) {
          return a.indexOf(v) === i;
        })
      );
      cats.forEach(function (c) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "catalog-filter-btn" + (c === "all" ? " is-active" : "");
        b.setAttribute("data-filter", c);
        b.setAttribute("aria-pressed", c === "all" ? "true" : "false");
        b.setAttribute("data-cursor", "hover");
        b.textContent = catLabels[c] || c;
        b.addEventListener("click", function () {
          if (active === c) return;
          active = c;
          [].forEach.call(filtersBox.children, function (x) {
            var on = x === b;
            x.classList.toggle("is-active", on);
            x.setAttribute("aria-pressed", on ? "true" : "false");
          });
          render();
        });
        filtersBox.appendChild(b);
      });
      render();
    }

    function cardHtml(it) {
      var img = itemImg(it);
      var media = img
        ? '<img class="product-card__img product-card__img--main" src="' +
            esc(img) + '" alt="' + esc(it.title) +
            '" loading="lazy" onerror="this.style.display=\'none\'">' +
          '<div class="product-card__ph" style="background:' +
            esc(it.imageBg || "") + ';" aria-hidden="true"></div>'
        : '<div class="product-card__ph" style="background:' +
            esc(it.imageBg || "") + ';" aria-hidden="true"></div>';
      var href = "coffee-item.html?id=" + encodeURIComponent(it.id);
      return (
        '<div class="product-card__media">' +
          '<a class="product-card__media-link" href="' + href + '" aria-label="' + esc(it.title) + '">' +
            media +
          "</a>" +
          '<span class="product-card__badge product-card__badge--coffee">' +
            esc(catLabels[it.category] || "") + "</span>" +
        "</div>" +
        '<div class="product-card__body">' +
          '<a class="product-card__name-link" href="' + href + '">' +
            '<h3 class="product-card__name">' + esc(it.title) + "</h3>" +
          "</a>" +
          (it.desc ? '<p class="product-card__desc">' + esc(it.desc) + "</p>" : "") +
          '<p class="product-card__price">' + esc(it.priceLabel || it.price + " ₽") + "</p>" +
          '<div class="product-card__btns">' +
            '<a class="product-card__btn product-card__btn--detail" href="' + href + '">Подробнее</a>' +
            '<button type="button" class="product-card__btn product-card__btn--cart" data-cf-add aria-label="Добавить в корзину: ' +
              esc(it.title) + '">В корзину</button>' +
          "</div>" +
        "</div>"
      );
    }

    function render() {
      if (!grid) return;
      grid.innerHTML = "";
      var items = MENU.filter(function (it) {
        return active === "all" || it.category === active;
      });
      if (countBox) countBox.textContent = plural(items.length);
      var frag = document.createDocumentFragment();
      items.forEach(function (it) {
        var card = document.createElement("article");
        card.className = "product-card";
        card.dataset.id = it.id;
        card._item = it;
        card.innerHTML = cardHtml(it);
        frag.appendChild(card);
      });
      grid.appendChild(frag);
      var cards = grid.querySelectorAll(".product-card");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        cards.forEach(function (c) { c.classList.add("is-visible", "is-revealed"); });
      } else {
        requestAnimationFrame(function () {
          cards.forEach(function (c, i) {
            setTimeout(function () { c.classList.add("is-visible", "is-revealed"); }, Math.min(i * 40, 400));
          });
        });
      }
      window.palomaRebindCursorHovers && window.palomaRebindCursorHovers();
    }

    if (grid) {
      grid.addEventListener("click", function (e) {
        var card = e.target.closest(".product-card");
        if (!card || !card._item) return;
        var it = card._item;
        if (e.target.closest("[data-cf-add]")) {
          if (window.PalomaCart && window.PalomaCart.add) {
            var img = itemImg(it);
            window.PalomaCart.add({
              id: it.id,
              name: it.title,
              price: Number(it.price) || 0,
              qty: 1,
              category: "coffee",
              bg: img ? "url(" + img + ") center/cover" : it.imageBg || "",
            });
          }
          var btn = e.target.closest("[data-cf-add]");
          var prev = btn.textContent;
          btn.textContent = "✓";
          btn.disabled = true;
          setTimeout(function () { btn.textContent = prev; btn.disabled = false; }, 1200);
          return;
        }
        /* переход на страницу напитка — по ссылкам в карточке (попап отключён) */
      });
    }

    /* ── МОДАЛКА позиции меню (как карточка букета) ── */
    var modal = document.getElementById("cfModal");
    function $(s) {
      return modal.querySelector(s);
    }
    function openModal(it) {
      if (!modal) return;
      var img = itemImg(it);
      var imgEl = $("#cfModalImg");
      imgEl.style.background = "";
      if (img) imgEl.style.backgroundImage = 'url("' + img + '")';
      else if (it.imageBg) imgEl.style.background = it.imageBg;
      $("#cfModalCat").textContent = catLabels[it.category] || it.category || "Меню";
      $("#cfModalTitle").textContent = it.title;
      $("#cfModalDesc").textContent = it.desc || "";
      $("#cfModalVol").textContent = it.volumes || "";
      $("#cfModalPrice").textContent = it.priceLabel || it.price + " ₽";
      $("#cfModalAdded").classList.remove("is-on");
      modal._item = it;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("cf-modal-open");
    }
    function closeModal() {
      if (!modal) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("cf-modal-open");
    }
    if (modal) {
      $("#cfModalClose").addEventListener("click", closeModal);
      modal.addEventListener("click", function (e) {
        if (e.target === modal) closeModal();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
      });
      $("#cfModalAdd").addEventListener("click", function () {
        var it = modal._item;
        if (!it) return;
        if (window.PalomaCart && window.PalomaCart.add) {
          window.PalomaCart.add({
            id: it.id,
            name: it.title,
            price: Number(it.price) || 0,
            image: itemImg(it),
            category: "coffee",
            qty: 1,
          });
        }
        $("#cfModalAdded").classList.add("is-on");
      });
    }

    /* ── ЭТАПЫ — горизонтальная прокрутка скроллом ── */
    (function () {
      var sec = document.getElementById("cf-steps");
      var track = document.getElementById("cfStepsTrack");
      var bar = document.getElementById("cfStepsBar");
      if (!sec || !track) return;
      function update() {
        var rect = sec.getBoundingClientRect();
        var dist = sec.offsetHeight - window.innerHeight;
        if (dist <= 0) return;
        var p = Math.min(1, Math.max(0, -rect.top / dist));
        var max = track.scrollWidth - window.innerWidth;
        if (max < 0) max = 0;
        track.style.transform = "translateX(-" + (p * max).toFixed(2) + "px)";
        if (bar) bar.style.width = (p * 100).toFixed(1) + "%";
      }
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      update();
    })();
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
})();
