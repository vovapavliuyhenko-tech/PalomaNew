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
    green: false, card: false, cardText: "", adds: [],
  });
  let S = fresh();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && saved.sel) S = Object.assign(fresh(), saved);
  } catch (e) { /* приватный режим */ }
  /* Упаковка и лента у PALOMA единые — выбора нет */
  S.wrap = "milk"; S.ribbons = ["powder"];
  if (S.tab === "wrap") S.tab = "flowers";
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
      out.push({ t: "Фирменная упаковка PALOMA с лентой", sum: V.wrapPrice + V.ribbonPrice });
      if (S.green) out.push({ t: `Зелень, ${branches()} ${plural(branches(), "ветка", "ветки", "веток")}`, sum: branches() * V.greenPerBranch });
      if (S.card) out.push({ t: "Открытка" + (S.cardText.trim() ? ": «" + S.cardText.trim() + "»" : ""), sum: V.cardPrice });
      S.adds.forEach((a) => out.push({ t: ADD_KINDS[a.k].label + ": " + a.name, n: a.qty > 1 ? a.qty : 0, sum: a.price * a.qty }));
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

  /* Чашка кофе сверху — блюдце, чашка, пенка с сердечком */
  function cupSvg(x, y) {
    return `<g transform="translate(${x},${y})">
      <circle r="46" fill="#FBF8F3" stroke="#DDD3C6" stroke-width="1.5"/>
      <path d="M30 -6 q20 0 20 12 q0 12 -20 10" fill="none" stroke="#E9E2D8" stroke-width="7" stroke-linecap="round"/>
      <circle r="32" fill="#fff" stroke="#DDD3C6" stroke-width="1.5"/>
      <circle r="26" fill="#B7845A"/>
      <path d="M0 12 C-16 0 -14 -12 -6 -12 C-2 -12 0 -9 0 -6 C0 -9 2 -12 6 -12 C14 -12 16 0 0 12Z" fill="#F4E7D6"/>
    </g>`;
  }
  /* Десерт на тарелке сверху */
  function dessertSvg(x, y) {
    return `<g transform="translate(${x},${y})">
      <circle r="44" fill="#fff" stroke="#DDD3C6" stroke-width="1.5"/><circle r="34" fill="none" stroke="#EFE9E1" stroke-width="1.2"/>
      <circle r="22" fill="#E8B9A8"/><circle r="22" fill="none" stroke="#D49A86" stroke-width="2" stroke-dasharray="3 3"/>
      <circle cx="-6" cy="-5" r="5" fill="#C8243C"/><circle cx="6" cy="2" r="4" fill="#C8243C"/><path d="M-2 -10 q3 -4 7 -3" stroke="#6E8F5E" stroke-width="2" fill="none"/>
    </g>`;
  }
  /* Ваза сверху — горлышко с бликом */
  function vaseSvg(x, y) {
    return `<g transform="translate(${x},${y})">
      <circle r="40" fill="#DCE6E8" stroke="#B8C8CC" stroke-width="1.5"/><circle r="28" fill="#C8D7DB"/><circle r="20" fill="#9FB4BA"/>
      <path d="M-28 -16 a32 32 0 0 1 22 -20" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
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

    const has = (k) => S.adds.some((a) => a.k === k);
    if (has("vases")) s += vaseSvg(530, 480);
    if (has("coffee")) s += cupSvg(70, 90);
    if (has("dessert")) s += dessertSvg(66, 210);
    if (has("choco")) s += candySvg(78, 500);
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

  function toggle(attr, value, options) {
    return `<div class="bc-toggle" role="group">` + options.map(([v, label]) =>
      `<button type="button" data-${attr}="${v}" class="${String(value) === String(v) ? "is-on" : ""}">${label}</button>`).join("") + "</div>";
  }

  /* ════════ ИКОНКИ ДОПОЛНЕНИЙ ════════
     Один стиль: тонкая графитовая линия + розовый акцент. Каждая чуть живёт:
     веточка покачивается, над чашкой поднимается пар, в вазе колышется вода,
     сердечко вылетает из конверта, вишенка подпрыгивает, искра мерцает. */
  const ICONS = {
    green: `<path d="M12 21.5c.2-5.5.4-11-.6-17"/>
      <g class="i-sway"><path d="M11.8 8.2C9.2 8 7.6 6.8 7.2 5.2c2.4-.3 4.1.8 4.6 3z"/><path d="M11.9 11c2.6-.2 4.2-1.4 4.6-3-2.4-.3-4.1.8-4.6 3z"/>
      <path d="M12 14.2c-2.8-.1-4.5-1.4-4.9-3.1 2.6-.4 4.4.8 4.9 3.1z"/><path d="M12.1 17.2c2.8-.1 4.5-1.4 4.9-3.1-2.6-.4-4.4.8-4.9 3.1z"/></g>
      <circle class="i-acc i-twinkle" cx="17.6" cy="4.6" r="1"/>`,
    card: `<rect x="3" y="8.5" width="18" height="12" rx="2"/><path d="M3.6 9.4l8.4 6 8.4-6"/>
      <path class="i-acc i-float" d="M12 7.4c-.8-1.2-2.8-.8-2.8.7 0 1.3 2.8 2.9 2.8 2.9s2.8-1.6 2.8-2.9c0-1.5-2-1.9-2.8-.7z"/>`,
    vases: `<path d="M9 3h6M9.6 3v2.6c0 1.1-3.6 3.1-3.6 7.6C6 17.4 8.6 21 12 21s6-3.6 6-7.8c0-4.5-3.6-6.5-3.6-7.6V3"/>
      <defs><clipPath id="bcVaseClip"><path d="M9.6 5.6c0 1.1-3.6 3.1-3.6 7.6C6 17.4 8.6 21 12 21s6-3.6 6-7.8c0-4.5-3.6-6.5-3.6-7.6z"/></clipPath></defs>
      <g clip-path="url(#bcVaseClip)"><g class="i-wave"><path class="i-acc-line" d="M3 13.2c1.5-.7 3 .7 4.5 0s3-.7 4.5 0 3 .7 4.5 0 3-.7 4.5 0 3 .7 4.5 0"/></g></g>`,
    coffee: `<path d="M5 11h11.5v3.5a5 5 0 0 1-5 5h-1.5a5 5 0 0 1-5-5z"/><path d="M16.5 12h1.3a2.3 2.3 0 0 1 0 4.6h-1.6"/><path d="M4 21.5h14"/>
      <g class="i-steam i-acc-line"><path d="M8.6 8.4c-.9-.9.9-1.8 0-3.1"/><path d="M11.4 8.4c-.9-.9.9-1.8 0-3.1"/><path d="M14.2 8.4c-.9-.9.9-1.8 0-3.1"/></g>`,
    dessert: `<path d="M2.5 20.5h19"/><path d="M4.5 18V12l14-3.5V18z"/><path d="M4.5 12c1.6.9 3.2-.5 4.6.3s2.8-.9 4.4-.1 3-.9 5-.7"/><path d="M4.5 15h14"/>
      <g class="i-hop"><path d="M14.2 5.4c.3-1.1 1.1-1.8 2.2-2"/><circle class="i-acc" cx="13.8" cy="6.6" r="1.5"/></g>`,
    choco: `<rect x="3.5" y="11" width="17" height="10" rx="1.6"/><path d="M2.5 8.2h19V11h-19z"/><path d="M12 8.2V21"/>
      <path d="M12 8.2c-1.3-2.8-4.4-3-4-1.1.3 1.4 4 1.1 4 1.1zm0 0c1.3-2.8 4.4-3 4-1.1-.3 1.4-4 1.1-4 1.1z"/>
      <path class="i-acc-line i-twinkle" d="M19.5 2.2v3.2M17.9 3.8h3.2"/>`,
  };
  const icon = (k) => `<span class="bc-ico bc-ico--${k}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg></span>`;

  /* ════════ ВАЗЫ, КОФЕ, ДЕСЕРТЫ, ШОКОЛАД ════════
     Как на странице оформления заказа: «Выбрать» открывает панель снизу
     с вариантами. Вазы — из каталога, остальное — из меню кофейни.
     Выбранное попадает в состав, в сумму и в заявку флористу. */
  function loadScript(src) {
    return new Promise((resolve) => {
      const el = document.createElement("script");
      el.src = src; el.onload = () => resolve(true); el.onerror = () => resolve(false);
      document.head.appendChild(el);
    });
  }
  function loadCatalog() {
    if (Array.isArray(window.PALOMA_PRODUCTS) && window.PALOMA_PRODUCTS.length) return Promise.resolve(window.PALOMA_PRODUCTS);
    const fromServer = window.palomaFetch
      ? window.palomaFetch("?a=products", { cache: "no-store" }).then((r) => r.json()).then((d) => d && d.products)
      : Promise.reject(new Error("нет сервера"));
    return fromServer
      .then((l) => { if (!Array.isArray(l) || !l.length) throw new Error("пусто"); return l; })
      .catch(() => loadScript("paloma-products.js?v=p63").then(() => window.PALOMA_PRODUCTS || []));
  }
  function loadMenu() {
    if (Array.isArray(window.PALOMA_COFFEE_MENU)) return Promise.resolve(window.PALOMA_COFFEE_MENU);
    return loadScript("coffee-menu-data.js?v=27").then(() => window.PALOMA_COFFEE_MENU || []);
  }
  /* «220 / 270 / 300 ₽» + «250 / 350 / 450 мл» → размеры */
  function menuSizes(it) {
    const vols = String(it.volumes || "").split("/").map((x) => x.trim()).filter(Boolean);
    const nums = String(it.priceLabel || "").split("/").map((x) => parseInt(x.replace(/[^0-9]/g, ""), 10) || 0);
    if (nums.length > 1 && (vols.length === nums.length || !vols.length)) {
      const unit = (String(it.volumes || "").match(/[^\d\s/]+\s*$/) || [""])[0].trim();
      return nums.map((pr, i) => {
        let v = vols[i] || "";
        if (v && /^\d+$/.test(v) && unit) v += " " + unit;
        return { label: v, price: pr };
      });
    }
    return [{ label: vols[0] || "", price: Number(it.price) || nums[0] || 0 }];
  }
  const MENU_IMG = {
    classic: "images/paloma/coffee/cup-classic.jpg", cacaoraf: "images/paloma/coffee/cup-raf.jpg",
    milkshake: "images/paloma/coffee/cup-milkshake.jpg", tea: "images/paloma/coffee/cup-tea.jpg",
    cold: "images/paloma/coffee/cup-cold.jpg", autumn: "images/paloma/coffee/pumpkin-latte.jpg",
  };
  const MENU_CATS = {
    autumn: "Осеннее меню", classic: "Классика", cacaoraf: "Какао и раф", cold: "Холодные", milkshake: "Коктейли", tea: "Чай",
    dessert: "Десерты", corpus: "Корпусные", schaste: "Конфеты «Счастье»", chokome: "Шоколад и конфеты",
  };
  const menuPick = (cats, rows) => ({
    rows: !!rows,
    load: () => loadMenu().then((m) => m
      .filter((it) => cats.indexOf(it.category) >= 0 && Number(it.price) > 0)
      .sort((a, b) => cats.indexOf(a.category) - cats.indexOf(b.category))
      .map((it) => ({ id: it.id, group: MENU_CATS[it.category] || "", name: it.title,
        image: rows ? "" : it.image || MENU_IMG[it.category] || "", bg: it.imageBg || "", sizes: menuSizes(it) }))),
  });
  const ADD_KINDS = {
    vases: { label: "Ваза", title: "Выберите вазу", hint: "Чтобы букет сразу встал в воду", art: () => vaseSvg(0, 0),
      load: () => loadCatalog().then((list) => (Array.isArray(list) ? list : [])
        .filter((p) => p && Number(p.price) > 0 && (p.categories || [p.category]).indexOf("vases") >= 0 && /ваз/i.test(p.name))
        .sort((a, b) => a.price - b.price)
        .map((p) => ({ id: p.id, name: p.name, image: p.image || "", sizes: [{ label: "", price: Number(p.price) }] }))) },
    coffee: Object.assign({ label: "Кофе", title: "Выберите напиток", hint: "Свежий кофе из нашей кофейни", art: () => cupSvg(0, 0) },
      menuPick(["autumn", "classic", "cacaoraf", "cold", "milkshake", "tea"])),
    dessert: Object.assign({ label: "Десерт", title: "Выберите десерт", hint: "К чаю или кофе", art: () => dessertSvg(0, 0) },
      menuPick(["dessert", "corpus"], true)),
    choco: Object.assign({ label: "Шоколад", title: "Выберите шоколад", hint: "Конфеты ручной работы", art: () => candySvg(0, 0) },
      menuPick(["schaste", "chokome"])),
  };

  function addRow(k) {
    const K = ADD_KINDS[k], mine = S.adds.filter((a) => a.k === k);
    const list = mine.length ? `<ul class="bc-picked">` + mine.map((a) =>
      `<li><span>${esc(a.name)}${a.qty > 1 ? " × " + a.qty : ""}</span><b>${money(a.price * a.qty)}</b><button type="button" data-add-del="${esc(a.key)}" aria-label="Убрать">×</button></li>`).join("") + "</ul>" : "";
    return `<div class="bc-extra bc-extra--wide">${icon(k)}
      <div class="bc-extra__info"><b>${K.label}</b><span>${K.hint}</span></div>
      <button type="button" class="bc-pickbtn" data-pick="${k}">${mine.length ? "+ Ещё" : "Выбрать"}</button>${list}</div>`;
  }

  function closePick() {
    const box = document.getElementById("bcPick");
    if (!box) return;
    box.classList.remove("is-open");
    document.documentElement.classList.remove("bc-lock");
    setTimeout(() => box.remove(), 260);
  }
  function openPick(k) {
    const K = ADD_KINDS[k];
    if (!K || document.getElementById("bcPick")) return;
    let options = [];
    const box = document.createElement("div");
    box.id = "bcPick"; box.className = "bc-pick";
    box.innerHTML = `<div class="bc-pick__back" data-pick-close></div>
      <div class="bc-pick__panel" role="dialog" aria-modal="true" aria-label="${esc(K.title)}">
        <div class="bc-pick__head"><span class="bc-pick__grip" aria-hidden="true"></span><p class="bc-pick__title">${esc(K.title)}</p>
          <button type="button" class="bc-pick__close" data-pick-close aria-label="Закрыть">×</button></div>
        <div class="bc-pick__body"><p class="bc-pick__msg">Загружаем…</p></div></div>`;
    document.body.appendChild(box);
    document.documentElement.classList.add("bc-lock");
    void box.offsetWidth; box.classList.add("is-open");

    box.addEventListener("click", (e) => {
      if (e.target.closest("[data-pick-close]")) { closePick(); return; }
      const card = e.target.closest(".bc-pc");
      const o = card && options[+card.dataset.i];
      if (!o) return;
      const sb = e.target.closest("[data-size]");
      if (sb) {
        card.dataset.s = sb.dataset.size;
        card.querySelectorAll("[data-size]").forEach((b) => b.classList.toggle("is-on", b === sb));
        card.querySelector(".bc-pc__price").textContent = money(o.sizes[+sb.dataset.size].price);
        return;
      }
      const add = e.target.closest("[data-pc-add]");
      if (!add) return;
      const sz = o.sizes[+(card.dataset.s || 0)];
      const key = k + ":" + o.id + ":" + (sz.label || "");
      const have = S.adds.find((a) => a.key === key);
      if (have) have.qty++;
      else S.adds.push({ key, k, name: o.name + (sz.label ? " · " + sz.label : ""), price: sz.price, qty: 1 });
      save(); renderPanel(); drawStage(); updateBar();
      add.textContent = "✓ Добавлено"; add.classList.add("is-added");
      setTimeout(closePick, 450);
    });

    const body = box.querySelector(".bc-pick__body");
    K.load().then((list) => {
      options = list || [];
      if (!options.length) { body.innerHTML = '<p class="bc-pick__msg">Не удалось загрузить. Попробуйте ещё раз чуть позже.</p>'; return; }
      let html = "", group = null;
      options.forEach((o, i) => {
        const g = o.group || "";
        if (g !== group) {
          if (group !== null) html += "</div>";
          if (g) html += `<p class="bc-pick__group">${esc(g)}</p>`;
          html += K.rows ? '<div class="bc-pick__list">' : '<div class="bc-pick__grid">';
          group = g;
        }
        const sizes = o.sizes.length > 1 ? '<div class="bc-pc__sizes">' + o.sizes.map((sz, n) =>
          `<button type="button" class="${n ? "" : "is-on"}" data-size="${n}">${esc(sz.label || "№" + (n + 1))}</button>`).join("") + "</div>" : "";
        if (K.rows) {
          html += `<div class="bc-pc bc-pc--row" data-i="${i}"><div class="bc-pc__info"><p class="bc-pc__name">${esc(o.name)}</p>${sizes}</div>
            <p class="bc-pc__price">${money(o.sizes[0].price)}</p><button type="button" class="bc-pc__add" data-pc-add>Добавить</button></div>`;
          return;
        }
        const photo = o.image ? `<img src="${esc(o.image)}" alt="${esc(o.name)}" loading="lazy">` : `<span style="background:${esc(o.bg || "#f6f3ef")}"></span>`;
        html += `<div class="bc-pc" data-i="${i}"><div class="bc-pc__photo">${photo}</div><p class="bc-pc__name">${esc(o.name)}</p>${sizes}
          <p class="bc-pc__price">${money(o.sizes[0].price)}</p><button type="button" class="bc-pc__add" data-pc-add>Добавить</button></div>`;
      });
      body.innerHTML = html + "</div>";
    });
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePick(); });

  function renderPanel() {
    $$(".bc-tabs button").forEach((b) => b.classList.toggle("is-on", b.dataset.tab === S.tab));
    let h = "";
    if (S.tab === "flowers") {
      const n = stems();
      h = (n ? `<div class="bc-clear"><span>В букете ${flowersWord(n)}</span><button type="button" data-clear>Очистить всё</button></div>` : "") +
        D.flowers.filter((fl) => fl.inStock !== false).map(flowerRow).join("");
    } else if (S.tab === "extras") {
      const b = branches();
      h = `<div class="bc-extra">${icon("green")}
          <div class="bc-extra__info"><b>Зелень</b><span>${b} ${plural(b, "ветка", "ветки", "веток")} — по одной на 10 цветов · ${money(b * V.greenPerBranch)}</span></div>
          ${toggle("green", S.green, [[false, "Нет"], [true, "Есть"]])}</div>
        <div class="bc-extra bc-extra--wide">${icon("card")}
          <div class="bc-extra__info"><b>Открытка с вашим текстом</b><span>Бесплатно — флорист напишет от руки</span></div>
          ${toggle("card", S.card, [[false, "Нет"], [true, "Добавить"]])}
          ${S.card ? `<textarea class="bc-cardtext" id="bcCardText" maxlength="120" placeholder="Текст открытки, например: «С днём рождения, мама!»">${esc(S.cardText)}</textarea>` : ""}</div>` +
        Object.keys(ADD_KINDS).map(addRow).join("");
    } else {
      const ls = lines(), n = stems(), ok = n >= D.minStems;
      h = ls.length ? `<ul class="bc-sum">` + ls.map((l) => `<li><span>${esc(l.t)}${l.n ? ` × ${l.n}` : ""}</span><b>${l.sum ? money(l.sum) : "бесплатно"}</b></li>`).join("") +
        `<li class="bc-sum__total"><span>Итого</span><b>${money(total())}</b></li></ul>` : `<p class="bc-empty">Добавьте цветы во вкладке «Цветы».</p>`;
      h += `<div class="bc-send"><button type="button" class="bc-btn bc-btn--pink" data-send${ok ? "" : " disabled"}>Отправить заявку</button>
        <p>${ok ? "Флорист перезвонит, уточнит детали и соберёт букет по вашей схеме." : `Добавьте хотя бы ${D.minStems} цветка, чтобы отправить заявку.`}</p></div>`;
    }
    /* шаги 1 и 2 заканчиваются кнопкой «Дальше» */
    if (S.tab === "flowers") h += `<button type="button" class="bc-next" data-next="extras">Дальше: дополнения →</button>`;
    if (S.tab === "extras") h += `<button type="button" class="bc-next" data-next="sum">Дальше: состав и заявка →</button>`;
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
        /* строка «Очистить всё» — появляется с первым цветком, счётчик обновляется */
        const bar = $(".bc-clear");
        if (!stems() !== !bar) renderPanel();
        else if (bar) bar.firstElementChild.textContent = "В букете " + flowersWord(stems());
        drawStage(); updateBar();
      }
      return;
    }
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.pick) { openPick(t.dataset.pick); return; }
    if (t.dataset.next) { goTab(t.dataset.next); return; }
    if (t.hasAttribute("data-send")) { if (stems() >= D.minStems) openSheet(); return; }
    if (t.hasAttribute("data-clear")) {
      S.sel = {}; Object.keys(colorPick).forEach((id) => delete colorPick[id]);
      save(); renderPanel(); drawStage(); updateBar(); toast("Все цветы убраны из букета");
      return;
    }
    if (t.dataset.addDel != null) S.adds = S.adds.filter((a) => a.key !== t.dataset.addDel);
    else if (t.dataset.green != null) S.green = t.dataset.green === "true";
    else if (t.dataset.card != null) S.card = t.dataset.card === "true";
    else return;
    save(); renderPanel(); drawStage(); updateBar();
    if (t.dataset.card === "true") { const ta = $("#bcCardText"); if (ta) ta.focus(); }
  });

  function goTab(tab) {
    S.tab = tab; save(); renderPanel();
    const tabs = $(".bc-tabs"), y = tabs.getBoundingClientRect().top;
    if (y < 0 || y > innerHeight * 0.6) window.scrollTo({ top: scrollY + y - (parseInt(getComputedStyle(root).getPropertyValue("--bc-top"), 10) || 70) - 10, behavior: "smooth" });
  }
  $$(".bc-tabs button").forEach((b) => b.addEventListener("click", () => goTab(b.dataset.tab)));

  /* ════════ сцена, подпись, нижняя панель ════════ */
  const stage = $("#bcStage");
  function drawStage() {
    stage.innerHTML = compose();
    const n = stems();
    $("#bcLabel").textContent = n ? `${flowersWord(n)} · ${tier(n)} · ${money(total())}` : "Букет пуст";
  }
  /* подпись под букетом: сколько цветов, какой букет и сумма */
  function updateBar() {
    const n = stems();
    $("#bcLabel").textContent = n ? `${flowersWord(n)} · ${tier(n)} · ${money(total())}` : "Букет пуст";
  }


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
    const details = "Состав букета:\n" + lines().map((l) => "• " + l.t + (l.n ? " × " + l.n : "") + " — " + (l.sum ? money(l.sum) : "бесплатно")).join("\n") +
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

  /* Телефон: букет «прилипает» под шапкой, вкладки — под букетом.
     Шапка сайта прячется/появляется при прокрутке, поэтому меряем её на ходу. */
  const siteTop = document.getElementById("siteTop");
  const leftBox = $(".bc-left");
  function stick() {
    const top = siteTop ? Math.max(0, Math.round(siteTop.getBoundingClientRect().bottom)) : 0;
    root.style.setProperty("--bc-top", top + "px");
    root.style.setProperty("--bc-left-h", leftBox.offsetHeight + "px");
  }
  window.addEventListener("scroll", stick, { passive: true });
  window.addEventListener("resize", stick);
  if (window.ResizeObserver) new ResizeObserver(stick).observe(leftBox);

  renderPanel();
  drawStage();
  updateBar();
  stick();
})();
