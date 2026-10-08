/* ════════════════════════════════════════════════════════
   rent.js — аренда декора: каталог, даты, смета, заявка.

   Цена позиции = цена суток × (1 + (дней − 1) × extraDayFactor) × штук.
   Смета хранится в браузере (localStorage), заявка уходит менеджеру
   через palomaSendLead (lead-send.js) — как остальные заявки сайта.
   ════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  const D = window.PALOMA_RENT;
  if (!D) return;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
  const byId = (id) => D.items.find((i) => i.id === id);
  const KEY = "paloma_rent_v1";
  /* Аренда ещё не открыта: посетитель видит вещи «под замком» — силуэты,
     как неоткрытые персонажи в игре. Владелец с ключом видит всё. */
  const LOCKED = document.documentElement.classList.contains("rn-locked");
  const LOCK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.3"/></svg>';

  const state = { cat: "all", q: "", budget: "all", sort: "popular", from: "", to: "", delivery: "pickup", cart: {} };
  try { Object.assign(state, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { /* пусто */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ from: state.from, to: state.to, delivery: state.delivery, cart: state.cart })); } catch (e) { /* приватный режим */ } };

  /* ── даты и цена ── */
  const iso = (d) => d.toISOString().slice(0, 10);
  const today = iso(new Date());
  function days() {
    if (!state.from || !state.to) return 1;
    const n = Math.round((new Date(state.to) - new Date(state.from)) / 86400000);
    return Math.max(1, n);
  }
  const factor = () => 1 + (days() - 1) * (D.extraDayFactor || 1);
  const linePrice = (it, qty) => (it.price || 0) * factor() * qty;
  const ruDate = (s) => (s ? s.split("-").reverse().join(".") : "");
  const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return n + " " + (m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c); };

  /* ── заглушка вместо фото: линия-иконка категории ── */
  const ICON = {
    furniture: '<ellipse cx="32" cy="26" rx="20" ry="7"/><path d="M12 26v14c0 4 9 7 20 7s20-3 20-7V26"/><path d="M18 46l-2 8M46 46l2 8"/>',
    light: '<circle cx="32" cy="26" r="14"/><path d="M32 40v14M24 56h16"/><path d="M26 22a8 8 0 0 1 8-6"/>',
    vases: '<path d="M26 10h12M27 10c0 8-9 12-9 26 0 10 6 16 14 16s14-6 14-16c0-14-9-18-9-26"/><path d="M22 36h20"/>',
    arches: '<path d="M14 56V30a18 18 0 0 1 36 0v26"/><path d="M20 56V31a12 12 0 0 1 24 0v25"/><path d="M10 56h44"/>',
    textile: '<path d="M10 14h44v8c-8 0-8 6-14 6s-8-6-15-6-7 6-15 6z"/><path d="M14 28v26M50 28v26M14 54c6-4 30-4 36 0"/>',
    table: '<circle cx="32" cy="32" r="20"/><circle cx="32" cy="32" r="12"/><path d="M6 20v24M58 20v24"/>',
  };
  function media(it, big) {
    if (it.photos && it.photos.length) return '<img src="' + esc(it.photos[0]) + '" alt="' + esc(it.name) + '" loading="lazy" decoding="async">';
    return '<span class="rn-ph' + (big ? " rn-ph--big" : "") + '"><svg viewBox="0 0 64 64" aria-hidden="true">' + (ICON[it.cat] || ICON.vases) + "</svg><em>фото скоро</em></span>";
  }

  /* ── каталог ── */
  function visible() {
    const q = state.q.trim().toLowerCase();
    const [bMin, bMax] = state.budget === "all" ? [0, 0] : state.budget.split("-").map(Number);
    let list = D.items.filter((i) => (state.cat === "all" || i.cat === state.cat) &&
      (state.budget === "all" || ((!bMin || i.price >= bMin) && (!bMax || i.price < bMax))) &&
      (!q || (i.name + " " + i.color + " " + i.material).toLowerCase().indexOf(q) >= 0));
    if (state.sort === "cheap") list = list.slice().sort((a, b) => a.price - b.price);
    else if (state.sort === "expensive") list = list.slice().sort((a, b) => b.price - a.price);
    else list = list.slice().sort((a, b) => (b.hit ? 1 : 0) - (a.hit ? 1 : 0));
    return list;
  }
  function priceLabel(it) {
    if (!it.price) return "по запросу";
    return state.from && state.to && days() > 1 ? fmt(it.price * factor()) + " за " + plural(days(), "сутки", "суток", "суток") : fmt(it.price) + " / сутки";
  }
  function stepper(it) {
    const n = state.cart[it.id] || 0;
    if (!n) return '<button type="button" class="btn btn--dark rn-add" data-add="' + it.id + '">В смету</button>';
    return '<div class="rn-step" role="group" aria-label="Количество"><button type="button" data-dec="' + it.id + '" aria-label="Меньше">−</button>' +
      "<span>" + n + " шт</span>" + '<button type="button" data-inc="' + it.id + '" aria-label="Больше"' + (n >= it.qty ? " disabled" : "") + ">+</button></div>";
  }
  function renderCats() {
    const count = (c) => D.items.filter((i) => c === "all" || i.cat === c).length;
    $("#rnCats").innerHTML = [{ id: "all", name: "Все" }].concat(D.categories).map((c) =>
      '<button type="button" class="catalog-filter-btn' + (state.cat === c.id ? " is-active" : "") + '" data-cat="' + c.id + '" aria-pressed="' + (state.cat === c.id) + '">' +
      esc(c.name) + '<sup class="rn-count">' + count(c.id) + "</sup></button>").join("");
  }
  function cardMedia(it) {
    if (it.photos && it.photos.length) {
      return '<img class="product-card__img product-card__img--main" src="' + esc(it.photos[0]) + '" alt="' + esc(it.name) + '" loading="lazy">' +
        (it.photos[1] ? '<img class="product-card__img product-card__img--hover" src="' + esc(it.photos[1]) + '" alt="" loading="lazy" aria-hidden="true">' : "");
    }
    return '<div class="product-card__ph rn-card-ph" aria-hidden="true"><svg viewBox="0 0 64 64">' + (ICON[it.cat] || ICON.vases) + "</svg><em>фото скоро</em></div>";
  }
  function lockedCard(it, n) {
    const cat = (D.categories.find((c) => c.id === it.cat) || {}).name || "Декор";
    return '<article class="product-card is-visible is-revealed rn-lock-card" style="--i:' + n + '">' +
      '<div class="product-card__media">' +
        '<div class="product-card__ph rn-card-ph rn-silhouette" aria-hidden="true"><svg viewBox="0 0 64 64">' + (ICON[it.cat] || ICON.vases) + "</svg></div>" +
        '<span class="rn-lock">' + LOCK_SVG + "</span>" +
        '<span class="product-card__badge rn-soon">Скоро</span>' +
        '<span class="rn-num">№ ' + String(n + 1).padStart(2, "0") + "</span>" +
      "</div>" +
      '<div class="product-card__body">' +
        '<h3 class="product-card__name rn-hide" aria-hidden="true">' + esc(it.name) + "</h3>" +
        '<p class="product-card__desc">' + esc(cat) + " · откроется скоро</p>" +
        '<p class="product-card__price rn-hide" aria-hidden="true">' + (it.price ? fmt(it.price) : "000 ₽") + " / сутки</p>" +
        '<div class="product-card__btns"><button type="button" class="product-card__btn product-card__btn--cart rn-locked-btn" disabled>' + LOCK_SVG + "Скоро</button></div>" +
      "</div></article>";
  }
  function renderGrid() {
    const list = visible();
    if (LOCKED) {
      $("#rnGrid").innerHTML = list.map(lockedCard).join("");
      $("#rnFound").textContent = plural(list.length, "позиция", "позиции", "позиций") + " · скоро в аренде";
      $("#rnEmpty").hidden = list.length > 0;
      $("#rnGrid").hidden = !list.length;
      return;
    }
    $("#rnGrid").innerHTML = list.length ? list.map((it) =>
      '<article class="product-card is-visible is-revealed" data-id="' + it.id + '">' +
        '<div class="product-card__media">' + cardMedia(it) +
          '<button type="button" class="product-card__media-link rn-open" data-open="' + it.id + '" aria-label="Подробнее: ' + esc(it.name) + '"></button>' +
          (it.hit ? '<span class="product-card__badge">Часто берут</span>' : "") +
        "</div>" +
        '<div class="product-card__body">' +
          '<button type="button" class="product-card__name-link rn-open" data-open="' + it.id + '"><h3 class="product-card__name">' + esc(it.name) + "</h3></button>" +
          '<p class="product-card__desc">' + esc(it.size || "") + (it.size ? " · " : "") + "в наличии " + it.qty + " шт</p>" +
          '<p class="product-card__price">' + priceLabel(it) + "</p>" +
          '<div class="product-card__btns">' +
            '<button type="button" class="product-card__btn product-card__btn--detail" data-open="' + it.id + '">Подробнее</button>' +
            cardAction(it) +
          "</div>" +
        "</div></article>").join("")
      : "";
    $("#rnFound").textContent = plural(list.length, "позиция", "позиции", "позиций");
    $("#rnEmpty").hidden = list.length > 0;
    $("#rnGrid").hidden = !list.length;
  }
  /* «В смету» → счётчик «− 2 шт +» на месте кнопки */
  function cardAction(it) {
    return '<button type="button" class="product-card__btn product-card__btn--cart" data-add="' + it.id + '">В смету</button>';
  }

  /* ── смета ── */
  function cartLines() {
    return Object.keys(state.cart).map((id) => ({ it: byId(id), qty: state.cart[id] })).filter((l) => l.it && l.qty > 0);
  }
  function totals() {
    const lines = cartLines();
    const rent = lines.reduce((s, l) => s + linePrice(l.it, l.qty), 0);
    const deposit = lines.reduce((s, l) => s + (l.it.deposit || 0) * l.qty, 0);
    const del = (D.delivery.find((d) => d.id === state.delivery) || D.delivery[0]);
    return { lines, rent, deposit, del, total: rent + (lines.length ? del.price : 0) };
  }
  function renderBar() {
    const t = totals(), n = t.lines.reduce((s, l) => s + l.qty, 0);
    const bar = $("#rnBar");
    bar.hidden = !n || LOCKED;
    if (n) $("#rnBarText").innerHTML = "<b>" + plural(n, "вещь", "вещи", "вещей") + "</b> · " + fmt(t.total);
  }
  function renderCart() {
    const t = totals();
    $("#rnDays").textContent = state.from && state.to ? plural(days(), "сутки", "суток", "суток") + "." : "Выберите даты — пока считаем за 1 сутки.";
    $("#rnLines").innerHTML = t.lines.length ? t.lines.map((l) =>
      '<li class="rn-line"><div class="rn-line__media">' + media(l.it) + '</div><div class="rn-line__info"><b>' + esc(l.it.name) + "</b><span>" +
      (l.it.price ? fmt(l.it.price) + " / сутки" : "цена по запросу") + "</span>" + stepper(l.it) + '</div><div class="rn-line__sum">' + (l.it.price ? fmt(linePrice(l.it, l.qty)) : "—") +
      '<button type="button" class="rn-line__del" data-del="' + l.it.id + '" aria-label="Убрать">Убрать</button></div></li>').join("")
      : '<li class="rn-empty">Смета пуста — добавьте вещи из каталога.</li>';
    $("#rnDelivery").innerHTML = D.delivery.map((d) =>
      '<label class="rn-radio"><input type="radio" name="rnDel" value="' + d.id + '"' + (state.delivery === d.id ? " checked" : "") + "><span><b>" + esc(d.name) + "</b><em>" + esc(d.note) + "</em></span><i>" + (d.price ? fmt(d.price) : "бесплатно") + "</i></label>").join("");
    $("#rnSumRent").textContent = fmt(t.rent);
    $("#rnSumDel").textContent = t.lines.length && t.del.price ? fmt(t.del.price) : "0 ₽";
    $("#rnSumTotal").textContent = fmt(t.total);
    $("#rnSumDeposit").textContent = fmt(t.deposit);
    const short = D.minOrder && t.lines.length && t.rent < D.minOrder;
    $("#rnMin").hidden = !short;
    if (short) $("#rnMin").textContent = "Минимальный заказ аренды — " + fmt(D.minOrder) + ". Добавьте ещё вещей или оставьте заявку — подскажем.";
    $("#rnSend").disabled = !t.lines.length;
  }
  function refresh() { renderCats(); renderGrid(); renderBar(); if ($("#rnCart").open) renderCart(); save(); }

  function setQty(id, n) {
    const it = byId(id);
    if (!it) return;
    n = Math.max(0, Math.min(it.qty, n));
    if (n) state.cart[id] = n; else delete state.cart[id];
    refresh();
    const qv = $("#rnItem");
    if (qv.open && qv.dataset.id === id) renderItem(id);
  }

  /* ── карточка вещи ── */
  function renderItem(id) {
    const it = byId(id), dlg = $("#rnItem");
    dlg.dataset.id = id;
    const ph = it.photos && it.photos.length ? it.photos : [null];
    $("#rnItemBody").innerHTML =
      '<div class="rn-item__media">' + (ph[0] ? '<img src="' + esc(ph[0]) + '" alt="' + esc(it.name) + '" id="rnItemImg">' : media(it, true)) +
        (ph.length > 1 ? '<div class="rn-item__thumbs">' + ph.map((p, i) => '<button type="button" data-ph="' + esc(p) + '"' + (i ? "" : ' class="is-on"') + '><img src="' + esc(p) + '" alt=""></button>').join("") + "</div>" : "") + "</div>" +
      '<div class="rn-item__info">' +
        '<p class="pdp-info__cat">' + esc((D.categories.find((c) => c.id === it.cat) || {}).name || "Аренда") + "</p>" +
        '<h2 class="pdp-info__name rn-item__name">' + esc(it.name) + "</h2>" +
        '<p class="rn-item__price">' + priceLabel(it) + "</p>" +
        (it.desc ? '<p class="rn-item__desc">' + esc(it.desc) + "</p>" : "") +
        '<dl class="rn-specs">' +
          (it.size ? "<div><dt>Размер</dt><dd>" + esc(it.size) + "</dd></div>" : "") +
          (it.material ? "<div><dt>Материал</dt><dd>" + esc(it.material) + "</dd></div>" : "") +
          (it.color ? "<div><dt>Цвет</dt><dd>" + esc(it.color) + "</dd></div>" : "") +
          "<div><dt>В наличии</dt><dd>" + it.qty + " шт</dd></div>" +
          (it.deposit ? "<div><dt>Залог</dt><dd>" + fmt(it.deposit) + " за шт, возвращаем</dd></div>" : "") +
        "</dl>" + stepper(it) +
      "</div>";
  }

  /* ── заявка ── */
  function details() {
    const t = totals(), L = [];
    L.push("Даты: " + (state.from && state.to ? ruDate(state.from) + " — " + ruDate(state.to) + " (" + plural(days(), "сутки", "суток", "суток") + ")" : "не выбраны"));
    L.push("", "Смета:");
    t.lines.forEach((l, i) => L.push((i + 1) + ". " + l.it.name + " × " + l.qty + " — " + (l.it.price ? fmt(linePrice(l.it, l.qty)) : "по запросу")));
    L.push("", "Получение: " + t.del.name + (t.del.price ? " — " + fmt(t.del.price) : ""));
    L.push("Аренда: " + fmt(t.rent), "Итого: " + fmt(t.total), "Залог (возвратный): " + fmt(t.deposit));
    return L.join("\n");
  }
  function bindForm() {
    const form = $("#rnForm"), phone = $("#rnPhone");
    phone.addEventListener("input", () => {
      let d = phone.value.replace(/\D/g, "");
      if (d.startsWith("8")) d = "7" + d.slice(1);
      if (d && !d.startsWith("7")) d = "7" + d;
      d = d.slice(0, 11);
      const p = d.slice(1);
      let out = d ? "+7" : "";
      if (p.length) out += " (" + p.slice(0, 3);
      if (p.length >= 3) out += ") " + p.slice(3, 6);
      if (p.length >= 6) out += "-" + p.slice(6, 8);
      if (p.length >= 8) out += "-" + p.slice(8, 10);
      phone.value = out;
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const err = $("#rnErr");
      if (phone.value.replace(/\D/g, "").length !== 11) { err.textContent = "Проверьте номер телефона — нужно 11 цифр"; phone.focus(); return; }
      if (!$("#rnAgree").checked) { err.textContent = "Нужно согласие на обработку данных"; return; }
      err.textContent = "";
      const btn = $("#rnSend");
      btn.disabled = true; btn.classList.add("is-busy");
      const payload = {
        page: "rent", name: $("#rnName").value.trim(), phone: phone.value,
        date: state.from && state.to ? ruDate(state.from) + " — " + ruDate(state.to) : "",
        details: details(), comment: [$("#rnVenue").value.trim() ? "Площадка/адрес: " + $("#rnVenue").value.trim() : "", $("#rnComment").value.trim()].filter(Boolean).join("\n"),
        source: "Аренда декора",
      };
      const send = window.palomaSendLead ? window.palomaSendLead(payload) : Promise.resolve({ ok: false });
      send.then((r) => {
        btn.disabled = false; btn.classList.remove("is-busy");
        $("#rnDoneId").textContent = r && r.orderId ? "№ " + r.orderId : "";
        form.hidden = true; $("#rnDone").hidden = false;
        state.cart = {}; refresh();
        if (typeof window.ym === "function") { try { window.ym(110912456, "reachGoal", "rent_request"); } catch (x) { /* ничего */ } }
      });
    });
  }

  /* ── события ── */
  function openDlg(d) { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); }
  function closeDlg(d) { if (d.close) d.close(); else d.removeAttribute("open"); }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button, [data-close]");
    if (!b) return;
    if (LOCKED && (b.dataset.add || b.dataset.open || b.id === "rnBarBtn" || b.id === "rnOpenCart")) return;
    if (b.dataset.cat) { state.cat = b.dataset.cat; refresh(); }
    else if (b.dataset.add && b.classList.contains("product-card__btn--cart")) {
      const it = byId(b.dataset.add), n = state.cart[b.dataset.add] || 0;
      if (it && n >= it.qty) { b.textContent = "Больше нет"; setTimeout(() => { b.textContent = "В смету"; }, 1400); return; }
      setQty(b.dataset.add, n + 1);
      const nb = document.querySelector('.product-card__btn--cart[data-add="' + b.dataset.add + '"]');
      if (nb) { nb.textContent = "✓"; nb.classList.add("is-added"); nb.disabled = true; setTimeout(() => { nb.textContent = "В смету"; nb.classList.remove("is-added"); nb.disabled = false; }, 1400); }
    }
    else if (b.dataset.add) setQty(b.dataset.add, 1);
    else if (b.dataset.budget) {
      state.budget = b.dataset.budget;
      $$("[data-budget]").forEach((x) => { const on = x === b; x.classList.toggle("is-active", on); x.setAttribute("aria-pressed", String(on)); });
      renderGrid();
    }
    else if (b.dataset.inc) setQty(b.dataset.inc, (state.cart[b.dataset.inc] || 0) + 1);
    else if (b.dataset.dec) setQty(b.dataset.dec, (state.cart[b.dataset.dec] || 0) - 1);
    else if (b.dataset.del) setQty(b.dataset.del, 0);
    else if (b.dataset.open) { renderItem(b.dataset.open); openDlg($("#rnItem")); }
    else if (b.dataset.ph) { const im = $("#rnItemImg"); if (im) im.src = b.dataset.ph; $$("[data-ph]").forEach((x) => x.classList.toggle("is-on", x === b)); }
    else if (b.id === "rnBarBtn" || b.id === "rnOpenCart") { renderCart(); $("#rnForm").hidden = false; $("#rnDone").hidden = true; openDlg($("#rnCart")); }
    else if (b.hasAttribute("data-close")) closeDlg(b.closest("dialog"));
  });
  $$("dialog.rn-dlg").forEach((d) => d.addEventListener("click", (e) => { if (e.target === d) closeDlg(d); }));
  document.addEventListener("change", (e) => {
    if (e.target.name === "rnDel") { state.delivery = e.target.value; renderCart(); renderBar(); save(); }
  });
  const sortList = $("#rnSortList"), sortTrig = $("#rnSortTrigger");
  const openSort = (open) => { sortList.hidden = !open; sortTrig.setAttribute("aria-expanded", String(open)); sortTrig.classList.toggle("is-open", open); };
  sortTrig.addEventListener("click", () => openSort(sortList.hidden));
  sortList.addEventListener("click", (e) => {
    const o = e.target.closest("[data-sort]");
    if (!o) return;
    state.sort = o.dataset.sort;
    $$("[data-sort]", sortList).forEach((x) => { const on = x === o; x.classList.toggle("is-selected", on); x.setAttribute("aria-selected", String(on)); });
    $("#rnSortValue").textContent = o.textContent;
    openSort(false);
    renderGrid();
  });
  document.addEventListener("click", (e) => { if (!sortList.hidden && !e.target.closest("#rnSortBox")) openSort(false); });
  const from = $("#rnFrom"), to = $("#rnTo");
  from.min = today; to.min = today;
  if (state.from < today) state.from = "";
  if (state.to < today) state.to = "";
  from.value = state.from; to.value = state.to;
  from.addEventListener("change", () => {
    state.from = from.value;
    to.min = from.value || today;
    if (state.to && state.to <= state.from) { const d = new Date(state.from); d.setDate(d.getDate() + 1); state.to = iso(d); to.value = state.to; }
    refresh(); updateDaysNote(); renderCart();
  });
  to.addEventListener("change", () => { state.to = to.value; refresh(); updateDaysNote(); renderCart(); });
  function updateDaysNote() {
    $("#rnDaysNote").textContent = "Со вторых суток — " + Math.round((D.extraDayFactor || 1) * 100) + "% цены.";
  }

  updateDaysNote();
  bindForm();
  refresh();
})();
