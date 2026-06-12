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

    /* ── МЕНЮ ── */
    var MENU = window.PALOMA_COFFEE_MENU || [];
    var imgByCat = {
      coffee: "images/paloma/coffee/hero.jpg",
      tea: "images/paloma/coffee/hero.jpg",
      bakery: "images/paloma/desserts/dessert-01.jpg",
      dessert: "images/paloma/desserts/dessert-02.jpg",
      lemonade: "images/paloma/events/hero-5.jpg",
    };
    var catLabels = {
      all: "Всё меню",
      coffee: "Кофе",
      tea: "Чай",
      bakery: "Выпечка",
      dessert: "Десерты",
      lemonade: "Лимонады",
    };
    function itemImg(it) {
      return it.image || imgByCat[it.category] || "";
    }

    var tabsBox = document.getElementById("cfMenuTabs");
    var listBox = document.getElementById("cfMenuList");
    var pop = document.getElementById("cfMenuPop");
    var active = "all";

    if (tabsBox && listBox && MENU.length) {
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
        b.className = "cf-menu__tab" + (c === "all" ? " is-on" : "");
        b.textContent = catLabels[c] || c;
        b.setAttribute("data-cursor", "hover");
        b.addEventListener("click", function () {
          active = c;
          [].forEach.call(tabsBox.children, function (x) {
            x.classList.toggle("is-on", x === b);
          });
          render();
        });
        tabsBox.appendChild(b);
      });
      render();
    }

    function render() {
      listBox.innerHTML = "";
      MENU.filter(function (it) {
        return active === "all" || it.category === active;
      }).forEach(function (it) {
        var row = document.createElement("article");
        row.className = "cf-menu__row";
        row.setAttribute("role", "button");
        row.tabIndex = 0;
        row.setAttribute("data-cursor", "hover");
        row.innerHTML =
          '<span class="cf-menu__num">' + esc(it.num || "") + "</span>" +
          '<span class="cf-menu__name">' + esc(it.title) + "</span>" +
          '<span class="cf-menu__vol">' + esc(it.volumes || "") + "</span>" +
          '<span class="cf-menu__price">' + esc(it.priceLabel || it.price + " ₽") + "</span>" +
          '<p class="cf-menu__desc">' + esc(it.desc || "") + "</p>";
        row.addEventListener("mouseenter", function () {
          showPop(it);
        });
        row.addEventListener("mousemove", movePop);
        row.addEventListener("mouseleave", hidePop);
        row.addEventListener("click", function () {
          openModal(it);
        });
        row.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openModal(it);
          }
        });
        listBox.appendChild(row);
      });
    }
    function showPop(it) {
      if (!pop) return;
      var img = itemImg(it);
      pop.style.background = "";
      if (img) pop.style.backgroundImage = 'url("' + img + '")';
      else if (it.imageBg) pop.style.background = it.imageBg;
      pop.classList.add("is-on");
    }
    function movePop(e) {
      if (!pop) return;
      pop.style.left = e.clientX + "px";
      pop.style.top = e.clientY + "px";
    }
    function hidePop() {
      if (pop) pop.classList.remove("is-on");
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
