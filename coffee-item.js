/* ═══════════════════════════════════════════════════════════════════
   PALOMA Coffee — страница напитка (coffee-item.html?id=...)
   Рендерит позицию меню в layout страницы товара (.pdp), как в каталоге.
   Данные: window.PALOMA_COFFEE_MENU (coffee-menu-data.js)
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();

  var catLabels = {
    classic: "Классика",
    cacaoraf: "Какао и раф",
    smoothie: "Смузи",
    milkshake: "Молочный коктейль",
    tea: "Чай",
    cold: "Холодные напитки",
  };
  var imgByCat = {
    classic: "images/paloma/coffee/cup-classic.jpg",
    cacaoraf: "images/paloma/coffee/cup-raf.jpg",
    smoothie: "images/paloma/coffee/cup-smoothie.jpg",
    milkshake: "images/paloma/coffee/cup-milkshake.jpg",
    tea: "images/paloma/coffee/cup-tea.jpg",
    cold: "images/paloma/coffee/cup-cold.jpg",
  };

  function init() {
    var MENU = window.PALOMA_COFFEE_MENU || [];
    var id = new URLSearchParams(location.search).get("id");
    var item = MENU.filter(function (i) { return i.id === id; })[0];

    var main = document.getElementById("pdpMain");
    var notFound = document.getElementById("ciNotFound");
    if (!item) {
      if (notFound) notFound.hidden = false;
      var layout = document.getElementById("ciLayout");
      if (layout) layout.hidden = true;
      return;
    }

    document.title = item.title + " — PALOMA Coffee";

    /* ── объёмы и цены → размеры ── */
    var vols = parseList(item.volumes);            // ["250","350","450"]
    var prices = parseList(item.priceLabel)        // ["220","270","300"]
      .map(function (s) { return parseInt(s.replace(/\D/g, ""), 10); })
      .filter(function (n) { return !isNaN(n); });
    if (!prices.length) prices = [Number(item.price) || 0];

    var sizes = [];
    var n = Math.min(vols.length, prices.length) || prices.length;
    for (var i = 0; i < prices.length; i++) {
      sizes.push({
        vol: vols[i] ? vols[i] + " мл" : (item.volumes || ""),
        price: prices[i],
      });
    }
    var current = sizes[0];
    var qty = 1;

    /* ── заполнение ── */
    var img = item.image || imgByCat[item.category] || "";
    var ph = document.getElementById("pdpMainPh");
    var mainImg = document.getElementById("pdpMainImg");
    if (img) {
      mainImg.src = img;
      mainImg.alt = item.title;
      mainImg.style.display = "";
      if (ph) ph.style.background = item.imageBg || "";
    } else {
      if (mainImg) mainImg.style.display = "none";
      if (ph) ph.style.background = item.imageBg || "";
    }

    setText("pdpCat", catLabels[item.category] || "Меню");
    setText("ciCrumbCat", catLabels[item.category] || "Меню");
    setText("pdpName", item.title);
    setText("pdpDesc", item.desc || "");

    var volRow = document.getElementById("pdpVolRow");
    if (item.volumes) { setText("pdpVol", item.volumes + " мл"); }
    else if (volRow) volRow.hidden = true;

    /* ── размеры (если их несколько) ── */
    var sizesWrap = document.getElementById("pdpSizes");
    var sizeBtns = document.getElementById("pdpSizeBtns");
    if (sizes.length > 1 && sizesWrap && sizeBtns) {
      sizesWrap.hidden = false;
      sizes.forEach(function (s, idx) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "pdp-sizes__btn" + (idx === 0 ? " is-active" : "");
        b.textContent = s.vol;
        b.setAttribute("data-cursor", "hover");
        b.addEventListener("click", function () {
          current = s;
          [].forEach.call(sizeBtns.children, function (x) {
            x.classList.toggle("is-active", x === b);
          });
          updatePrice();
        });
        sizeBtns.appendChild(b);
      });
    }

    function updatePrice() {
      setText("pdpPrice", (current.price).toLocaleString("ru-RU") + " ₽");
    }
    updatePrice();

    /* ── количество ── */
    var qtyVal = document.getElementById("pdpQtyVal");
    document.getElementById("pdpQtyDec").addEventListener("click", function () {
      if (qty > 1) { qty--; qtyVal.textContent = qty; }
    });
    document.getElementById("pdpQtyInc").addEventListener("click", function () {
      if (qty < 99) { qty++; qtyVal.textContent = qty; }
    });

    /* ── в корзину ── */
    var toast = document.getElementById("pdpToast");
    document.getElementById("pdpAddToCart").addEventListener("click", function () {
      if (window.PalomaCart && window.PalomaCart.add) {
        window.PalomaCart.add({
          id: item.id + "-" + (current.vol || "").replace(/\s/g, ""),
          name: item.title + (current.vol ? " · " + current.vol : ""),
          price: Number(current.price) || 0,
          qty: qty,
          category: "coffee",
          bg: img ? "url(" + img + ") center/cover" : item.imageBg || "",
        });
      }
      if (toast) {
        toast.hidden = false;
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { toast.hidden = true; }, 1800);
      }
    });

    window.palomaRebindCursorHovers && window.palomaRebindCursorHovers();
  }

  function parseList(s) {
    if (!s) return [];
    return String(s)
      .replace(/мл|₽/gi, "")
      .split("/")
      .map(function (x) { return x.trim(); })
      .filter(Boolean);
  }
  function setText(id, t) {
    var el = document.getElementById(id);
    if (el) el.textContent = t;
  }
})();
