/* ════════════════════════════════════════════════════════
   bouquet-create.js — конструктор «Соберите букет» (bouquet-create.html)

   Шаг 1 — выбор цветов (цвет, количество, поиск, готовые идеи).
   Шаг 2 — букет и открытка: перемешать, фон, зелень, двигать цветы,
           добавки (гипсофила, лаванда…), текст открытки.
   Шаг 3 — упаковка, лента, итог → «Оформить заказ» (в корзину и на
           оформление) или «Скачать картинку».

   Данные — bouquet-create-data.js, рисунки — flower-art.js.
   Состояние хранится в localStorage, чтобы букет не пропал при обновлении.
   ════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const D = window.PALOMA_CREATE_DATA;
  const A = window.PalomaArt;
  const root = document.getElementById("bcApp");
  if (!D || !A || !root) return;

  const KEY = "paloma_create_v1";
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const money = (n) => Number(n).toLocaleString("ru-RU") + " ₽";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const byId = (list, id) => list.find((x) => x.id === id);

  /* ── состояние ── */
  const fresh = () => ({
    step: 1, sel: {}, fillers: {}, green: "eucalyptus", bg: "white",
    wrap: "film-blush", ribbon: "pink", seed: 7, offsets: {},
    card: { to: "", from: "", text: "", font: "hand" },
  });
  let S = fresh();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && saved.sel) S = Object.assign(fresh(), saved, { card: Object.assign(fresh().card, saved.card || {}) });
  } catch (e) { /* приватный режим */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ок */ } };

  const stemCount = () => Object.values(S.sel).reduce((a, b) => a + b, 0);
  const fillerCount = () => Object.values(S.fillers).reduce((a, b) => a + b, 0);

  /* ── цена ── */
  function priceParts() {
    const lines = [];
    Object.keys(S.sel).forEach((k) => {
      const [fid, ci] = k.split("|"), fl = byId(D.flowers, fid), n = S.sel[k];
      if (!fl || !n) return;
      lines.push({ label: fl.name + " " + fl.colors[+ci][0].toLowerCase(), n, sum: fl.price * n });
    });
    Object.keys(S.fillers).forEach((id) => {
      const fi = byId(D.fillers, id), n = S.fillers[id];
      if (fi && n) lines.push({ label: fi.name, n, sum: fi.price * n });
    });
    const g = byId(D.greens, S.green);
    if (g && g.price) lines.push({ label: "Зелень: " + g.name.toLowerCase(), n: 0, sum: g.price });
    const w = byId(D.wraps, S.wrap);
    if (w && w.price) lines.push({ label: "Упаковка: " + w.name.toLowerCase(), n: 0, sum: w.price });
    if (S.card.text.trim() && D.cardPrice) lines.push({ label: "Открытка", n: 0, sum: D.cardPrice });
    return lines;
  }
  const total = () => priceParts().reduce((a, l) => a + l.sum, 0);

  /* ════════ СБОРКА БУКЕТА (SVG) ════════ */
  const W = 600, H = 720, CX = 300, CY = 290;
  function rnd(seed) { return A.rng(seed); }

  function stems() {
    const out = [];
    Object.keys(S.sel).forEach((k) => {
      const [fid, ci] = k.split("|"), fl = byId(D.flowers, fid);
      if (!fl) return;
      for (let i = 0; i < S.sel[k]; i++) out.push({ kind: fl.kind, spike: fl.spike, color: fl.colors[+ci][1], size: fl.size });
    });
    Object.keys(S.fillers).forEach((id) => {
      const fi = byId(D.fillers, id);
      if (!fi) return;
      for (let i = 0; i < S.fillers[id]; i++) out.push({ kind: fi.kind, spike: fi.spike, color: fi.color, size: fi.kind === "hydrangea" ? 50 : 30, filler: true });
    });
    return out;
  }

  function bgColors() {
    const b = byId(D.backdrops, S.bg) || D.backdrops[0];
    const m = String(b.css).match(/#[0-9a-f]{6}/gi) || ["#FFFFFF"];
    return [m[0], m[1] || m[0]];
  }

  /* opts: { wrap: true/false (показывать упаковку), interactive } */
  function compose(opts) {
    const R0 = rnd(S.seed * 9973 + 11);
    const all = stems();
    const heads = all.filter((s) => s.kind !== "spike" && s.kind !== "gyps");
    const spikes = all.filter((s) => s.kind === "spike");
    const clouds = all.filter((s) => s.kind === "gyps");
    const N = Math.max(heads.length, 1);
    const targetR = Math.max(128, Math.min(210, 104 + Math.sqrt(N) * 16));
    const c = targetR / Math.sqrt(N);
    const mean = heads.reduce((a, h) => a + h.size, 0) / N || 34;
    const k = Math.max(0.6, Math.min(1.75, c / (mean * 0.8))); /* головки чуть заходят друг на друга — букет плотный */
    const R = c * Math.sqrt(N);

    /* перемешиваем порядок головок (зерно «Перемешать») */
    const order = heads.map((h, i) => ({ h, i, r: R0() })).sort((a, b) => a.r - b.r);
    const pos = order.map((o, j) => {
      const a = j * 2.39996 + S.seed * 0.7, d = c * Math.sqrt(j + 0.5);
      return { h: o.h, key: "h" + j, x: CX + Math.cos(a) * d, y: CY + Math.sin(a) * d * 0.84, d };
    });
    const [b1, b2] = bgColors();
    const wrap = opts.wrap ? byId(D.wraps, S.wrap) : null;
    const ribbon = byId(D.ribbons, S.ribbon);
    const gx = CX, gy = Math.min(CY + R + 85, 610); /* точка, где сходятся стебли */

    /* рамка по самому букету: маленький букет показываем крупно */
    const pad = 150, vx = Math.max(0, CX - R - pad), vy = Math.max(0, CY - R - pad);
    const vw = Math.min(W, 2 * (CX - vx)), vh = Math.min(H, (opts.wrap ? gy + 110 : gy + 95) - vy);
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${opts.full ? "0 0 " + W + " " + H : vx.toFixed(0) + " " + vy.toFixed(0) + " " + vw.toFixed(0) + " " + vh.toFixed(0)}" class="bc-svg" role="img" aria-label="Ваш букет">`;
    s += `<defs>${A.defs()}<filter id="bcSh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#5a2a35" flood-opacity=".28"/></filter><linearGradient id="bcBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b1}"/><stop offset="1" stop-color="${b2}"/></linearGradient>`;
    if (wrap && wrap.color) {
      s += `<linearGradient id="bcWrapB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${A.light(wrap.color, 0.25)}"/><stop offset="1" stop-color="${A.dark(wrap.color, 0.08)}"/></linearGradient>`;
      s += `<linearGradient id="bcWrapF" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${A.dark(wrap.color, 0.1)}"/><stop offset=".5" stop-color="${A.light(wrap.color, 0.2)}"/><stop offset="1" stop-color="${A.dark(wrap.color, 0.14)}"/></linearGradient>`;
    }
    s += `</defs><rect x="-400" y="-400" width="${W + 800}" height="${H + 800}" fill="url(#bcBg)"/>`;

    /* упаковка — задний лист */
    if (wrap && wrap.color) {
      const tw = R * 1.35, ty = CY - R * 0.62;
      s += `<path d="M${gx},${gy + 40} L${CX - tw},${ty} Q${CX},${ty - R * 0.55} ${CX + tw},${ty} Z" fill="url(#bcWrapB)" stroke="${A.dark(wrap.color, 0.2)}" stroke-width="1" opacity=".96"/>`;
    }

    /* зелень — веером позади */
    if (S.green && S.green !== "none") {
      const n = 11 + Math.round(N / 3);
      for (let i = 0; i < n; i++) {
        const a = -78 + (156 / (n - 1)) * i + (R0() - 0.5) * 12;
        const len = R + 75 + R0() * 55;
        s += `<g transform="translate(${gx},${CY + R * 0.45}) rotate(${a.toFixed(1)})">${A.green(S.green, len, 11 + i * 7)}</g>`;
      }
    }

    /* колосья (дельфиниум, маттиола, лаванда…) — за головками */
    spikes.forEach((sp, i) => {
      const a = spikes.length === 1 ? (R0() - 0.5) * 30 : -55 + (110 / (spikes.length - 1)) * i + (R0() - 0.5) * 14;
      const rad = (a * Math.PI) / 180;
      const bx = CX + Math.sin(rad) * R * 0.25, by = CY + R * 0.2;
      s += `<g transform="translate(${bx.toFixed(1)},${by.toFixed(1)}) rotate(${a.toFixed(1)})">${A.spike(sp.spike || "delphinium", sp.color, R * 0.75 + 70, 5 + i)}</g>`;
    });

    /* стебли без упаковки — пучок к точке сборки */
    if (!wrap || !wrap.color) {
      let st = "";
      pos.forEach((p) => { st += `<path d="M${p.x.toFixed(1)},${p.y.toFixed(1)} L${(gx + (p.x - gx) * 0.08).toFixed(1)},${gy}" stroke="#6F9258" stroke-width="2.2"/>`; });
      for (let i = 0; i < Math.min(N, 14); i++) {
        const x = gx - 10 + (20 / 13) * i;
        st += `<path d="M${x.toFixed(1)},${gy} L${(x + (i - 7) * 1.2).toFixed(1)},${H - 20}" stroke="#6F9258" stroke-width="2.2"/>`;
      }
      s += `<g opacity=".95">${st}</g>`;
    }

    /* гипсофила — облачками по краю */
    clouds.forEach((cl, i) => {
      const a = (i * 2.39996 + 1.3) % (Math.PI * 2);
      const x = CX + Math.cos(a) * R * 0.92, y = CY + Math.sin(a) * R * 0.78;
      s += `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})">${A.gyps(cl.color, 34 * k + 10, 21 + i)}</g>`;
    });

    /* листья, выглядывающие между цветами */
    if (S.green && S.green !== "none") {
      const nl = Math.round(N * 0.9) + 4;
      for (let i = 0; i < nl; i++) {
        const a = R0() * Math.PI * 2, d = R * (0.35 + R0() * 0.7);
        const x = CX + Math.cos(a) * d, y = CY + Math.sin(a) * d * 0.84;
        const rot = (Math.atan2(y - (CY + R * 0.4), x - CX) * 180) / Math.PI + 90;
        s += `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)})">${A.green(S.green, 46 + R0() * 30, 77 + i)}</g>`;
      }
    }

    /* головки: дальние первыми, центр — сверху */
    pos.slice().sort((a, b) => b.d - a.d).forEach((p, j) => {
      const off = S.offsets[p.key] || [0, 0];
      const rr = p.h.size * k * (1 - (p.d / (R + 1)) * 0.12);
      const rot = (R0() - 0.5) * 50;
      s += `<g class="bc-head" filter="url(#bcSh)" data-k="${p.key}" transform="translate(${(p.x + off[0]).toFixed(1)},${(p.y + off[1]).toFixed(1)}) rotate(${rot.toFixed(1)})">` +
        A.head(p.h.kind, p.h.color, rr, 31 + j * 13) + "</g>";
    });

    /* упаковка — передние лепестки и лента */
    if (wrap && wrap.color) {
      const fw = R * 1.12, fy = CY + R * 0.42;
      s += `<path d="M${gx},${gy + 60} L${CX - fw},${fy} Q${CX - fw * 0.45},${fy + R * 0.28} ${CX + 12},${fy + R * 0.12} Z" fill="url(#bcWrapF)" stroke="${A.dark(wrap.color, 0.22)}" stroke-width="1"/>`;
      s += `<path d="M${gx},${gy + 60} L${CX + fw},${fy} Q${CX + fw * 0.45},${fy + R * 0.28} ${CX - 12},${fy + R * 0.12} Z" fill="url(#bcWrapF)" stroke="${A.dark(wrap.color, 0.22)}" stroke-width="1" opacity=".97"/>`;
    }
    if (ribbon && ribbon.color) {
      const ry = wrap && wrap.color ? gy - 6 : gy + 8, rc = ribbon.color, rd = A.dark(rc, 0.2);
      s += `<g transform="translate(${gx},${ry})">` +
        `<path d="M-6,0 C-40,-22 -44,14 -6,4Z" fill="${rc}" stroke="${rd}"/><path d="M6,0 C40,-22 44,14 6,4Z" fill="${rc}" stroke="${rd}"/>` +
        `<path d="M-3,4 L-18,58 L-8,54 L2,6Z" fill="${rc}" stroke="${rd}"/><path d="M3,4 L20,62 L10,58 L-1,6Z" fill="${rc}" stroke="${rd}"/>` +
        `<rect x="-7" y="-5" width="14" height="12" rx="4" fill="${rd}"/></g>`;
    }
    s += "</svg>";
    return s;
  }

  /* ════════ ШАГ 1: ЦВЕТЫ ════════ */
  const grid = $("#bcGrid", root), presetsBox = $("#bcPresets", root);
  const colorPick = {}; /* выбранный цвет в карточке */

  function thumb(fl, ci) {
    const col = fl.colors[ci][1];
    const art = fl.kind === "spike"
      ? `<g transform="translate(0,52)">${A.spike(fl.spike || "delphinium", col, 104, 3)}</g>`
      : A.head(fl.kind, col, 38, 17);
    return `<svg viewBox="-55 -55 110 110" aria-hidden="true"><defs>${A.defs()}</defs>${art}</svg>`;
  }

  function cardHtml(fl) {
    /* по умолчанию показываем цвет, который уже в букете */
    if (colorPick[fl.id] == null) {
      const inB = fl.colors.findIndex((c, i) => S.sel[fl.id + "|" + i]);
      colorPick[fl.id] = inB >= 0 ? inB : 0;
    }
    const ci = colorPick[fl.id], key = fl.id + "|" + ci, n = S.sel[key] || 0;
    const totalOfFlower = Object.keys(S.sel).filter((k) => k.indexOf(fl.id + "|") === 0).reduce((a, k) => a + S.sel[k], 0);
    const dots = fl.colors.length > 1 ? `<div class="bc-dots" role="group" aria-label="Цвет">` + fl.colors.map((c, i) =>
      `<button type="button" class="bc-dot${i === ci ? " is-on" : ""}" data-color="${i}" style="--c:${c[1]}" title="${esc(c[0])}" aria-label="${esc(c[0])}"></button>`).join("") + "</div>" : `<div class="bc-dots bc-dots--one">${esc(fl.colors[0][0])}</div>`;
    return `<article class="bc-flower${n ? " is-in" : ""}" data-id="${fl.id}">
      ${totalOfFlower ? `<span class="bc-flower__badge">${totalOfFlower}</span>` : ""}
      <div class="bc-flower__art">${thumb(fl, ci)}</div>
      <h3 class="bc-flower__name">${esc(fl.name)}</h3>
      <p class="bc-flower__price">${money(fl.price)} <span>/ шт</span></p>
      ${dots}
      ${n ? `<div class="bc-qty"><button type="button" data-q="-1" aria-label="Убрать">−</button><b>${n}</b><button type="button" data-q="1" aria-label="Добавить">+</button></div>`
        : `<button type="button" class="bc-add" data-q="1">Добавить <span aria-hidden="true">+</span></button>`}
    </article>`;
  }

  function renderGrid() {
    const q = ($("#bcSearch", root).value || "").trim().toLowerCase();
    const list = D.flowers.filter((fl) => fl.inStock !== false && (!q || fl.name.toLowerCase().indexOf(q) >= 0 ||
      fl.colors.some((c) => c[0].toLowerCase().indexOf(q) >= 0)));
    grid.innerHTML = list.length ? list.map(cardHtml).join("")
      : `<div class="bc-empty"><b>Такого цветка нет</b><span>Попробуйте другое название</span></div>`;
  }

  function renderPresets() {
    presetsBox.innerHTML = D.presets.map((p, i) => {
      const comp = p.items.map(([id, ci, n]) => { const fl = byId(D.flowers, id); return fl ? fl.name + " ×" + n : ""; }).filter(Boolean).join(", ");
      const sum = p.items.reduce((a, [id, ci, n]) => { const fl = byId(D.flowers, id); return a + (fl ? fl.price * n : 0); }, 0);
      const art = p.items.slice(0, 3).map(([id, ci], j) => { const fl = byId(D.flowers, id); return fl ? `<g transform="translate(${(j - 1) * 30},${j === 1 ? -6 : 6})">${fl.kind === "spike" ? "" : A.head(fl.kind, fl.colors[ci][1], 26, 5 + j)}</g>` : ""; }).join("");
      return `<button type="button" class="bc-preset" data-preset="${i}">
        <svg viewBox="-60 -40 120 80" aria-hidden="true"><defs>${A.defs()}</defs>${art}</svg>
        <b>${esc(p.name)}</b><span>${esc(comp)}</span><em>${money(sum)}</em></button>`;
    }).join("");
  }

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".bc-flower");
    if (!card) return;
    const fl = byId(D.flowers, card.dataset.id);
    const dot = e.target.closest("[data-color]");
    if (dot) { colorPick[fl.id] = +dot.dataset.color; card.outerHTML = cardHtml(fl); return; }
    const q = e.target.closest("[data-q]");
    if (!q) return;
    const key = fl.id + "|" + (colorPick[fl.id] || 0), d = +q.dataset.q;
    if (d > 0 && stemCount() >= D.maxStems) { toast("В букете уже " + D.maxStems + " цветок — это максимум"); return; }
    S.sel[key] = Math.max(0, (S.sel[key] || 0) + d);
    if (!S.sel[key]) delete S.sel[key];
    S.offsets = {};
    save();
    const fresh = document.createElement("div");
    fresh.innerHTML = cardHtml(fl);
    card.replaceWith(fresh.firstElementChild);
    drawStages();
    updateBar();
  });

  presetsBox.addEventListener("click", (e) => {
    const b = e.target.closest("[data-preset]");
    if (!b) return;
    const p = D.presets[+b.dataset.preset];
    S.sel = {};
    p.items.forEach(([id, ci, n]) => { S.sel[id + "|" + ci] = (S.sel[id + "|" + ci] || 0) + n; });
    S.offsets = {};
    save();
    setTab("all");
    renderGrid();
    drawStages();
    updateBar();
    toast("Готово: «" + p.name + "». Можно поменять состав или нажать «Собрать букет»");
  });

  function setTab(t) {
    $$("[data-tab]", root).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tab === t)));
    grid.hidden = t !== "all";
    presetsBox.hidden = t !== "presets";
    $(".bc-search", root).hidden = t !== "all";
  }
  $$("[data-tab]", root).forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));
  $("#bcSearch", root).addEventListener("input", renderGrid);
  $("#bcClear", root).addEventListener("click", () => {
    S.sel = {}; S.fillers = {}; S.offsets = {}; save();
    $("#bcSearch", root).value = "";
    renderGrid(); drawStages(); updateBar();
  });

  /* ════════ ШАГ 2: БУКЕТ И ОТКРЫТКА ════════ */
  const stage = $("#bcStage", root), picker = $("#bcPicker", root);
  let moveMode = false, pickerKind = "";

  /* Сцена слева видна на всех шагах: букет растёт прямо во время выбора */
  function drawStages() {
    stage.innerHTML = stems().length
      ? compose({ wrap: S.step === 3 })
      : '<div class="bc-stage__empty"><b>Здесь появится ваш букет</b><span>Добавьте цветы справа</span></div>';
    stage.classList.toggle("is-move", moveMode && S.step === 2);
  }

  function openPicker(kind) {
    if (pickerKind === kind) { closePicker(); return; }
    pickerKind = kind;
    $$("[data-tool]", root).forEach((b) => b.classList.toggle("is-on", b.dataset.tool === kind || (b.dataset.tool === "move" && moveMode)));
    let h = "";
    if (kind === "bg") {
      h += `<p class="bc-picker__t">Фон</p><div class="bc-chips">` + D.backdrops.map((b) =>
        `<button type="button" class="bc-chip bc-chip--sw${S.bg === b.id ? " is-on" : ""}" data-bg="${b.id}"><i style="background:${b.css}"></i>${esc(b.name)}</button>`).join("") + "</div>";
      h += `<p class="bc-picker__t">Зелень</p><div class="bc-chips">` + D.greens.map((g) =>
        `<button type="button" class="bc-chip${S.green === g.id ? " is-on" : ""}" data-green="${g.id}">` +
        (g.id === "none" ? "" : `<svg viewBox="-30 -150 60 160" aria-hidden="true"><defs>${A.defs()}</defs>${A.green(g.id, 140, 4)}</svg>`) +
        `${esc(g.name)}${g.price ? `<small>+${money(g.price)}</small>` : ""}</button>`).join("") + "</div>";
    } else if (kind === "fillers") {
      h += `<p class="bc-picker__t">Добавки — живые цветы в букет</p><div class="bc-chips">` + D.fillers.map((fi) => {
        const n = S.fillers[fi.id] || 0;
        const art = fi.kind === "spike" ? `<g transform="translate(0,50)">${A.spike(fi.spike, fi.color, 100, 3)}</g>`
          : fi.kind === "gyps" ? A.gyps("#ffffff", 34, 3) : A.head(fi.kind, fi.color, 34, 3);
        return `<div class="bc-chip bc-chip--fill${n ? " is-on" : ""}"><svg viewBox="-50 -50 100 100" aria-hidden="true"><defs>${A.defs()}</defs>${art}</svg>` +
          `<span>${esc(fi.name)}<small>${money(fi.price)}</small></span>` +
          `<span class="bc-qty bc-qty--s"><button type="button" data-fill="${fi.id}" data-q="-1" aria-label="Меньше">−</button><b>${n}</b><button type="button" data-fill="${fi.id}" data-q="1" aria-label="Больше">+</button></span></div>`;
      }).join("") + "</div>";
    }
    picker.innerHTML = h + `<button type="button" class="bc-picker__close" data-close-picker aria-label="Закрыть">×</button>`;
    picker.hidden = false;
  }
  function closePicker() {
    pickerKind = "";
    picker.hidden = true;
    $$("[data-tool]", root).forEach((b) => b.classList.toggle("is-on", b.dataset.tool === "move" && moveMode));
  }

  picker.addEventListener("click", (e) => {
    if (e.target.closest("[data-close-picker]")) { closePicker(); return; }
    const bg = e.target.closest("[data-bg]"), gr = e.target.closest("[data-green]"), fl = e.target.closest("[data-fill]");
    if (bg) S.bg = bg.dataset.bg;
    else if (gr) S.green = gr.dataset.green;
    else if (fl) {
      const id = fl.dataset.fill, d = +fl.dataset.q;
      if (d > 0 && stemCount() + fillerCount() >= D.maxStems + 10) return;
      S.fillers[id] = Math.max(0, (S.fillers[id] || 0) + d);
      if (!S.fillers[id]) delete S.fillers[id];
      S.offsets = {};
    } else return;
    save();
    const k = pickerKind; pickerKind = ""; openPicker(k);
    drawStages(); updateBar();
  });

  $$("[data-tool]", root).forEach((b) => b.addEventListener("click", () => {
    const t = b.dataset.tool;
    if (t === "shuffle") { S.seed = (S.seed * 7 + 13) % 9973 || 3; S.offsets = {}; save(); drawStages(); return; }
    if (t === "move") {
      if (S.step !== 2) go(2); moveMode = !moveMode; b.classList.toggle("is-on", moveMode); drawStages(); toast(moveMode ? "Перетаскивайте цветы пальцем или мышкой" : "Готово"); return; }
    if (t === "more") { go(1); return; }
    if (S.step !== 2) go(2);
    openPicker(t);
  }));

  /* перетаскивание головок */
  let drag = null;
  stage.addEventListener("pointerdown", (e) => {
    if (!moveMode) return;
    const g = e.target.closest(".bc-head");
    if (!g) return;
    const svg = stage.querySelector("svg"), pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const off = S.offsets[g.dataset.k] || [0, 0];
    drag = { g, k: g.dataset.k, sx: p.x, sy: p.y, ox: off[0], oy: off[1], base: g.getAttribute("transform") };
    svg.appendChild(g); /* поверх остальных */
    g.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  stage.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const svg = stage.querySelector("svg"), pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const dx = p.x - drag.sx, dy = p.y - drag.sy;
    drag.g.setAttribute("transform", `translate(${dx.toFixed(1)},${dy.toFixed(1)}) ` + drag.base);
    drag.dx = dx; drag.dy = dy;
  });
  const endDrag = () => {
    if (!drag) return;
    S.offsets[drag.k] = [drag.ox + (drag.dx || 0), drag.oy + (drag.dy || 0)];
    drag = null; save();
  };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  /* открытка */
  const cTo = $("#bcTo", root), cFrom = $("#bcFrom", root), cText = $("#bcText", root), cFont = $("#bcFont", root);
  function syncCard() {
    cTo.value = S.card.to; cFrom.value = S.card.from; cText.value = S.card.text; cFont.value = S.card.font;
    cText.dataset.font = S.card.font;
    $("#bcTextCount", root).textContent = cText.value.length + " / 300";
  }
  [cTo, cFrom, cText].forEach((el) => el.addEventListener("input", () => {
    S.card.to = cTo.value.slice(0, 40); S.card.from = cFrom.value.slice(0, 40); S.card.text = cText.value.slice(0, 300);
    $("#bcTextCount", root).textContent = cText.value.length + " / 300";
    save(); updateBar();
  }));
  cFont.addEventListener("change", () => { S.card.font = cFont.value; cText.dataset.font = S.card.font; save(); });

  const sugTabs = $("#bcSugTabs", root), sugList = $("#bcSugList", root);
  function renderSug(topic) {
    const topics = Object.keys(D.suggestions);
    topic = topic || topics[0];
    sugTabs.innerHTML = topics.map((t) => `<button type="button" class="bc-chip${t === topic ? " is-on" : ""}" data-topic="${esc(t)}">${esc(t)}</button>`).join("");
    sugList.innerHTML = D.suggestions[topic].map((t) => `<button type="button" class="bc-sug" data-sug>${esc(t)}</button>`).join("");
  }
  sugTabs.addEventListener("click", (e) => { const b = e.target.closest("[data-topic]"); if (b) renderSug(b.dataset.topic); });
  sugList.addEventListener("click", (e) => {
    const b = e.target.closest("[data-sug]");
    if (!b) return;
    S.card.text = b.textContent; save(); syncCard(); updateBar();
  });
  $("#bcSugToggle", root).addEventListener("click", (e) => {
    const box = $("#bcSug", root), open = box.hidden;
    box.hidden = !open;
    e.currentTarget.setAttribute("aria-expanded", String(open));
  });

  /* ════════ ШАГ 3: УПАКОВКА И ЗАКАЗ ════════ */
  function renderStep3() {
    $("#bcWraps", root).innerHTML = D.wraps.map((w) =>
      `<button type="button" class="bc-chip bc-chip--sw${S.wrap === w.id ? " is-on" : ""}" data-wrap="${w.id}"><i style="background:${w.color || "repeating-linear-gradient(45deg,#fff 0 4px,#eee 4px 8px)"}"></i>${esc(w.name)}${w.price ? `<small>+${money(w.price)}</small>` : ""}</button>`).join("");
    $("#bcRibbons", root).innerHTML = D.ribbons.map((r) =>
      `<button type="button" class="bc-chip bc-chip--sw${S.ribbon === r.id ? " is-on" : ""}" data-ribbon="${r.id}"><i style="background:${r.color || "repeating-linear-gradient(45deg,#fff 0 4px,#eee 4px 8px)"}"></i>${esc(r.name)}</button>`).join("");
    const lines = priceParts();
    $("#bcSummary", root).innerHTML = lines.map((l) =>
      `<li><span>${esc(l.label)}${l.n ? ` × ${l.n}` : ""}</span><b>${money(l.sum)}</b></li>`).join("") +
      `<li class="bc-sum__total"><span>Итого</span><b>${money(total())}</b></li>`;
    const card = $("#bcCardPreview", root);
    if (S.card.text.trim()) {
      card.hidden = false;
      card.dataset.font = S.card.font;
      card.innerHTML = (S.card.to ? `<p class="bc-cardp__to">${esc(S.card.to)},</p>` : "") +
        `<p class="bc-cardp__text">${esc(S.card.text)}</p>` + (S.card.from ? `<p class="bc-cardp__from">${esc(S.card.from)}</p>` : "");
    } else card.hidden = true;
  }
  $("#bcWraps", root).addEventListener("click", (e) => { const b = e.target.closest("[data-wrap]"); if (b) { S.wrap = b.dataset.wrap; save(); renderStep3(); drawStages(); updateBar(); } });
  $("#bcRibbons", root).addEventListener("click", (e) => { const b = e.target.closest("[data-ribbon]"); if (b) { S.ribbon = b.dataset.ribbon; save(); renderStep3(); drawStages(); } });

  function composition() {
    return priceParts().filter((l) => l.n).map((l) => l.label + " ×" + l.n).join(", ");
  }

  $("#bcOrder", root).addEventListener("click", () => {
    if (stemCount() < D.minStems) { go(1); return; }
    const g = byId(D.greens, S.green), w = byId(D.wraps, S.wrap), r = byId(D.ribbons, S.ribbon);
    const addons = [];
    if (g && g.id !== "none") addons.push("зелень: " + g.name.toLowerCase());
    if (w) addons.push(w.id === "none" ? "без упаковки" : "упаковка: " + w.name.toLowerCase());
    if (r && r.id !== "none") addons.push("лента: " + r.name.toLowerCase());
    if (S.card.text.trim()) {
      addons.push("открытка" + (S.card.to ? " для «" + S.card.to + "»" : "") + ": «" + S.card.text.trim() + "»" + (S.card.from ? " — " + S.card.from : ""));
    }
    if (!window.PalomaCart || !window.PalomaCart.add) { toast("Корзина не загрузилась — обновите страницу"); return; }
    window.PalomaCart.add({
      id: "constructor-" + Date.now().toString(36),
      name: "Букет из конструктора",
      size: composition(),
      addons,
      price: total(),
      qty: 1,
      category: "authors",
      bg: "linear-gradient(135deg,#F6D9DE,#E7385A)",
    });
    if (window.palomaGoal) window.palomaGoal("constructor_order");
    location.href = "checkout.html";
  });

  $("#bcDownload", root).addEventListener("click", () => {
    const svg = compose({ wrap: true, full: true });
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement("canvas");
      cv.width = W * 2; cv.height = H * 2;
      const ctx = cv.getContext("2d");
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      ctx.fillStyle = "rgba(231,56,90,.85)";
      ctx.font = "italic 34px Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText("PALOMA", cv.width - 40, cv.height - 36);
      const a = document.createElement("a");
      a.download = "paloma-buket.png";
      a.href = cv.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });

  /* ════════ ШАГИ, НИЖНЯЯ ПАНЕЛЬ ════════ */
  const bar = $("#bcBar", root);
  function updateBar() {
    const n = stemCount();
    const need = Math.max(0, D.minStems - n);
    $("#bcCount", root).textContent = n
      ? `Выбрано: ${n} ${plural(n, "цветок", "цветка", "цветов")}` + (need ? ` · добавьте ещё ${need}` : "") + ` · до ${D.maxStems}`
      : `Выберите минимум ${D.minStems} цветка`;
    $("#bcCount", root).classList.toggle("is-ok", !need && n > 0);
    $("#bcBarSum", root).textContent = money(n ? total() : 0);
    $("#bcBarInfo", root).textContent = n ? `${n + fillerCount()} ${plural(n + fillerCount(), "цветок", "цветка", "цветов")}` : "Букет пуст";
    const next = $("#bcNext", root);
    next.disabled = S.step === 1 && need > 0;
    next.hidden = S.step === 3;
    next.innerHTML = (S.step === 1 ? "Собрать букет" : "Упаковка и заказ") + ' <span aria-hidden="true">→</span>';
    $("#bcBack", root).hidden = S.step === 1;
    if (S.step === 3) renderStep3();
  }
  function plural(n, a, b, c) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return a;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return b;
    return c;
  }

  function go(step) {
    if (step > 1 && stemCount() < D.minStems) step = 1;
    S.step = step; save();
    $$("[data-step]", root).forEach((sec) => { sec.hidden = +sec.dataset.step !== step; });
    $$(".bc-steps li", root).forEach((li, i) => {
      li.classList.toggle("is-on", i + 1 === step);
      li.classList.toggle("is-done", i + 1 < step);
    });
    if (step !== 2) { closePicker(); moveMode = false; }
    if (step === 1) renderGrid();
    if (step === 2) syncCard();
    drawStages();
    updateBar();
    const sc = $("[data-step=\"" + step + "\"] .bc-scroll", root);
    if (sc) sc.scrollTop = 0;
  }
  $("#bcNext", root).addEventListener("click", () => go(S.step + 1));
  $("#bcBack", root).addEventListener("click", () => go(S.step - 1));
  $$(".bc-steps li", root).forEach((li, i) => li.addEventListener("click", () => go(i + 1)));

  let toastTimer = 0;
  function toast(msg) {
    const t = $("#bcToast", root);
    t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), 2600);
  }

  renderPresets();
  renderSug();
  setTab("all");
  go(S.step || 1);
})();
