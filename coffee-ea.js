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
    var active = null;

    /* скрипт-надписи категорий (как эйбрау «our menu») */
    var catEyebrow = {
      classic: "coffee classics",
      cacaoraf: "cocoa & raf",
      smoothie: "smoothie bar",
      milkshake: "shakes & cocktails",
      tea: "tea ceremony",
      cold: "cold & fresh",
    };
    /* порядок категорий — как встречаются в данных */
    var catOrder = MENU.map(function (i) { return i.category; })
      .filter(function (v, i, a) { return a.indexOf(v) === i; });

    /* разбор объёмов/цен: «250 / 350 / 450 мл» + «220 / 270 / 300 ₽» → размеры */
    function parseSizes(it) {
      var vols = String(it.volumes || "").split("/").map(function (s) { return s.trim(); }).filter(Boolean);
      var prices = String(it.priceLabel || "").split("/").map(function (s) { return s.trim(); }).filter(Boolean);
      var nums = prices.map(function (s) { return parseInt(String(s).replace(/[^0-9]/g, ""), 10) || 0; });
      if (nums.length > 1 && (vols.length === nums.length || vols.length === 0)) {
        var unit = (String(it.volumes || "").match(/[^\d\s/]+\s*$/) || [""])[0].trim();
        return nums.map(function (pr, i) {
          var v = vols[i] || "";
          if (v && /^\d+$/.test(v) && unit) v = v + " " + unit;
          return { label: v, price: pr, priceText: pr.toLocaleString("ru-RU") + " ₽", suffix: "-" + (i + 1) };
        });
      }
      var base = Number(it.price) || nums[0] || 0;
      return [{ label: vols[0] || "", price: base, priceText: it.priceLabel || base + " ₽", suffix: "" }];
    }
    /* компактная цена строки: «150–180 ₽» для мультиразмерных, иначе как есть */
    function priceRange(sizes, it) {
      if (sizes.length > 1) {
        var lo = sizes[0].price, hi = sizes[sizes.length - 1].price;
        return lo.toLocaleString("ru-RU") + "–" + hi.toLocaleString("ru-RU") + " ₽";
      }
      return it.priceLabel || sizes[0].price + " ₽";
    }

    function plural(n) {
      var m10 = n % 10, m100 = n % 100;
      if (m10 === 1 && m100 !== 11) return n + " позиция";
      if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return n + " позиции";
      return n + " позиций";
    }

    var rowIO = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-in"); rowIO.unobserve(e.target); }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -30px 0px" }
    );

    function setActiveChip(c) {
      if (!filtersBox) return;
      [].forEach.call(filtersBox.children, function (x) {
        var on = x.getAttribute("data-cat") === c;
        x.classList.toggle("is-active", on);
        x.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    if (filtersBox && grid && MENU.length) {
      catOrder.forEach(function (c) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "catalog-filter-btn";
        b.setAttribute("data-cat", c);
        b.setAttribute("aria-pressed", "false");
        b.setAttribute("data-cursor", "hover");
        b.textContent = catLabels[c] || c;
        b.addEventListener("click", function () {
          if (active === c) return;
          active = c;
          setActiveChip(c);
          render();
        });
        filtersBox.appendChild(b);
      });
      active = catOrder[0];
      setActiveChip(active);
      render();
    }

    function render() {
      if (!grid) return;
      grid.innerHTML = "";
      var cats = active ? [active] : catOrder;
      var total = 0;
      var frag = document.createDocumentFragment();
      cats.forEach(function (cat) {
        var items = MENU.filter(function (it) { return it.category === cat; });
        if (!items.length) return;
        total += items.length;
        var block = document.createElement("div");
        block.className = "cfm-cat";
        block.setAttribute("data-cat", cat);
        /* заголовок категории убран — раздел уже выбран фильтром сверху */
        var head = "";
        var rows = items.map(function (it, i) {
          var sizes = parseSizes(it);
          return (
            '<div class="cfm-row" data-id="' + esc(it.id) + '"' +
              ' style="transition-delay:' + Math.min(i * 45, 320) + 'ms">' +
              '<span class="cfm-name">' + esc(it.title) + "</span>" +
              '<span class="cfm-vol">' + esc(it.volumes || "") + "</span>" +
              '<span class="cfm-price">' + esc(priceRange(sizes, it)) + "</span>" +
              '<button type="button" class="cfm-add" data-cursor="hover"' +
                ' aria-label="Добавить в корзину: ' + esc(it.title) + '"></button>' +
            "</div>"
          );
        }).join("");
        block.innerHTML = head + rows;
        var rowEls = block.querySelectorAll(".cfm-row");
        items.forEach(function (it, idx) {
          if (rowEls[idx]) { rowEls[idx]._item = it; rowEls[idx]._sizes = parseSizes(it); }
        });
        frag.appendChild(block);
      });
      grid.appendChild(frag);
      if (countBox) countBox.textContent = plural(total);
      revealRows();
      window.palomaRebindCursorHovers && window.palomaRebindCursorHovers();
    }

    function revealRows() {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      grid.querySelectorAll(".cfm-cat, .cfm-row").forEach(function (el) {
        if (reduce) el.classList.add("is-in");
        else rowIO.observe(el);
      });
    }

    function addToCart(it, size, btn) {
      if (window.PalomaCart && window.PalomaCart.add) {
        /* фото в корзине для позиций кофейни пока не ставим — нейтральный фон */
        window.PalomaCart.add({
          id: it.id + (size.suffix || ""),
          name: it.title + (size.label ? " · " + size.label : ""),
          price: Number(size.price) || 0,
          qty: 1,
          category: "coffee",
        });
      }
      if (btn) {
        btn.classList.add("is-done");
        setTimeout(function () { btn.classList.remove("is-done"); }, 1100);
      }
    }

    function toggleTray(row, it, sizes) {
      var next = row.nextElementSibling;
      if (next && next.classList.contains("cfm-tray")) {
        next.classList.remove("open");
        setTimeout(function () { if (next.parentNode) next.remove(); }, 340);
        return;
      }
      var tray = document.createElement("div");
      tray.className = "cfm-tray";
      tray.innerHTML = sizes.map(function (s) {
        return '<button type="button" class="cfm-chip" data-cursor="hover">' +
          "<b>" + esc(s.label) + "</b><span>" + esc(s.priceText) + "</span></button>";
      }).join("");
      row.after(tray);
      Array.prototype.forEach.call(tray.querySelectorAll(".cfm-chip"), function (chip, i) {
        chip.addEventListener("click", function (e) {
          e.stopPropagation();
          addToCart(it, sizes[i], row.querySelector(".cfm-add"));
          tray.classList.remove("open");
          setTimeout(function () { if (tray.parentNode) tray.remove(); }, 340);
        });
      });
      requestAnimationFrame(function () { tray.classList.add("open"); });
      window.palomaRebindCursorHovers && window.palomaRebindCursorHovers();
    }

    if (grid) {
      grid.addEventListener("click", function (e) {
        var row = e.target.closest(".cfm-row");
        if (!row || !row._item) return;
        var it = row._item;
        var sizes = row._sizes || parseSizes(it);
        if (sizes.length > 1) { toggleTray(row, it, sizes); return; }
        addToCart(it, sizes[0], row.querySelector(".cfm-add"));
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
