/* ════════════════════════════════════════════════════════
   bouquet-create.js — конструктор «Соберите букет» (v2, по видео владельца)

   Сверху — букет, вид сверху: круг из цветов в упаковке, ленты, зелень,
   открытка, конфеты, мишка. Под ним — «N цветов · большой букет» и
   «Расставить автоматически». Вкладки: Цветы / Упаковка / Дополнения /
   Состав. Внизу всегда — сумма и «Отправить заявку» → панель заявки
   (имя, телефон, дата) → «Заявка отправлена».

   Данные — bouquet-create-data.js (flowers + v2), рисунки — flower-art.js.
   Заявка уходит менеджеру в Telegram через lead-send.js (palomaSendLead).
   ════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const D = window.PALOMA_CREATE_DATA;
  const A = window.PalomaArt;
  const root = document.getElementById("bcApp");
  if (!D || !D.v2 || !A || !root) return;
  const V = D.v2;

  const KEY = "paloma_create_v2";
  const $ = (s, el) => (el || root).querySelector(s);
  const $$ = (s, el) => Array.from((el || root).querySelectorAll(s));
  const money = (n) => Math.round(n).toLocaleString("ru-RU") + " ₽";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const byId = (list, id) => list.find((x) => x.id === id);
  const pick = (list, id) => list.find((x) => x[0] === id) || list[0];

  /* ── состояние ── */
  const fresh = () => ({
    sel: {}, seed: 7, tab: "flowers",
    wrap: "milk", ribbons: ["powder"],
    green: false, card: false, cardText: "", candy: false, bear: "none",
  });
  let S = fresh();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && saved.sel) S = Object.assign(fresh(), saved);
  } catch (e) { /* приватный режим */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ок */ } };

  const stems = () => Object.values(S.sel).reduce((a, b) => a + b, 0);
  const plural = (n, a, b, c) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return a;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return b;
    return c;
  };
  const flowersWord = (n) => n + " " + plural(n, "цветок", "цветка", "цветов");
  const tier = (n) => (V.tiers.find((t) => n <= t[0]) || V.tiers[V.tiers.length - 1])[1];
  const branches = () => Math.max(1, Math.ceil(stems() / 10));

  /* ── цена: строки состава ── */
  function lines() {
    const out = [];
    D.flowers.forEach((fl) => {
      fl.colors.forEach((c, ci) => {
        const n = S.sel[fl.id + "|" + ci] || 0;
        if (n) out.push({ t: `${fl.name}, ${c[0].toLowerCase()}`, n, sum: n * fl.price });
      });
    });
    if (stems()) {
      out.push({ t: "Упаковка: " + pick(V.wraps, S.wrap)[1].toLowerCase(), sum: V.wrapPrice });
      S.ribbons.forEach((r, i) => out.push({ t: (i ? "Лента " + (i + 1) : "Лента") + ": " + pick(V.ribbons, r)[1].toLowerCase(), sum: V.ribbonPrice }));
      if (S.green) out.push({ t: `Зелень, ${branches()} ${plural(branches(), "ветка", "ветки", "веток")}`, sum: branches() * V.greenPerBranch });
      if (S.card) out.push({ t: "Открытка" + (S.cardText.trim() ? ": «" + S.cardText.trim() + "»" : ""), sum: V.cardPrice });
      if (S.candy) out.push({ t: V.candy.name, sum: V.candy.price });
      if (S.bear !== "none") out.push({ t: V.bear.name + (S.bear === "in" ? " — в букете" : " — рядом"), sum: V.bear.price });
    }
    return out;
  }
  const total = () => lines().reduce((a, l) => a + l.sum, 0);

  /* ════════ РИСУНОК: букет сверху ════════ */
  const CX = 300, CY = 285;

  function heads() {
    const out = [];
    D.flowers.forEach((fl) => fl.colors.forEach((c, ci) => {
      for (let i = 0; i < (S.sel[fl.id + "|" + ci] || 0); i++) out.push({ fl, color: c[1] });
    }));
    return out;
  }

  /* Плюшевый мишка — простой собственный рисунок */
  function bearSvg(x, y, s) {
    const f = "#C8925E", d = "#9C6A3F", l = "#E8C9A2";
    return `<g transform="translate(${x},${y}) scale(${s})">
      <ellipse cx="0" cy="44" rx="34" ry="36" fill="${f}" stroke="${d}" stroke-width="1.5"/>
      <ellipse cx="0" cy="50" rx="18" ry="20" fill="${l}"/>
      <circle cx="-30" cy="62" r="11" fill="${f}" stroke="${d}" stroke-width="1.5"/>
      <circle cx="30" cy="62" r="11" fill="${f}" stroke="${d}" stroke-width="1.5"/>
      <circle cx="-26" cy="-22" r="12" fill="${f}" stroke="${d}" stroke-width="1.5"/><circle cx="-26" cy="-22" r="6" fill="${l}"/>
      <circle cx="26" cy="-22" r="12" fill="${f}" stroke="${d}" stroke-width="1.5"/><circle cx="26" cy="-22" r="6" fill="${l}"/>
      <circle cx="0" cy="0" r="30" fill="${f}" stroke="${d}" stroke-width="1.5"/>
      <ellipse cx="0" cy="10" rx="13" ry="10" fill="${l}"/>
      <ellipse cx="0" cy="5" rx="4.5" ry="3.5" fill="#3A2416"/>
      <path d="M0 9 v4 M-4 14 q4 3 8 0" stroke="#3A2416" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <circle cx="-10" cy="-6" r="3" fill="#2A1A10"/><circle cx="10" cy="-6" r="3" fill="#2A1A10"/>
      <path d="M-14 26 q14 10 28 0" stroke="#E7385A" stroke-width="5" fill="none" stroke-linecap="round"/>
    </g>`;
  }

  function candySvg(x, y) {
    let s = `<g transform="translate(${x},${y}) rotate(-8)"><rect x="-44" y="-44" width="88" height="88" rx="8" fill="#FBF8F2" stroke="#D9D2C4" stroke-width="1.5"/>`;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      s += `<circle cx="${-26 + c * 26}" cy="${-26 + r * 26}" r="10" fill="#F4EDE0" stroke="#D8CBB4" stroke-width="1"/><circle cx="${-29 + c * 26}" cy="${-29 + r * 26}" r="3" fill="#fff" opacity=".9"/>`;
    }
    return s + "</g>";
  }

  function cardSvg(text) {
    const words = String(text || "С любовью").split(/\s+/);
    const rows = [];
    let row = "";
    words.forEach((w) => { if ((row + " " + w).trim().length > 12) { if (row) rows.push(row); row = w; } else row = (row + " " + w).trim(); });
    if (row) rows.push(row);
    const t = rows.slice(0, 4).map((r, i) => `<text x="0" y="${-14 + i * 15}" text-anchor="middle" font-family="Caveat, 'Segoe Print', cursive" font-size="15" fill="#3A3633">${esc(r)}</text>`).join("");
    return `<g transform="translate(520,70) rotate(8)"><rect x="-52" y="-38" width="104" height="80" rx="3" fill="#FFFDF9" stroke="#DCD3C6" stroke-width="1.2"/>${t}</g>`;
  }

  function compose() {
    const all = heads();
    const R0 = A.rng(S.seed * 7919 + 3);
    const N = all.length;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" class="bc-svg" role="img" aria-label="Ваш букет, вид сверху"><defs>${A.defs()}` +
      `<filter id="bcSh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#3c1e24" flood-opacity=".28"/></filter></defs>`;
    if (!N) {
      return s + `<circle cx="${CX}" cy="${CY}" r="170" fill="#F6F1EC"/><text x="${CX}" y="${CY - 6}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="26" fill="#1B1A18">Здесь появится букет</text>` +
        `<text x="${CX}" y="${CY + 24}" text-anchor="middle" font-size="14" fill="#8a8580">Добавьте цветы ниже</text></svg>`;
    }
    const targetR = Math.max(92, Math.min(205, 70 + Math.sqrt(N) * 21));
    const c = targetR / Math.sqrt(N);
    const R = c * Math.sqrt(N);
    const wrap = pick(V.wraps, S.wrap)[2];
    const RW = R + 30;

    /* ленты — хвосты вниз из-под букета */
    S.ribbons.forEach((r, i) => {
      const col = pick(V.ribbons, r)[2], dk = A.dark(col, 0.2), dx = (i - (S.ribbons.length - 1) / 2) * 22;
      s += `<path d="M${CX - 10 + dx},${CY + RW - 18} C${CX - 30 + dx},${CY + RW + 40} ${CX - 40 + dx},${CY + RW + 80} ${CX - 52 + dx},598 L${CX - 32 + dx},598 C${CX - 22 + dx},${CY + RW + 70} ${CX - 12 + dx},${CY + RW + 30} ${CX + 2 + dx},${CY + RW - 18}Z" fill="${col}" stroke="${dk}" stroke-width="1"/>` +
        `<path d="M${CX + 10 + dx},${CY + RW - 18} C${CX + 30 + dx},${CY + RW + 40} ${CX + 40 + dx},${CY + RW + 80} ${CX + 52 + dx},598 L${CX + 32 + dx},598 C${CX + 22 + dx},${CY + RW + 70} ${CX + 12 + dx},${CY + RW + 30} ${CX - 2 + dx},${CY + RW - 18}Z" fill="${A.dark(col, 0.06)}" stroke="${dk}" stroke-width="1"/>`;
    });

    /* упаковка — круг с волнистым краем бумаги */
    let edge = "";
    const waves = 22;
    for (let i = 0; i <= waves * 2; i++) {
      const a = (Math.PI * 2 * i) / (waves * 2);
      const rr = RW + (i % 2 ? 7 : -3) + (R0() - 0.5) * 4;
      edge += (i ? "L" : "M") + (CX + Math.cos(a) * rr).toFixed(1) + "," + (CY + Math.sin(a) * rr).toFixed(1);
    }
    s += `<path d="${edge}Z" fill="${wrap}" stroke="${A.dark(wrap, 0.16)}" stroke-width="1.2" filter="url(#bcSh)"/>`;
    s += `<circle cx="${CX}" cy="${CY}" r="${(RW - 14).toFixed(1)}" fill="${A.dark(wrap, 0.07)}"/>`;

    /* зелень по краю и между цветами */
    if (S.green) {
      const nb = branches() * 3 + 6;
      for (let i = 0; i < nb; i++) {
        const a = (Math.PI * 2 * i) / nb + R0() * 0.3, d = R * (0.82 + R0() * 0.22);
        s += `<g transform="translate(${(CX + Math.cos(a) * d).toFixed(1)},${(CY + Math.sin(a) * d).toFixed(1)}) rotate(${((a * 180) / Math.PI + 90).toFixed(1)})">${A.green("eucalyptus", 52 + R0() * 22, 40 + i)}</g>`;
      }
    }

    /* головки: порядок перемешивает «Расставить автоматически» */
    const order = all.map((h) => ({ h, r: R0() })).sort((a, b) => a.r - b.r).map((x) => x.h);
    order.forEach((h, j) => {
      const a = j * 2.39996 + S.seed * 0.9, d = c * Math.sqrt(j + 0.5);
      h.x = CX + Math.cos(a) * d; h.y = CY + Math.sin(a) * d; h.d = d;
    });
    order.slice().sort((a, b) => b.d - a.d).forEach((h, j) => {
      const size = (h.fl.size || 34) / 34;
      const rr = c * 0.95 * Math.max(0.85, Math.min(1.4, size));
      const art = h.fl.kind === "spike"
        ? A.head("hydrangea", h.color, rr * 0.8, 9 + j) /* сверху колос похож на пышную кисть */
        : A.head(h.fl.kind, h.color, rr, 13 + j * 7);
      s += `<g filter="url(#bcSh)" transform="translate(${h.x.toFixed(1)},${h.y.toFixed(1)}) rotate(${(R0() * 360).toFixed(0)})">${art}</g>`;
    });

    if (S.bear === "in") s += bearSvg(CX + R * 0.55, CY + R * 0.5, 0.75);
    if (S.bear === "near") s += bearSvg(530, 470, 0.95);
    if (S.candy) s += candySvg(78, 500);
    if (S.card) s += cardSvg(S.cardText);
    return s + "</svg>";
  }

  /* ════════ ВКЛАДКИ ════════ */
  const panel = $("#bcPanel");
  const colorPick = {};

  function thumb(fl, ci) {
    const col = fl.colors[ci][1];
    const art = fl.kind === "spike"
      ? `<g transform="translate(0,48)">${A.spike(fl.spike || "delphinium", col, 96, 3)}</g>`
      : A.head(fl.kind, col, 38, 17);
    return `<svg viewBox="-50 -50 100 100" aria-hidden="true"><defs>${A.defs()}</defs>${art}</svg>`;
  }

  function flowerRow(fl) {
    if (colorPick[fl.id] == null) {
      const inB = fl.colors.findIndex((c, i) => S.sel[fl.id + "|" + i]);
      colorPick[fl.id] = inB >= 0 ? inB : 0;
    }
    const ci = colorPick[fl.id], n = S.sel[fl.id + "|" + ci] || 0;
    const any = fl.colors.some((c, i) => S.sel[fl.id + "|" + i]);
    const dots = fl.colors.length > 1 ? `<div class="bc-dots">` + fl.colors.map((c, i) => {
      const cnt = S.sel[fl.id + "|" + i] || 0;
      return `<button type="button" class="bc-dot${i === ci ? " is-on" : ""}" data-color="${i}" style="--c:${c[1]}" aria-label="${esc(c[0])}">${cnt ? `<b>${cnt}</b>` : ""}</button>`;
    }).join("") + "</div>" : "";
    return `<div class="bc-row${any ? " is-in" : ""}" data-id="${fl.id}">
      <div class="bc-row__art">${thumb(fl, ci)}</div>
      <div class="bc-row__info">
        <p class="bc-row__name">${esc(fl.name)}</p>
        <p class="bc-row__meta">${money(fl.price)} за шт. · ${esc(fl.colors[ci][0].toLowerCase())}</p>
        ${dots}
      </div>
      <div class="bc-qty"><button type="button" data-q="-1" aria-label="Убрать"${n ? "" : " disabled"}>−</button><b>${n}</b><button type="button" data-q="1" aria-label="Добавить">+</button></div>
    </div>`;
  }

  function swatches(list, current, attrs) {
    return `<div class="bc-sw">` + list.map(([id, name, col]) =>
      `<button type="button" class="bc-sw__item${current === id ? " is-on" : ""}" ${attrs}="${id}"><i style="background:${col}"></i><span>${esc(name)}</span></button>`).join("") + "</div>";
  }

  function toggle(attr, value, options) {
    return `<div class="bc-toggle" role="group">` + options.map(([v, label]) =>
      `<button type="button" data-${attr}="${v}" class="${String(value) === String(v) ? "is-on" : ""}">${label}</button>`).join("") + "</div>";
  }

  function renderPanel() {
    $$(".bc-tabs button").forEach((b) => b.classList.toggle("is-on", b.dataset.tab === S.tab));
    let h = "";
    if (S.tab === "flowers") {
      h = D.flowers.filter((fl) => fl.inStock !== false).map(flowerRow).join("");
    } else if (S.tab === "wrap") {
      h = `<div class="bc-sec"><div class="bc-sec__head"><b>Цвет упаковки</b><span>${money(V.wrapPrice)}</span></div>${swatches(V.wraps, S.wrap, "data-wrap")}</div>`;
      S.ribbons.forEach((r, i) => {
        h += `<div class="bc-sec"><div class="bc-sec__head"><b>${i ? "Лента " + (i + 1) : "Лента"} <em>· ${esc(pick(V.ribbons, r)[1])}</em></b><span>${money(V.ribbonPrice)} <button type="button" class="bc-link" data-rib-remove="${i}">Убрать</button></span></div>` +
          swatches(V.ribbons, r, `data-rib="${i}" data-ribcolor`) + "</div>";
      });
      if (S.ribbons.length < 3) h += `<button type="button" class="bc-add-line" data-rib-add>+ ${S.ribbons.length ? "Добавить ещё ленту" : "Добавить ленту"} · ${money(V.ribbonPrice)}</button>`;
    } else if (S.tab === "extras") {
      const b = branches();
      h = `<div class="bc-extra"><div class="bc-extra__art"><svg viewBox="-30 -70 60 80" aria-hidden="true"><defs>${A.defs()}</defs>${A.green("eucalyptus", 66, 3)}</svg></div>
          <div class="bc-extra__info"><b>Зелень</b><span>${b} ${plural(b, "ветка", "ветки", "веток")} — по одной на 10 цветов · ${money(b * V.greenPerBranch)}</span></div>
          ${toggle("green", S.green, [[false, "Нет"], [true, "Есть"]])}</div>
        <div class="bc-extra bc-extra--wide"><div class="bc-extra__art bc-extra__art--icon">✉</div>
          <div class="bc-extra__info"><b>Открытка с вашим текстом</b><span>Добавить — ${money(V.cardPrice)}</span></div>
          ${toggle("card", S.card, [[false, "Нет"], [true, "Добавить"]])}
          ${S.card ? `<textarea class="bc-cardtext" id="bcCardText" maxlength="120" placeholder="Текст открытки, например: «С днём рождения, мама!»">${esc(S.cardText)}</textarea>` : ""}</div>
        <div class="bc-extra"><div class="bc-extra__art"><svg viewBox="-50 -50 100 100" aria-hidden="true">${candySvg(0, 0)}</svg></div>
          <div class="bc-extra__info"><b>${esc(V.candy.name)}</b><span>Добавить — ${money(V.candy.price)}</span></div>
          ${toggle("candy", S.candy, [[false, "Нет"], [true, "Добавить"]])}</div>
        <div class="bc-extra"><div class="bc-extra__art"><svg viewBox="-50 -40 100 120" aria-hidden="true">${bearSvg(0, 0, 0.9)}</svg></div>
          <div class="bc-extra__info"><b>${esc(V.bear.name)}</b><span>${money(V.bear.price)}</span></div>
          ${toggle("bear", S.bear, [["none", "Нет"], ["near", "Рядом"], ["in", "В букете"]])}</div>`;
    } else {
      const ls = lines();
      h = ls.length ? `<ul class="bc-sum">` + ls.map((l) => `<li><span>${esc(l.t)}${l.n ? ` × ${l.n}` : ""}</span><b>${money(l.sum)}</b></li>`).join("") +
        `<li class="bc-sum__total"><span>Итого</span><b>${money(total())}</b></li></ul>` : `<p class="bc-empty">Добавьте цветы во вкладке «Цветы».</p>`;
    }
    panel.innerHTML = h;
    const ta = $("#bcCardText");
    if (ta) ta.addEventListener("input", () => { S.cardText = ta.value.slice(0, 120); save(); drawStage(); updateBar(); });
  }

  panel.addEventListener("click", (e) => {
    const row = e.target.closest(".bc-row");
    if (row) {
      const fl = byId(D.flowers, row.dataset.id);
      const dot = e.target.closest("[data-color]");
      if (dot) colorPick[fl.id] = +dot.dataset.color;
      const q = e.target.closest("[data-q]");
      if (q) {
        const key = fl.id + "|" + (colorPick[fl.id] || 0), d = +q.dataset.q;
        if (d > 0 && stems() >= D.maxStems) { toast("В букете уже " + D.maxStems + " цветок — это максимум"); return; }
        S.sel[key] = Math.max(0, (S.sel[key] || 0) + d);
        if (!S.sel[key]) delete S.sel[key];
      }
      if (dot || q) {
        save();
        const tmp = document.createElement("div");
        tmp.innerHTML = flowerRow(fl);
        row.replaceWith(tmp.firstElementChild);
        drawStage(); updateBar();
      }
      return;
    }
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.wrap) S.wrap = t.dataset.wrap;
    else if (t.dataset.ribcolor) S.ribbons[+t.dataset.rib] = t.dataset.ribcolor;
    else if (t.dataset.ribRemove != null) S.ribbons.splice(+t.dataset.ribRemove, 1);
    else if (t.hasAttribute("data-rib-add")) S.ribbons.push(S.ribbons.length ? "white" : "powder");
    else if (t.dataset.green != null) S.green = t.dataset.green === "true";
    else if (t.dataset.card != null) S.card = t.dataset.card === "true";
    else if (t.dataset.candy != null) S.candy = t.dataset.candy === "true";
    else if (t.dataset.bear != null) S.bear = t.dataset.bear;
    else return;
    save(); renderPanel(); drawStage(); updateBar();
    if (t.dataset.card === "true") { const ta = $("#bcCardText"); if (ta) ta.focus(); }
  });

  $$(".bc-tabs button").forEach((b) => b.addEventListener("click", () => { S.tab = b.dataset.tab; save(); renderPanel(); panel.scrollTop = 0; }));

  /* ════════ сцена, подпись, нижняя панель ════════ */
  const stage = $("#bcStage");
  function drawStage() {
    stage.innerHTML = compose();
    const n = stems();
    $("#bcLabel").textContent = n ? `${flowersWord(n)} · ${tier(n)}` : "Букет пуст";
  }
  function updateBar() {
    const n = stems();
    $("#bcBarSum").textContent = money(total());
    $("#bcBarInfo").textContent = n ? flowersWord(n) : "Добавьте цветы";
    $("#bcSend").disabled = n < D.minStems;
  }

  $("#bcShuffle").addEventListener("click", () => {
    if (!stems()) { toast("Сначала добавьте цветы"); return; }
    S.seed = (S.seed * 31 + 17) % 99991 || 5; save(); drawStage();
    toast("Новый вариант — нажмите ещё, если не нравится");
  });

  /* ════════ заявка ════════ */
  const sheet = $("#bcSheet");
  function openSheet() {
    $("#bcSheetSum").textContent = `${flowersWord(stems())} · ${money(total())}. Флорист перезвонит, уточнит детали и соберёт букет по вашей схеме.`;
    $("#bcForm").hidden = false; $("#bcDone").hidden = true;
    sheet.hidden = false; void sheet.offsetWidth; sheet.classList.add("is-open");
    document.documentElement.classList.add("bc-lock");
    setTimeout(() => { const i = $("#bcName"); if (i) i.focus(); }, 250);
  }
  function closeSheet() {
    sheet.classList.remove("is-open");
    document.documentElement.classList.remove("bc-lock");
    setTimeout(() => { sheet.hidden = true; }, 260);
  }
  $("#bcSend").addEventListener("click", () => { if (stems() >= D.minStems) openSheet(); });
  $$("[data-sheet-close]", sheet).forEach((b) => b.addEventListener("click", closeSheet));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !sheet.hidden) closeSheet(); });

  const phone = $("#bcPhone");
  phone.addEventListener("input", () => {
    let d = phone.value.replace(/\D/g, "");
    if (d.startsWith("8")) d = "7" + d.slice(1);
    if (!d.startsWith("7")) d = "7" + d;
    d = d.slice(0, 11);
    const p = d.slice(1);
    phone.value = "+7" + (p.length ? " (" + p.slice(0, 3) : "") + (p.length >= 3 ? ") " + p.slice(3, 6) : "") +
      (p.length >= 6 ? "-" + p.slice(6, 8) : "") + (p.length >= 8 ? "-" + p.slice(8, 10) : "");
  });
  const dateIn = $("#bcDate");
  try { dateIn.min = new Date().toISOString().slice(0, 10); } catch (e) { /* ок */ }

  $("#bcForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#bcName").value.trim();
    const digits = phone.value.replace(/\D/g, "");
    if (digits.length < 11) { $("#bcErr").textContent = "Укажите телефон полностью — флорист перезвонит."; phone.focus(); return; }
    $("#bcErr").textContent = "";
    const btn = $("#bcSubmit");
    btn.disabled = true; btn.textContent = "Отправляем…";
    const details = "Состав букета:\n" + lines().map((l) => "• " + l.t + (l.n ? " × " + l.n : "") + " — " + money(l.sum)).join("\n") +
      `\n\nИтого: ${money(total())} (${flowersWord(stems())}, ${tier(stems())})`;
    const payload = { page: "bouquet-builder", name, phone: phone.value, date: dateIn.value, details, source: "Конструктор букета" };
    const send = window.palomaSendLead ? window.palomaSendLead(payload) : Promise.resolve({ ok: false });
    send.then(() => {
      btn.disabled = false; btn.textContent = "Отправить заявку";
      $("#bcDoneText").textContent = `Флорист перезвонит${name ? ", " + name : ""}, уточнит детали и соберёт букет по вашей схеме.`;
      $("#bcForm").hidden = true; $("#bcDone").hidden = false;
      if (window.palomaGoal) window.palomaGoal("constructor_lead");
    });
  });

  let toastTimer = 0;
  function toast(msg) {
    const t = $("#bcToast");
    t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), 2400);
  }

  renderPanel();
  drawStage();
  updateBar();
})();
