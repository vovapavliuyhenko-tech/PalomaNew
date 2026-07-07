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

      /* кнопки-«переходы» на конкретную категорию меню (напр. «Выбрать напиток»
         из блока лимонадов → сразу «Холодные») */
      [].forEach.call(document.querySelectorAll("[data-cat-jump]"), function (link) {
        link.addEventListener("click", function (e) {
          var cat = link.getAttribute("data-cat-jump");
          if (catOrder.indexOf(cat) === -1) return; /* нет такой категории — обычный переход */
          e.preventDefault();
          if (active !== cat) { active = cat; setActiveChip(cat); render(); }
          var menu = document.getElementById("cf-menu");
          if (menu) {
            var y = menu.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top: y < 0 ? 0 : y, behavior: "smooth" });
          }
        });
      });
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
              '<span class="cfm-name">' + esc(it.title) +
                (cat === "cold" ? ' <span class="cfm-new">новинка</span>' : "") + "</span>" +
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
      /* На телефоне блок этапов — вертикальный стек (CSS ≤900px), горизонтальную
         прокрутку не запускаем, иначе трек уезжает и ломает раскладку. */
      if (window.matchMedia("(max-width: 900px)").matches) return;
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

    /* ── FILM STRIP — 3D-изогнутая лента карточек, скользит через центр ── */
    (function () {
      var strip = document.getElementById("cf-strip");
      var stage = document.getElementById("cfStripStage");
      var band = document.getElementById("cfStripBand");
      if (!strip || !stage || !band) return;
      var cards = [].slice.call(band.querySelectorAll(".cf-strip__card"));
      var N = cards.length;
      if (!N) return;
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      var pos = 0;        /* текущий «центр» (дробный индекс) */
      var target = 0;     /* к чему стремимся (drag/wheel) */
      var vel = 0;        /* инерция */
      var dragging = false, lastX = 0, moved = 0, cardW = 300;

      function measure() {
        cardW = cards[0].getBoundingClientRect().width || 300;
      }
      function wrap(d) {
        d = ((d % N) + N) % N;
        if (d > N / 2) d -= N;
        return d;
      }
      /* Карточки лежат на цилиндре: ровный ряд с небольшим зазором, мягкий
         изгиб к краям (как в референсе), без наложения друг на друга. */
      var STEP_DEG = 15;               /* угол между соседними карточками */
      function layout() {
        var radius = cardW * 3.7;      /* радиус → шаг по дуге ≈ ширина + зазор */
        var stepRad = STEP_DEG * Math.PI / 180;
        for (var i = 0; i < N; i++) {
          var d = wrap(i - pos);
          var ad = Math.abs(d);
          var th = d * stepRad;
          var x = radius * Math.sin(th);
          var z = radius * Math.cos(th) - radius;   /* центр в 0, края уходят вглубь */
          var ry = -d * STEP_DEG;
          var c = cards[i];
          c.style.transform =
            "translate(-50%,-50%) translateX(" + x.toFixed(1) + "px) translateZ(" +
            z.toFixed(1) + "px) rotateY(" + ry.toFixed(1) + "deg)";
          c.style.zIndex = String(1000 - Math.round(ad * 10));
          c.style.opacity = ad > N / 2 - 0.55 ? "0" : (ad > 3.4 ? "0.4" : "1");
        }
      }
      function frame() {
        if (!dragging) {
          if (Math.abs(vel) > 0.0002) { target += vel; vel *= 0.92; }
          else { target += reduce ? 0 : 0.0035; }   /* авто-скольжение */
        }
        pos += (target - pos) * 0.12;                /* плавное догоняние */
        layout();
        requestAnimationFrame(frame);
      }

      /* drag / swipe */
      stage.addEventListener("pointerdown", function (e) {
        dragging = true; lastX = e.clientX; moved = 0; vel = 0;
        stage.classList.add("is-drag");
        stage.setPointerCapture && stage.setPointerCapture(e.pointerId);
      });
      stage.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        var dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
        var d = dx / (cardW * 0.97);
        target -= d; pos -= d; vel = -d * 0.6;
      });
      function endDrag(e) {
        if (!dragging) return;
        dragging = false; stage.classList.remove("is-drag");
        if (e && e.pointerId != null && stage.releasePointerCapture)
          try { stage.releasePointerCapture(e.pointerId); } catch (x) {}
      }
      stage.addEventListener("pointerup", endDrag);
      stage.addEventListener("pointercancel", endDrag);
      stage.addEventListener("pointerleave", endDrag);
      /* колесо — горизонтальный скролл ленты */
      stage.addEventListener("wheel", function (e) {
        var d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY);
        if (!d) return;
        e.preventDefault();
        target += d / 260; vel = d / 2600;
      }, { passive: false });
      /* клавиатура */
      stage.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { target += 1; vel = 0; }
        else if (e.key === "ArrowLeft") { target -= 1; vel = 0; }
      });

      window.addEventListener("resize", measure);
      measure();
      strip.classList.add("is-ready");
      requestAnimationFrame(frame);
    })();

    /* ── FAQ-аккордеон (как на главной и «Оформлении») ── */
    (function () {
      var items = [].slice.call(document.querySelectorAll(".ea-faq__item"));
      if (!items.length) return;
      items.forEach(function (item) {
        var q = item.querySelector(".ea-faq__q");
        var a = item.querySelector(".ea-faq__a");
        if (!q || !a) return;
        q.addEventListener("click", function () {
          var open = item.classList.contains("is-open");
          items.forEach(function (i) {
            i.classList.remove("is-open");
            var ia = i.querySelector(".ea-faq__a");
            if (ia) ia.style.maxHeight = null;
          });
          if (!open) { item.classList.add("is-open"); a.style.maxHeight = a.scrollHeight + "px"; }
        });
      });
    })();
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
})();
