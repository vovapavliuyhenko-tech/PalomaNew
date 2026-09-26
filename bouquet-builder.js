/* ════════════════════════════════════════════════════════
   bouquet-builder.js — конструктор авторского букета

   Эскиз букета рисуется «от руки» в SVG: сначала тонкий контур
   (чёрно-белая раскраска), затем каждый выбор клиента заливает
   свою часть акварельным разливом — цветы, зелень, упаковку.

   Слои эскиза (снизу вверх):
     упаковка сзади → зелень → стебли → цветы → упаковка спереди
   У каждого элемента три слоя: белая подложка, краска (под маской,
   которая «растекается» из центра) и контур (прорисовывается штрихом).

   Готовый эскиз уходит менеджеру через palomaSendLead (lead-send.js):
   полный состав + ссылка, по которой открывается тот же эскиз.
   ════════════════════════════════════════════════════════ */
(function PalomaBouquetBuilder() {
  "use strict";

  const D = window.PALOMA_BUILDER_DATA;
  const svg = document.getElementById("bbSvg");
  if (!D || !svg) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CX = 300;
  const CY = 330;
  const WRAP_TIP = 705;
  const INK = "#2a2522";
  const STORE_KEY = "paloma_builder_draft";

  /* ── справочники ─────────────────────────────────────── */
  const byId = (list, key) => Object.fromEntries(list.map((x) => [x[key], x]));
  const SIZES = byId(D.sizes, "code");
  const STYLES = byId(D.styles, "code");
  const PALETTES = byId(D.palettes, "code");
  const FLOWERS = byId(D.flowers, "id");
  const GREENS = byId(D.greens, "id");
  const AMOUNTS = byId(D.greenAmounts, "code");
  const WRAPS = byId(D.wraps, "id");
  const FLORIST_MIX = ["pion-rose", "eustoma", "spray", "rose"];

  /* ── состояние ───────────────────────────────────────── */
  const DEFAULT_STATE = {
    size: "M",
    style: "dome",
    palette: null,       /* код палитры или "custom" */
    custom: [],          /* цвета своей палитры */
    flowers: [],         /* id цветов, первый — акцент */
    florist: false,      /* «доверяю флористу» */
    green: null,
    amount: "mid",
    wrap: null,
    wrapColor: 0,
    ribbon: "auto",
    card: false,
    cardText: "",
    date: "",
    receive: "delivery",
    comment: "",
    seed: 1 + Math.floor(Math.random() * 1e6),
  };
  let state = Object.assign({}, DEFAULT_STATE);

  /* ════════════════════════════════════════════════════════
     Утилиты
     ════════════════════════════════════════════════════════ */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const f1 = (n) => Math.round(n * 10) / 10;
  const TAU = Math.PI * 2;

  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex(r) {
    return "#" + r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  }
  function mix(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
  }
  /* Тень лепестка: к глубине цветка краска темнеет и чуть «теплеет» */
  function shade(color, tone) {
    if (!tone) return color;
    return mix(color, mix(color, "#3b1d26", 0.5), tone);
  }
  const fmt = (n) => n.toLocaleString("ru-RU") + " ₽";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ════════════════════════════════════════════════════════
     Геометрия: примитивы
     Каждая фигура — { fills: [{d, tone, t, fix, alt}], inks: [{d, t}] }
     fills по умолчанию тоже обводятся контуром.
     ════════════════════════════════════════════════════════ */
  function bumpy(r, n, bulge, rot, jit, R) {
    const pts = [];
    for (let k = 0; k < n; k++) {
      const a = rot + (TAU * k) / n;
      const rr = r * (1 + (R ? (R() - 0.5) * jit : 0));
      pts.push([Math.cos(a) * rr, Math.sin(a) * rr, a]);
    }
    let d = "M" + f1(pts[0][0]) + " " + f1(pts[0][1]);
    for (let k = 0; k < n; k++) {
      const p = pts[k], q = pts[(k + 1) % n];
      let am = (p[2] + (k === n - 1 ? q[2] + TAU : q[2])) / 2;
      const rc = r * (1 + bulge);
      d += "Q" + f1(Math.cos(am) * rc) + " " + f1(Math.sin(am) * rc) + " " + f1(q[0]) + " " + f1(q[1]);
    }
    return d + "Z";
  }
  function jagged(r, n, depth, rot, R) {
    let d = "";
    for (let k = 0; k < n * 2; k++) {
      const a = rot + (Math.PI * k) / n;
      const rr = r * (k % 2 ? 1 - depth : 1) * (1 + (R() - 0.5) * 0.08);
      d += (k ? "L" : "M") + f1(Math.cos(a) * rr) + " " + f1(Math.sin(a) * rr);
    }
    return d + "Z";
  }
  const circle = (r, x, y) =>
    "M" + f1((x || 0) - r) + " " + f1(y || 0) + "a" + f1(r) + " " + f1(r) + " 0 1 0 " + f1(r * 2) + " 0a" + f1(r) + " " + f1(r) + " 0 1 0 " + f1(-r * 2) + " 0Z";
  const ellipse = (rx, ry, x, y) =>
    "M" + f1(x - rx) + " " + f1(y) + "a" + f1(rx) + " " + f1(ry) + " 0 1 0 " + f1(rx * 2) + " 0a" + f1(rx) + " " + f1(ry) + " 0 1 0 " + f1(-rx * 2) + " 0Z";
  /* Лепесток «вверх» из точки 0,0: округлый или заострённый */
  function petal(len, w, pointed) {
    const tip = pointed ? 0.82 : 0.95;
    return "M0 0C" + f1(w) + " " + f1(-len * 0.3) + " " + f1(w * (pointed ? 0.55 : 0.95)) + " " + f1(-len * tip) +
      " 0 " + f1(-len) + "C" + f1(-w * (pointed ? 0.55 : 0.95)) + " " + f1(-len * tip) + " " + f1(-w) + " " + f1(-len * 0.3) + " 0 0Z";
  }
  /* Дужка-складка между точками на окружности — «рисунок» лепестка */
  function fold(r1, a1, r2, a2, bend) {
    const x1 = Math.cos(a1) * r1, y1 = Math.sin(a1) * r1;
    const x2 = Math.cos(a2) * r2, y2 = Math.sin(a2) * r2;
    const am = (a1 + a2) / 2, rm = ((r1 + r2) / 2) * bend;
    return "M" + f1(x1) + " " + f1(y1) + "Q" + f1(Math.cos(am) * rm) + " " + f1(Math.sin(am) * rm) + " " + f1(x2) + " " + f1(y2);
  }

  /* ════════════════════════════════════════════════════════
     Цветы. r — радиус головки, R — генератор случайностей.
     ════════════════════════════════════════════════════════ */
  const SHAPES = {
    rose(r, R) {
      const rot = R() * TAU;
      const fills = [
        { d: bumpy(r, 6, 0.16, rot, 0.1, R), tone: 0, glow: true },
        { d: bumpy(r * 0.74, 5, 0.2, rot + 0.5, 0.1, R), tone: 0.22 },
        { d: bumpy(r * 0.5, 4, 0.24, rot + 1.1, 0.1, R), tone: 0.4 },
        { d: bumpy(r * 0.27, 3, 0.32, rot + 1.7, 0.1, R), tone: 0.6 },
      ];
      const inks = [];
      for (let k = 0; k < 5; k++) {
        const a = rot + (TAU * k) / 5 + 0.3;
        inks.push({ d: fold(r * 0.95, a, r * 0.62, a + 0.9, 0.78) });
      }
      inks.push({ d: "M" + f1(r * 0.12) + " 0A" + f1(r * 0.12) + " " + f1(r * 0.12) + " 0 1 0 0 " + f1(r * 0.13) });
      return { fills, inks };
    },

    peony(r, R) {
      const rot = R() * TAU;
      const fills = [];
      const L = [[1, 9, 0.12], [0.84, 8, 0.14], [0.68, 8, 0.16], [0.52, 7, 0.18], [0.36, 6, 0.22], [0.2, 5, 0.26]];
      L.forEach((l, i) => fills.push({ d: bumpy(r * l[0], l[1], l[2], rot + i * 0.7, 0.14, R), tone: i * 0.11, glow: i === 0 }));
      const inks = [];
      for (let k = 0; k < 7; k++) {
        const a = rot + (TAU * k) / 7;
        inks.push({ d: fold(r * 0.9, a, r * 0.45, a + 0.5, 0.85) });
      }
      return { fills, inks };
    },

    ranunculus(r, R) {
      const rot = R() * TAU;
      const fills = [];
      for (let i = 0; i < 7; i++) {
        const k = 1 - i * 0.13;
        fills.push({ d: bumpy(r * k, 12 - i, 0.07, rot + i * 0.4, 0.06, R), tone: i * 0.09, glow: i === 0 });
      }
      fills.push({ d: circle(r * 0.1), tone: 0, fix: "#6f7d4a" });
      return { fills, inks: [] };
    },

    carnation(r, R) {
      const rot = R() * TAU;
      return {
        fills: [
          { d: jagged(r, 26, 0.12, rot, R), tone: 0, glow: true },
          { d: jagged(r * 0.72, 20, 0.14, rot + 0.2, R), tone: 0.2 },
          { d: jagged(r * 0.45, 14, 0.18, rot + 0.4, R), tone: 0.4 },
        ],
        inks: [],
      };
    },

    chrys(r, R) {
      const rot = R() * TAU;
      const fills = [{ d: circle(r * 0.98), tone: 0.35, glow: true }];
      const rings = [[22, 1, 0.14, 0], [16, 0.74, 0.15, 0.2], [11, 0.5, 0.16, 0.38]];
      rings.forEach((g, gi) => {
        for (let k = 0; k < g[0]; k++) {
          const a = rot + (360 * k) / g[0] + gi * 7;
          fills.push({ d: petal(r * g[1], r * g[2], false), tone: g[3], t: "rotate(" + f1(a) + ")" });
        }
      });
      fills.push({ d: circle(r * 0.17), tone: 0.6 });
      return { fills, inks: [] };
    },

    dahlia(r, R) {
      const rot = R() * 360;
      const fills = [];
      const rings = [[16, 1, 0.2, 0], [12, 0.74, 0.19, 0.18], [9, 0.5, 0.17, 0.34], [6, 0.3, 0.14, 0.5]];
      rings.forEach((g, gi) => {
        for (let k = 0; k < g[0]; k++) {
          const a = rot + (360 * k) / g[0] + gi * 11;
          fills.push({ d: petal(r * g[1], r * g[2], true), tone: g[3], t: "rotate(" + f1(a) + ")", glow: gi === 0 && k === 0 });
        }
      });
      fills.push({ d: circle(r * 0.1), tone: 0.65 });
      return { fills, inks: [] };
    },

    eustoma(r, R) {
      const rot = R() * TAU;
      const inks = [];
      for (let k = 0; k < 5; k++) {
        const a = rot + (TAU * k) / 5;
        inks.push({ d: fold(r * 0.3, a, r * 0.95, a + 0.35, 1.05) });
      }
      return {
        fills: [
          { d: bumpy(r, 5, 0.3, rot, 0.08, R), tone: 0, glow: true },
          { d: bumpy(r * 0.55, 4, 0.34, rot + 0.4, 0.1, R), tone: 0.25 },
          { d: bumpy(r * 0.26, 3, 0.4, rot + 0.9, 0.1, R), tone: 0.45 },
        ],
        inks,
      };
    },

    hydrangea(r, R) {
      const fills = [{ d: bumpy(r * 0.96, 11, 0.1, R() * TAU, 0.1, R), tone: 0.45, glow: true }];
      const inks = [];
      const n = 17;
      for (let i = 0; i < n; i++) {
        const rr = r * 0.74 * Math.sqrt((i + 0.5) / n);
        const a = i * 2.39996;
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        const fr = r * (0.2 + R() * 0.04);
        fills.push({ d: bumpy(fr, 4, 0.62, R() * TAU, 0.1, R), tone: R() * 0.22, alt: i % 3 === 0, t: "translate(" + f1(x) + " " + f1(y) + ")" });
        inks.push({ d: circle(r * 0.025, x, y) });
      }
      return { fills, inks };
    },

    spray(r, R) {
      const fills = [], inks = [];
      const spots = [[-0.42, -0.2, 0.46], [0.4, -0.3, 0.42], [0.02, 0.36, 0.44], [0.55, 0.42, 0.22], [-0.6, 0.45, 0.2]];
      spots.forEach((s, i) => {
        const t = "translate(" + f1(s[0] * r) + " " + f1(s[1] * r) + ")";
        if (s[2] < 0.3) {
          fills.push({ d: ellipse(r * s[2] * 0.7, r * s[2], 0, 0), tone: 0.3, t: t + " rotate(" + f1(R() * 60 - 30) + ")" });
        } else {
          const m = SHAPES.rose(r * s[2], R);
          m.fills.forEach((f) => fills.push(Object.assign({}, f, { t, glow: f.glow && i === 0 })));
          m.inks.forEach((k) => inks.push(Object.assign({}, k, { t })));
        }
      });
      return { fills, inks };
    },

    matthiola(r, R) {
      const fills = [];
      const steps = 7;
      for (let i = 0; i < steps; i++) {
        const y = r * 0.3 - (i * r * 1.45) / steps;
        const w = r * (0.42 - i * 0.04);
        const side = i % 2 ? 1 : -1;
        fills.push({ d: bumpy(w, 5, 0.34, R() * TAU, 0.12, R), tone: i * 0.06, t: "translate(" + f1(side * w * 0.35) + " " + f1(y) + ")", glow: i === 0 });
      }
      return { fills, inks: [{ d: "M0 " + f1(r * 0.4) + "L0 " + f1(-r * 1.2) }] };
    },

    berries(r, R) {
      const fills = [], inks = [];
      const n = 8;
      for (let i = 0; i < n; i++) {
        const rr = r * 0.62 * Math.sqrt((i + 0.5) / n);
        const a = i * 2.39996 + R();
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        const br = r * (0.26 + R() * 0.06);
        fills.push({ d: ellipse(br * 0.9, br, x, y), tone: R() * 0.25, glow: i === 0, alt: i % 4 === 1 });
        inks.push({ d: "M" + f1(x - br * 0.18) + " " + f1(y - br * 0.72) + "l" + f1(br * 0.36) + " " + f1(-br * 0.2) });
      }
      return { fills, inks };
    },

    cotton(r, R) {
      const rot = R() * 360;
      const fills = [];
      for (let k = 0; k < 5; k++) {
        fills.push({ d: petal(r * 1.05, r * 0.2, true), fix: "#6b4a33", tone: 0, t: "rotate(" + f1(rot + k * 72 + 36) + ")" });
      }
      for (let k = 0; k < 4; k++) {
        const a = (rot * Math.PI) / 180 + (TAU * k) / 4;
        fills.push({ d: bumpy(r * 0.45, 7, 0.12, R() * TAU, 0.1, R), fix: "#fbf8f2", tone: 0, t: "translate(" + f1(Math.cos(a) * r * 0.36) + " " + f1(Math.sin(a) * r * 0.36) + ")", glow: k === 0 });
      }
      return { fills, inks: [] };
    },
  };

  /* Базовый радиус головки на эскизе */
  const HEAD_R = { rose: 33, peony: 42, ranunculus: 30, carnation: 29, chrys: 37, dahlia: 40, eustoma: 32, hydrangea: 50, spray: 38, matthiola: 30, berries: 25, cotton: 27 };

  /* ── Зелень: веточка «вверх» из 0,0, длина len ──────── */
  const SPRIGS = {
    eucalyptus(len, R) {
      const fills = [], inks = [{ d: "M0 0Q" + f1(len * 0.08) + " " + f1(-len * 0.5) + " 0 " + f1(-len) }];
      const n = 7;
      for (let i = 1; i <= n; i++) {
        const y = -(len * i) / (n + 0.6);
        const side = i % 2 ? 1 : -1;
        const r = len * (0.11 - i * 0.006);
        fills.push({ d: circle(r, side * r * 0.95, y), tone: R() * 0.25 });
      }
      return { fills, inks };
    },
    pistacia(len, R) {
      const fills = [], inks = [{ d: "M0 0Q" + f1(-len * 0.06) + " " + f1(-len * 0.5) + " 0 " + f1(-len) }];
      const n = 5;
      for (let i = 1; i <= n; i++) {
        const y = -(len * i) / (n + 0.5);
        [-1, 1].forEach((s) => fills.push({ d: petal(len * 0.2, len * 0.055, false), tone: R() * 0.3, t: "translate(0 " + f1(y) + ") rotate(" + s * 58 + ")" }));
      }
      fills.push({ d: petal(len * 0.2, len * 0.055, false), tone: 0.1, t: "translate(0 " + f1(-len * 0.97) + ")" });
      return { fills, inks };
    },
    ruscus(len, R) {
      const fills = [], inks = [{ d: "M0 0L0 " + f1(-len) }];
      const n = 6;
      for (let i = 1; i <= n; i++) {
        const y = -(len * i) / (n + 0.4);
        const s = i % 2 ? 1 : -1;
        fills.push({ d: petal(len * 0.26, len * 0.07, true), tone: R() * 0.25, t: "translate(0 " + f1(y) + ") rotate(" + s * 40 + ")" });
      }
      return { fills, inks };
    },
    pampas(len, R) {
      /* Пушистая метёлка: несколько перекрывающихся «перьев» */
      const fills = [];
      const inks = [{ d: "M0 0L0 " + f1(-len * 0.3) }];
      for (let i = 0; i < 5; i++) {
        const y = -len * (0.32 + i * 0.13);
        const w = len * (0.15 - i * 0.018);
        const tilt = (i % 2 ? 1 : -1) * (8 + R() * 8);
        fills.push({ d: petal(len * 0.34, w, false), tone: i * 0.05 + R() * 0.08, t: "translate(0 " + f1(y + len * 0.1) + ") rotate(" + f1(tilt) + ")", glow: i === 0 });
      }
      for (let i = 0; i < 7; i++) {
        const y = -len * (0.36 + i * 0.09);
        const sx = i % 2 ? 1 : -1;
        inks.push({ d: "M" + f1(sx * len * 0.02) + " " + f1(y) + "q" + f1(sx * len * 0.06) + " " + f1(-len * 0.03) + " " + f1(sx * len * 0.09) + " " + f1(-len * 0.09) });
      }
      return { fills, inks };
    },
  };

  /* ════════════════════════════════════════════════════════
     Раскладка букета
     ════════════════════════════════════════════════════════ */
  function paletteColors() {
    if (state.palette === "custom") return state.custom.length ? state.custom : null;
    return state.palette ? PALETTES[state.palette].colors : null;
  }
  function activeFlowers() {
    const list = state.flowers.filter((id) => FLOWERS[id] && FLOWERS[id].inStock);
    return list.length ? list : FLORIST_MIX.filter((id) => FLOWERS[id] && FLOWERS[id].inStock);
  }
  function domeR() {
    return { S: 108, M: 132, L: 160, XL: 188 }[state.size];
  }

  function layout() {
    const R = mulberry32(state.seed);
    const size = SIZES[state.size];
    const airy = state.style === "airy";
    const Rd = domeR();
    const n = size.stems;
    const kinds = activeFlowers();
    /* В коробке и корзине цветы сидят ниже и плотнее — прямо у бортика */
    const boxed = state.wrap === "hatbox" || state.wrap === "basket";
    const cy = boxed ? CY + Rd * 0.3 : CY;
    const sy = boxed ? 0.62 : 0.8;

    /* Сколько головок каждого цветка: акцент (первый) — вдвое больше */
    const weights = kinds.map((id, i) => (i === 0 ? 1.9 : 1) / (FLOWERS[id].kind === "hydrangea" ? 1.6 : 1));
    const sum = weights.reduce((a, b) => a + b, 0);
    let pool = [];
    kinds.forEach((id, i) => {
      const c = Math.max(1, Math.round((weights[i] / sum) * n));
      for (let k = 0; k < c; k++) pool.push(id);
    });
    while (pool.length > n) pool.splice(pool.lastIndexOf(pool[pool.length - 1]), 1);
    while (pool.length < n) pool.push(kinds[0]);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(R() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const hi = pool.indexOf(kinds[0]);
    if (hi > 0) [pool[0], pool[hi]] = [pool[hi], pool[0]];

    /* Цвета: каждому виду цветов — 1–2 оттенка палитры */
    const pal = paletteColors() || ["#ffffff"];
    const kindColors = {};
    kinds.forEach((id, i) => {
      kindColors[id] = [pal[i % pal.length], pal[(i + 2) % pal.length]];
    });

    const heads = [];
    const turn = R() * TAU;
    const scaleBySize = { S: 0.94, M: 1, L: 1.04, XL: 1.07 }[state.size];
    for (let i = 0; i < n; i++) {
      const id = pool[i];
      const kind = FLOWERS[id].kind;
      const rr = Rd * 0.9 * Math.sqrt((i + 0.5) / n);
      const th = i * 2.39996 + turn;
      let x = CX + Math.cos(th) * rr * 1.14 + (R() - 0.5) * (airy ? 34 : 10);
      let y = cy + Math.sin(th) * rr * sy + (R() - 0.5) * (airy ? 30 : 8);
      let raised = false;
      if (airy && y < cy && R() < 0.45) { y -= 30 + R() * 55; raised = true; }
      const r = HEAD_R[kind] * scaleBySize * (airy ? 0.85 + R() * 0.4 : 0.9 + R() * 0.2);
      const cols = kindColors[id];
      const color = cols[R() < 0.72 ? 0 : 1];
      const color2 = cols[1] === color ? cols[0] : cols[1];
      let rot = R() * 360;
      if (kind === "matthiola") rot = (Math.atan2(y - cy - 40, x - CX) * 180) / Math.PI + 90 + (R() - 0.5) * 20;
      heads.push({ id, kind, x, y, r, rot, color, color2, raised });
    }
    /* Плотность: мелкие цветы (ягоды, хлопок) оставляли дыры —
       подгоняем головки так, чтобы они закрывали купол с нахлёстом. */
    const dome = Math.PI * Rd * 1.03 * Rd * (boxed ? 0.6 : 0.72);
    const cover = heads.reduce((acc, h) => acc + Math.PI * h.r * h.r, 0);
    const k = Math.max(0.9, Math.min(1.7, Math.sqrt((dome * 1.25) / cover)));
    heads.forEach((h) => { h.r *= k; h.shape = SHAPES[h.kind](h.r, R); });
    heads.sort((a, b) => a.y - b.y);

    /* Зелень по краю купола (верх и бока — низ закрыт упаковкой) */
    const greens = [];
    const g = state.green === null ? GREENS.eucalyptus : GREENS[state.green];
    if (g && g.kind !== "none") {
      const count = Math.round(AMOUNTS[state.amount].count * (0.8 + Rd / 660));
      for (let i = 0; i < count; i++) {
        const a = Math.PI * (1.02 + (i / Math.max(1, count - 1)) * 0.96) + (R() - 0.5) * 0.18;
        const rr = Rd * (0.78 + R() * 0.2);
        const x = CX + Math.cos(a) * rr * 1.14;
        const y = cy + Math.sin(a) * rr * (boxed ? 0.7 : 0.82) + 12;
        const len = (g.kind === "pampas" ? 105 : 92) * (0.8 + R() * 0.45) * (airy ? 1.18 : 1) * (0.85 + Rd / 800);
        const rot = (a * 180) / Math.PI + 90 + (R() - 0.5) * 16;
        greens.push({ kind: g.kind, x, y, rot, len, color: g.color, shape: SPRIGS[g.kind](len, R) });
      }
    }
    return { heads, greens, Rd, airy, cy };
  }

  /* ════════════════════════════════════════════════════════
     Упаковка
     ════════════════════════════════════════════════════════ */
  function ribbonColor() {
    if (state.ribbon !== "auto") return state.ribbon;
    const pal = paletteColors();
    return pal ? pal[0] === "#FFFFFF" ? pal[1] : pal[0] : "#ffffff";
  }
  function wrapColor() {
    const w = WRAPS[state.wrap || "kraft"];
    const c = w.colors[state.wrapColor] || w.colors[0];
    return c ? c[1] : "#ffffff";
  }

  function bow(x, y, s) {
    const lp = (sx) => "M" + x + " " + y + "C" + f1(x + sx * 34 * s) + " " + f1(y - 30 * s) + " " + f1(x + sx * 58 * s) + " " + f1(y - 6 * s) + " " + f1(x + sx * 40 * s) + " " + f1(y + 10 * s) + "C" + f1(x + sx * 26 * s) + " " + f1(y + 20 * s) + " " + f1(x + sx * 10 * s) + " " + f1(y + 6 * s) + " " + x + " " + y + "Z";
    const tail = (sx) => "M" + f1(x - sx * 3) + " " + f1(y + 4) + "C" + f1(x + sx * 10 * s) + " " + f1(y + 40 * s) + " " + f1(x + sx * 6 * s) + " " + f1(y + 70 * s) + " " + f1(x + sx * 22 * s) + " " + f1(y + 96 * s) + "L" + f1(x + sx * 34 * s) + " " + f1(y + 88 * s) + "C" + f1(x + sx * 20 * s) + " " + f1(y + 62 * s) + " " + f1(x + sx * 24 * s) + " " + f1(y + 34 * s) + " " + f1(x + sx * 8) + " " + f1(y + 2) + "Z";
    return [
      { d: tail(-1), tone: 0.2, rib: true }, { d: tail(1), tone: 0.12, rib: true },
      { d: lp(-1), tone: 0.05, rib: true, glow: true }, { d: lp(1), tone: 0, rib: true },
      { d: ellipse(9 * s, 8 * s, x, y), tone: 0.25, rib: true },
    ];
  }

  function coneEdge(Rd, amp, R) {
    /* Верхний край бумаги — волна по дуге над куполом */
    const rx = Rd * 1.34, ry = Rd * 0.98;
    const pts = [];
    const n = 11;
    for (let k = 0; k <= n; k++) {
      const a = Math.PI * (1.08 + (0.84 * k) / n);
      const w = k % 2 ? 1 + amp : 1 - amp * 0.4;
      pts.push([CX + Math.cos(a) * rx * w, CY + 10 + Math.sin(a) * ry * w + (R() - 0.5) * amp * 30]);
    }
    return pts;
  }

  function buildWrap(Rd) {
    const R = mulberry32(state.seed + 7);
    const kind = WRAPS[state.wrap || "kraft"].kind;
    /* Каждая деталь — отдельный слой, чтобы линии задних деталей
       не просвечивали сквозь передние (клапаны, бант). */
    const back = { fills: [], inks: [] };
    const parts = [];
    let front = { fills: [], inks: [] };
    const cut = () => { if (front.fills.length) parts.push(front); front = { fills: [], inks: [] }; };
    const rib = (list) => { cut(); list.forEach((f) => front.fills.push(f)); cut(); };

    if (kind === "kraft" || kind === "film") {
      const amp = kind === "kraft" ? 0.07 : 0.03;
      const pts = coneEdge(Rd, amp, R);
      let d = "M" + CX + " " + WRAP_TIP + "L" + f1(pts[0][0]) + " " + f1(pts[0][1]);
      for (let k = 1; k < pts.length; k++) {
        const p = pts[k - 1], q = pts[k];
        d += "Q" + f1((p[0] + q[0]) / 2 + (R() - 0.5) * 8) + " " + f1((p[1] + q[1]) / 2 - 10) + " " + f1(q[0]) + " " + f1(q[1]);
      }
      back.fills.push({ d: d + "Z", tone: 0.28, glow: true });
      for (let k = 1; k < pts.length - 1; k += 2) {
        back.inks.push({ d: "M" + CX + " " + WRAP_TIP + "L" + f1(pts[k][0]) + " " + f1(pts[k][1] + 14) });
      }
      const yl = CY + Rd * 0.38, yr = CY + Rd * 0.32;
      cut();
      front.fills.push({ d: "M" + CX + " " + WRAP_TIP + "L" + f1(CX + Rd * 1.2) + " " + f1(yr) + "Q" + f1(CX + Rd * 0.45) + " " + f1(CY + Rd * 0.6) + " " + f1(CX - Rd * 0.2) + " " + f1(CY + Rd * 0.8) + "Z", tone: 0.14 });
      cut();
      front.fills.push({ d: "M" + CX + " " + WRAP_TIP + "L" + f1(CX - Rd * 1.2) + " " + f1(yl) + "Q" + f1(CX - Rd * 0.4) + " " + f1(CY + Rd * 0.64) + " " + f1(CX + Rd * 0.3) + " " + f1(CY + Rd * 0.74) + "Z", tone: 0, glow: true });
      if (kind === "kraft") {
        front.inks.push({ d: "M" + f1(CX - 14) + " " + (WRAP_TIP - 30) + "L" + f1(CX - Rd * 0.8) + " " + f1(yl + 30) });
        front.inks.push({ d: "M" + f1(CX + 20) + " " + (WRAP_TIP - 70) + "L" + f1(CX + Rd * 0.5) + " " + f1(CY + Rd * 0.66) });
      } else {
        front.inks.push({ d: "M" + f1(CX - Rd * 0.9) + " " + f1(yl + 40) + "Q" + f1(CX - Rd * 0.5) + " " + f1(yl + 60) + " " + f1(CX - Rd * 0.3) + " " + f1(yl + 110), sheen: true });
      }
      rib(bow(CX, 585, 1));
    } else if (kind === "hatbox" || kind === "basket") {
      const rx = Rd * (kind === "basket" ? 1.12 : 1.02), ry = Rd * 0.2;
      const yTop = CY + Rd * 0.68;
      const H = Math.min(WRAP_TIP - 10 - yTop, Rd * 0.95);
      if (kind === "basket") {
        const hy = CY - Rd * 1.55;
        back.fills.push({ d: "M" + f1(CX - rx * 0.92) + " " + f1(yTop) + "C" + f1(CX - rx * 0.92) + " " + f1(hy) + " " + f1(CX + rx * 0.92) + " " + f1(hy) + " " + f1(CX + rx * 0.92) + " " + f1(yTop) +
          "L" + f1(CX + rx * 0.8) + " " + f1(yTop) + "C" + f1(CX + rx * 0.8) + " " + f1(hy + 26) + " " + f1(CX - rx * 0.8) + " " + f1(hy + 26) + " " + f1(CX - rx * 0.8) + " " + f1(yTop) + "Z", tone: 0.15, glow: true });
      }
      back.fills.push({ d: ellipse(rx, ry, CX, yTop), tone: 0.55 });
      const bot = yTop + H;
      const bx = kind === "basket" ? rx * 0.8 : rx;
      front.fills.push({ d: "M" + f1(CX - rx) + " " + f1(yTop) + "L" + f1(CX - bx) + " " + f1(bot) + "A" + f1(bx) + " " + f1(ry) + " 0 0 0 " + f1(CX + bx) + " " + f1(bot) + "L" + f1(CX + rx) + " " + f1(yTop) + "A" + f1(rx) + " " + f1(ry) + " 0 0 1 " + f1(CX - rx) + " " + f1(yTop) + "Z", tone: 0, glow: true });
      if (kind === "basket") {
        for (let k = 1; k < 6; k++) {
          const y = yTop + (H * k) / 6, w = rx - (rx - bx) * (k / 6);
          front.inks.push({ d: "M" + f1(CX - w) + " " + f1(y) + "A" + f1(w) + " " + f1(ry) + " 0 0 0 " + f1(CX + w) + " " + f1(y) });
        }
        for (let k = -4; k <= 4; k++) {
          front.inks.push({ d: "M" + f1(CX + k * rx * 0.21) + " " + f1(yTop + ry * 0.95) + "L" + f1(CX + k * bx * 0.21) + " " + f1(bot + ry * 0.9) });
        }
        front.fills.push({ d: "M" + f1(CX - rx) + " " + f1(yTop) + "A" + f1(rx) + " " + f1(ry) + " 0 0 0 " + f1(CX + rx) + " " + f1(yTop) + "l0 12A" + f1(rx) + " " + f1(ry) + " 0 0 1 " + f1(CX - rx) + " " + f1(yTop + 12) + "Z", tone: 0.22 });
        rib(bow(CX - rx * 0.7, yTop + 16, 0.8));
      } else {
        const by = bot - H * 0.28;
        front.fills.push({ d: "M" + f1(CX - rx) + " " + f1(by) + "A" + f1(rx) + " " + f1(ry) + " 0 0 0 " + f1(CX + rx) + " " + f1(by) + "l0 18A" + f1(rx) + " " + f1(ry) + " 0 0 1 " + f1(CX - rx) + " " + f1(by + 18) + "Z", tone: 0.05, rib: true });
        rib(bow(CX + rx * 0.35, by + ry + 8, 0.8));
      }
    } else {
      /* На ленте: стебли видны, лента обвивает букет */
      front.fills.push({ d: "M" + (CX - 22) + " 552Q" + CX + " 562 " + (CX + 22) + " 552L" + (CX + 22) + " 582Q" + CX + " 592 " + (CX - 22) + " 582Z", tone: 0.1, rib: true });
      rib(bow(CX, 568, 0.9));
    }
    cut();
    return { back, parts, kind };
  }

  /* ════════════════════════════════════════════════════════
     Рендер в SVG
     ════════════════════════════════════════════════════════ */
  const BLOB = bumpy(1, 9, 0.14, 0.3, 0.2, mulberry32(42));
  let gen = 0;
  let model = null;

  function pathAttrs(x) {
    return 'd="' + x.d + '"' + (x.t ? ' transform="' + x.t + '"' : "");
  }

  /* item: { fills, inks, colorOf(f) } → строка группы с тремя слоями */
  function itemSVG(key, shape, colorOf, opts) {
    const id = "bbc" + gen + "_" + key;
    const o = opts || {};
    let base = "", paint = "", ink = "";
    shape.fills.forEach((f) => {
      base += "<path " + pathAttrs(f) + ' fill="#fff"/>';
      paint += "<path " + pathAttrs(f) + ' fill="' + colorOf(f) + '" data-tone="' + (f.tone || 0) + '"' +
        (f.fix ? ' data-fix="' + f.fix + '"' : "") + (f.alt ? ' data-alt="1"' : "") + (f.rib ? ' data-rib="1"' : "") + "/>";
      if (f.glow) paint += "<path " + pathAttrs(f) + ' fill="url(#bbGlow)"/>';
      ink += "<path " + pathAttrs(f) + ' pathLength="1"/>';
    });
    shape.inks.forEach((k) => {
      ink += "<path " + pathAttrs(k) + ' pathLength="1"' + (k.sheen ? ' class="bb-sheen"' : "") + "/>";
    });
    const clipT = o.origin ? "translate(" + o.origin[0] + " " + o.origin[1] + ") scale(0)" : "scale(0)";
    return '<g class="bb-item ' + (o.cls || "") + '" data-key="' + key + '"' + (o.t ? ' transform="' + o.t + '"' : "") + (o.delay != null ? ' style="--d:' + o.delay + 'ms"' : "") + ">" +
      '<clipPath id="' + id + '"><path class="bb-clip" d="' + BLOB + '" transform="' + clipT + '"/></clipPath>' +
      '<g class="bb-base">' + base + "</g>" +
      '<g class="bb-paint" clip-path="url(#' + id + ')"><g transform="translate(1.6 1.1)">' + paint + "</g></g>" +
      '<g class="bb-ink">' + ink + "</g></g>";
  }

  function headColor(h) {
    return (f) => (f.fix ? f.fix : shade(f.alt ? h.color2 : h.color, f.tone));
  }

  function render() {
    gen++;
    model = layout();
    model.wrap = buildWrap(model.Rd);
    const { heads, greens } = model;
    const bind = model.wrap.kind === "ribbon" ? 568 : 585;
    const dist = (x, y) => Math.hypot(x - CX, y - CY);

    let html = "";
    /* Тень-подложка */
    html += '<ellipse class="bb-ground" cx="' + CX + '" cy="728" rx="' + f1(model.Rd * 0.9) + '" ry="14"/>';

    const wc = wrapColor(), rc = ribbonColor();
    const wrapFill = (f) => (f.rib ? shade(rc, f.tone) : shade(wc, f.tone));
    if (model.wrap.back.fills.length) {
      html += itemSVG("wb", model.wrap.back, wrapFill, { cls: "bb-wrap", origin: [CX, WRAP_TIP], delay: 0 });
    }

    greens.forEach((g, i) => {
      html += itemSVG("g" + i, g.shape, (f) => shade(g.color, f.tone), {
        cls: "bb-green", t: "translate(" + f1(g.x) + " " + f1(g.y) + ") rotate(" + f1(g.rot) + ")",
        delay: 80 + Math.round(dist(g.x, g.y) * 1.4),
      });
    });

    /* Стебли */
    let stems = "";
    /* В коробке и корзине стебли спрятаны целиком */
    const boxed = model.wrap.kind === "hatbox" || model.wrap.kind === "basket";
    const showStems = !boxed && (model.wrap.kind === "ribbon" || model.airy);
    heads.forEach((h) => {
      if (boxed || (!showStems && !h.raised)) return;
      const bx = CX + (h.x - CX) * 0.08;
      stems += '<path d="M' + f1(h.x) + " " + f1(h.y) + "Q" + f1((h.x + bx) / 2) + " " + f1((h.y + bind) / 2 + 20) + " " + f1(bx) + " " + bind + "L" + f1(CX + (h.x - CX) * 0.05) + " " + (WRAP_TIP + 26) + '" pathLength="1"/>';
    });
    if (model.wrap.kind === "ribbon") {
      greens.forEach((g) => {
        const bx = CX + (g.x - CX) * 0.08;
        stems += '<path d="M' + f1(g.x) + " " + f1(g.y) + "Q" + f1((g.x + bx) / 2) + " " + f1((g.y + bind) / 2 + 20) + " " + f1(bx) + " " + bind + "L" + f1(CX + (g.x - CX) * 0.05) + " " + (WRAP_TIP + 26) + '" pathLength="1"/>';
      });
    }
    if (stems) html += '<g class="bb-stems">' + stems + "</g>";

    heads.forEach((h, i) => {
      html += itemSVG("h" + i, h.shape, headColor(h), {
        cls: "bb-head", t: "translate(" + f1(h.x) + " " + f1(h.y) + ") rotate(" + f1(h.rot) + ")",
        delay: 200 + Math.round(dist(h.x, h.y) * 2),
      });
    });

    model.wrap.parts.forEach((p, i) => {
      html += itemSVG("w" + i, p, wrapFill, { cls: "bb-wrap", origin: [CX, WRAP_TIP], delay: 120 + i * 60 });
    });

    const layer = svg.querySelector("#bbArt");
    layer.innerHTML = html;
    svg.classList.remove("bb-draw");
    void svg.getBoundingClientRect();
    clearTimeout(render.t);
    if (!reduceMotion) {
      svg.classList.add("bb-draw");
      /* Штрих нужен только на время прорисовки */
      render.t = setTimeout(() => svg.classList.remove("bb-draw"), 2200);
    }

    svg.classList.toggle("is-heads", !!paletteColors());

    /* Разлив краски — после прорисовки контура */
    const wait = reduceMotion ? 0 : 420;
    paintGroup(".bb-head", !!paletteColors(), wait, 1);
    paintGroup(".bb-green", state.green !== null, wait - 150, 1);
    paintGroup(".bb-wrap", state.wrap !== null, wait - 250, 1);
  }

  /* ── Анимация «растекания» краски ─────────────────────── */
  const tasks = new Set();
  let raf = 0;
  function tick(now) {
    tasks.forEach((t) => {
      const p = Math.min(1, Math.max(0, (now - t.start) / t.dur));
      const e = 1 - Math.pow(1 - p, 3);
      t.el.setAttribute("transform", t.pre + "scale(" + f1(t.to * e) + ")");
      if (p >= 1) { tasks.delete(t); if (t.done) t.done(); }
    });
    raf = tasks.size ? requestAnimationFrame(tick) : 0;
  }
  function spread(el, to, delay, dur, done) {
    const m = /translate\([^)]*\)\s*/.exec(el.getAttribute("transform") || "");
    const pre = m ? m[0] : "";
    tasks.forEach((t) => { if (t.el === el) tasks.delete(t); });
    if (reduceMotion) { el.setAttribute("transform", pre + "scale(" + to + ")"); if (done) done(); return; }
    tasks.add({ el, to, pre, start: performance.now() + Math.max(0, delay), dur, done });
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function maxScale(g) {
    if (g.classList.contains("bb-wrap")) return 900;
    const key = g.dataset.key;
    if (key[0] === "h") { const h = model.heads[+key.slice(1)]; return h.r * (h.kind === "matthiola" ? 2.6 : 2); }
    return model.greens[+key.slice(1)].len * 1.3;
  }
  function paintGroup(sel, on, baseDelay, stepMul) {
    svg.querySelectorAll(".bb-item" + sel).forEach((g) => {
      const clip = g.querySelector(".bb-clip");
      const d = parseFloat(g.style.getPropertyValue("--d")) || 0;
      if (on) spread(clip, maxScale(g), baseDelay + d * stepMul, 950);
      else spread(clip, 0, 0, 1);
    });
  }

  /* Перекраска без перерисовки: старый цвет остаётся снизу,
     новый растекается поверх. */
  function repaint(sel, colorOf) {
    svg.querySelectorAll(".bb-item" + sel).forEach((g) => {
      const paint = g.querySelector(".bb-paint");
      const clip = g.querySelector(".bb-clip");
      const shown = /scale\((?!0\))/.test(clip.getAttribute("transform") || "");
      let old = null;
      if (shown) {
        old = paint.cloneNode(true);
        old.removeAttribute("clip-path");
        old.classList.add("bb-old");
        paint.parentNode.insertBefore(old, paint);
      }
      paint.querySelectorAll("path[data-tone]").forEach((p) => {
        p.setAttribute("fill", colorOf(g, p));
      });
      const m = /translate\([^)]*\)\s*/.exec(clip.getAttribute("transform") || "");
      clip.setAttribute("transform", (m ? m[0] : "") + "scale(0)");
      const d = parseFloat(g.style.getPropertyValue("--d")) || 0;
      spread(clip, maxScale(g), d * 0.8, 900, () => { if (old) old.remove(); });
    });
  }

  function repaintHeads() {
    const pal = paletteColors();
    svg.classList.toggle("is-heads", !!pal);
    if (!pal) { paintGroup(".bb-head", false, 0, 0); return; }
    /* Цвета пересчитываются той же раскладкой (seed тот же) */
    const fresh = layout();
    model.heads.forEach((h, i) => { h.color = fresh.heads[i].color; h.color2 = fresh.heads[i].color2; });
    repaint(".bb-head", (g, p) => {
      const h = model.heads[+g.dataset.key.slice(1)];
      if (p.dataset.fix) return p.dataset.fix;
      return shade(p.dataset.alt ? h.color2 : h.color, +p.dataset.tone);
    });
    /* Лента «в тон» следует за палитрой */
    if (state.ribbon === "auto" && state.wrap !== null) repaintWrap();
  }
  function repaintWrap() {
    const wc = wrapColor(), rc = ribbonColor();
    repaint(".bb-wrap", (g, p) => shade(p.dataset.rib ? rc : wc, +p.dataset.tone));
  }

  /* ════════════════════════════════════════════════════════
     Цена
     ════════════════════════════════════════════════════════ */
  function price() {
    const size = SIZES[state.size];
    const kinds = activeFlowers();
    const prem = kinds.reduce((a, id, i) => a + FLOWERS[id].premium * (i === 0 ? 1.9 : 1), 0) /
      kinds.reduce((a, id, i) => a + (i === 0 ? 1.9 : 1), 0);
    let p = size.price * (state.florist || !state.flowers.length ? 1 : prem);
    if (state.green && state.green !== "none") p *= { light: 1, mid: 1.04, lush: 1.09 }[state.amount];
    if (state.style === "airy") p *= 1.03;
    const w = WRAPS[state.wrap || "kraft"];
    p += w.extra * (state.size === "XL" ? 1.3 : state.size === "L" ? 1.15 : 1);
    if (state.card) p += D.cardPrice;
    return Math.round(p / 100) * 100;
  }

  /* ════════════════════════════════════════════════════════
     Панель управления
     ════════════════════════════════════════════════════════ */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  function miniIcon(kind, isGreen) {
    const R = mulberry32(kind.length * 97);
    let shape, t;
    if (isGreen) { shape = SPRIGS[kind](40, R); t = "translate(24 45)"; }
    else { const r = kind === "matthiola" ? 13 : kind === "spray" ? 17 : 19; shape = SHAPES[kind](r, R); t = kind === "matthiola" ? "translate(24 32)" : "translate(24 24)"; }
    let s = "";
    shape.fills.forEach((f) => { s += "<path " + pathAttrs(f) + ' fill="#fff"/>'; });
    shape.fills.forEach((f) => { s += "<path " + pathAttrs(f) + ' fill="none"/>'; });
    shape.inks.forEach((k) => { s += "<path " + pathAttrs(k) + ' fill="none"/>'; });
    return '<svg class="bb-mini" viewBox="0 0 48 48" aria-hidden="true"><g transform="' + t + '">' + s + "</g></svg>";
  }

  function buildControls() {
    /* Размер: название, количество, цена */
    $("#bbSizes").innerHTML = D.sizes.map((s) =>
      '<button type="button" class="bb-opt bb-size" data-size="' + s.code + '" aria-pressed="false">' +
      '<span class="bb-opt__name">' + s.name + "</span>" +
      '<span class="bb-opt__meta">' + s.stems + " цветов</span>" +
      '<span class="bb-opt__price">от ' + fmt(s.price) + "</span></button>").join("");
    $("#bbStyles").innerHTML = D.styles.map((s) =>
      '<button type="button" class="bb-pill" data-style="' + s.code + '" aria-pressed="false">' + s.name + "</button>").join("");

    /* Палитры: кружок из пяти оттенков */
    const ring = (cols) => "conic-gradient(" + cols.map((c, i) => c + " " + (i * 100) / cols.length + "% " + ((i + 1) * 100) / cols.length + "%").join(",") + ")";
    $("#bbPalettes").innerHTML = D.palettes.map((p) =>
      '<button type="button" class="bb-opt bb-pal" data-palette="' + p.code + '" aria-pressed="false">' +
      '<span class="bb-pal__dot" style="background:' + ring(p.colors) + '"></span>' +
      '<span class="bb-opt__name">' + p.name + "</span></button>").join("") +
      '<button type="button" class="bb-opt bb-pal" data-palette="custom" aria-pressed="false">' +
      '<span class="bb-pal__dot bb-pal__dot--custom" id="bbCustomDot"></span><span class="bb-opt__name">Своя</span></button>';
    buildControls.ring = ring;
    $("#bbSwatches").innerHTML = D.swatches.map((c) =>
      '<button type="button" class="bb-swatch" data-swatch="' + c + '" style="--c:' + c + '" aria-label="Цвет ' + c + '" aria-pressed="false"></button>').join("");

    /* Цветы: только в наличии */
    $("#bbStockDate").textContent = D.stockUpdated;
    $("#bbFlowers").innerHTML = D.flowers.filter((f) => f.inStock).map((f) =>
      '<button type="button" class="bb-opt bb-tile" data-flower="' + f.id + '" aria-pressed="false" title="' + esc(f.note) + '">' +
      miniIcon(f.kind) + '<span class="bb-opt__name">' + f.name + "</span>" +
      '<span class="bb-tile__hero" aria-hidden="true">акцент</span></button>').join("");

    /* Зелень */
    $("#bbGreens").innerHTML = D.greens.map((g) =>
      '<button type="button" class="bb-opt bb-tile" data-green="' + g.id + '" aria-pressed="false">' +
      (g.kind === "none" ? '<svg class="bb-mini" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="12" fill="none"/><path d="M16 32L32 16" fill="none"/></svg>' : miniIcon(g.kind, true)) +
      '<span class="bb-opt__name">' + g.name + "</span></button>").join("");
    $("#bbAmounts").innerHTML = D.greenAmounts.map((a) =>
      '<button type="button" class="bb-pill" data-amount="' + a.code + '" aria-pressed="false">' + a.name + "</button>").join("");

    /* Упаковка */
    $("#bbWraps").innerHTML = D.wraps.map((w) =>
      '<button type="button" class="bb-opt bb-wrapc" data-wrap="' + w.id + '" aria-pressed="false">' +
      '<span class="bb-opt__name">' + w.name + "</span>" +
      '<span class="bb-opt__meta">' + (w.extra ? "+ " + fmt(w.extra) : "включено") + "</span></button>").join("");
    $("#bbRibbons").innerHTML = D.ribbons.map((r) =>
      '<button type="button" class="bb-swatch' + (r[1] === "auto" ? " is-auto" : "") + '" data-ribbon="' + r[1] + '" style="--c:' + (r[1] === "auto" ? "transparent" : r[1]) + '" aria-pressed="false" title="' + r[0] + '" aria-label="' + r[0] + '"></button>').join("");
  }

  function renderWrapColors() {
    const w = WRAPS[state.wrap || "kraft"];
    $("#bbWrapColors").innerHTML = w.colors.map((c, i) =>
      '<button type="button" class="bb-swatch" data-wrapcolor="' + i + '" style="--c:' + c[1] + '" aria-pressed="' + (i === state.wrapColor) + '" title="' + c[0] + '" aria-label="' + c[0] + '"></button>').join("");
    const wc = w.colors[state.wrapColor] || w.colors[0];
    $("#bbWrapColorName").textContent = wc ? wc[0].toLowerCase() : "";
    const rib = D.ribbons.find((r) => r[1] === state.ribbon);
    $("#bbRibbonName").textContent = rib ? rib[0].toLowerCase() : "";
    $("#bbWrapColorsRow").hidden = !w.colors.length || state.wrap === null;
    $("#bbRibbonRow").hidden = state.wrap === null;
  }

  function syncControls() {
    const press = (sel, attr, val) => $$(sel).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset[attr] === String(val))));
    press("[data-size]", "size", state.size);
    press("[data-style]", "style", state.style);
    press("[data-palette]", "palette", state.palette);
    press("[data-green]", "green", state.green);
    press("[data-amount]", "amount", state.amount);
    press("[data-wrap]", "wrap", state.wrap);
    press("[data-ribbon]", "ribbon", state.ribbon);
    $$("[data-flower]").forEach((b) => {
      const i = state.flowers.indexOf(b.dataset.flower);
      b.setAttribute("aria-pressed", String(i >= 0));
      b.classList.toggle("is-hero", i === 0 && state.flowers.length > 1);
    });
    $("#bbFlorist").setAttribute("aria-pressed", String(state.florist));
    $$("[data-swatch]").forEach((b) => b.setAttribute("aria-pressed", String(state.custom.includes(b.dataset.swatch))));
    $("#bbCustomDot").style.background = state.custom.length ? buildControls.ring(state.custom) : "";
    $("#bbCustom").hidden = state.palette !== "custom";
    $("#bbAmountRow").hidden = !state.green || state.green === "none";
    renderWrapColors();

    $("#bbCard").checked = state.card;
    $("#bbCardText").hidden = !state.card;
    $("#bbCardText").value = state.cardText;
    $("#bbDate").value = state.date;
    $("#bbComment").value = state.comment;
    press("[data-receive]", "receive", state.receive);

    const done = {
      1: true,
      2: !!paletteColors(),
      3: state.flowers.length > 0 || state.florist,
      4: state.green !== null,
      5: state.wrap !== null,
      6: false,
    };
    $$(".bb-step-tab").forEach((t) => t.classList.toggle("is-done", !!done[t.dataset.step]));

    updateSummary();
    saveDraft();
  }

  function updateSummary() {
    const p = price();
    const el = $("#bbPrice");
    const from = parseInt(el.dataset.v || "0", 10);
    el.dataset.v = p;
    countUp(el, from, p);
  }
  function countUp(el, from, to) {
    if (reduceMotion || !from || from === to) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 500);
      el.textContent = fmt(Math.round((from + (to - from) * (1 - Math.pow(1 - p, 3))) / 10) * 10);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function compositionLines() {
    const s = SIZES[state.size];
    const lines = [["Размер", s.code + " — " + s.name + ", ≈ " + s.stems + " цветков"], ["Форма", STYLES[state.style].name]];
    const pal = paletteColors();
    lines.push(["Палитра", state.palette === "custom" ? "своя: " + (pal ? pal.join(", ") : "не выбрана") : state.palette ? PALETTES[state.palette].name : "не выбрана"]);
    if (state.florist || !state.flowers.length) lines.push(["Цветы", "на выбор флориста из свежих поставок"]);
    else lines.push(["Цветы", state.flowers.map((id, i) => FLOWERS[id].name + (i === 0 && state.flowers.length > 1 ? " (акцент)" : "")).join(", ")]);
    if (state.green === null) lines.push(["Зелень", "на выбор флориста"]);
    else if (state.green === "none") lines.push(["Зелень", "без зелени"]);
    else lines.push(["Зелень", GREENS[state.green].name + ", " + AMOUNTS[state.amount].name.toLowerCase()]);
    if (state.wrap === null) lines.push(["Упаковка", "на выбор флориста"]);
    else {
      const w = WRAPS[state.wrap];
      const c = w.colors[state.wrapColor];
      const rib = D.ribbons.find((r) => r[1] === state.ribbon);
      lines.push(["Упаковка", w.name + (c ? ", " + c[0].toLowerCase() : "") + "; лента: " + (rib ? rib[0].toLowerCase() : "")]);
    }
    if (state.card) lines.push(["Открытка", state.cardText ? "«" + state.cardText + "»" : "без текста"]);
    return lines;
  }

  /* ── обработка кликов ─────────────────────────────────── */
  let renderTimer = 0;
  function rerender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 60);
  }
  function pulseStage() {
    const st = $("#bbCanvas");
    st.classList.remove("is-pulse");
    void st.offsetWidth;
    st.classList.add("is-pulse");
  }
  function toast(msg) {
    const t = $("#bbToast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove("is-on"), 2200);
  }

  function onClick(e) {
    const b = e.target.closest("button");
    if (!b || !b.closest(".bb-studio")) return;
    const ds = b.dataset;

    if (ds.size) { state.size = ds.size; rerender(); }
    else if (ds.style) { state.style = ds.style; rerender(); }
    else if (ds.palette) {
      state.palette = ds.palette;
      if (ds.palette === "custom" && !state.custom.length) state.custom = ["#F2CFCB", "#FFFFFF", "#C9D8B6"];
      repaintHeads();
    } else if (ds.swatch) {
      const i = state.custom.indexOf(ds.swatch);
      if (i >= 0) { if (state.custom.length > 1) state.custom.splice(i, 1); }
      else if (state.custom.length >= 5) toast("В палитре до пяти цветов");
      else state.custom.push(ds.swatch);
      state.palette = "custom";
      repaintHeads();
    } else if (ds.flower) {
      const i = state.flowers.indexOf(ds.flower);
      if (i >= 0) state.flowers.splice(i, 1);
      else if (state.flowers.length >= 5) { toast("До пяти видов — так букет остаётся цельным"); return; }
      else state.flowers.push(ds.flower);
      state.florist = false;
      rerender();
    } else if (b.id === "bbFlorist") {
      state.florist = !state.florist;
      if (state.florist) state.flowers = [];
      rerender();
    } else if (ds.green) {
      state.green = ds.green; rerender();
    } else if (ds.amount) {
      state.amount = ds.amount; rerender();
    } else if (ds.wrap) {
      const was = state.wrap;
      if (state.wrap !== ds.wrap) state.wrapColor = 0;
      state.wrap = ds.wrap;
      /* Смена типа упаковки меняет геометрию — перерисовываем */
      if (was === null && ds.wrap === "kraft") repaintWrap(); else rerender();
    } else if (ds.wrapcolor) {
      state.wrapColor = +ds.wrapcolor; repaintWrap();
    } else if (ds.ribbon) {
      state.ribbon = ds.ribbon; repaintWrap();
    } else if (ds.receive) {
      state.receive = ds.receive;
    } else if (b.id === "bbShuffle") {
      state.seed = 1 + Math.floor(Math.random() * 1e6); rerender();
    } else if (b.id === "bbSurprise") {
      surprise(); return;
    } else if (b.id === "bbSave") {
      saveImage(); return;
    } else if (b.id === "bbShare") {
      share(); return;
    } else if (b.id === "bbReset") {
      state = Object.assign({}, DEFAULT_STATE, { seed: state.seed, custom: [], flowers: [] });
      rerender();
    } else if (b.id === "bbNext") {
      if (step < 6) goStep(step + 1); else openSend();
      return;
    } else if (b.id === "bbBack") {
      goStep(step - 1); return;
    } else if (b.classList.contains("bb-step-tab")) {
      goStep(+b.dataset.step); return;
    } else return;

    pulseStage();
    syncControls();
  }

  /* Долгое нажатие на выбранный цветок — сделать его акцентом */
  function onFlowerHold() {
    let t = 0;
    document.addEventListener("pointerdown", (e) => {
      const b = e.target.closest("[data-flower]");
      if (!b) return;
      t = setTimeout(() => {
        const i = state.flowers.indexOf(b.dataset.flower);
        if (i > 0) {
          state.flowers.splice(i, 1);
          state.flowers.splice(0, 0, b.dataset.flower);
          b.dataset.held = "1";
          toast(FLOWERS[b.dataset.flower].name + " — теперь акцент букета");
          rerender(); syncControls();
        }
      }, 520);
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => document.addEventListener(ev, () => clearTimeout(t), true));
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-flower]");
      if (b && b.dataset.held) { delete b.dataset.held; e.stopImmediatePropagation(); e.preventDefault(); }
    }, true);
  }

  function surprise() {
    const R = Math.random;
    const pick = (a) => a[Math.floor(R() * a.length)];
    const stock = D.flowers.filter((f) => f.inStock).map((f) => f.id);
    const n = 2 + Math.floor(R() * 3);
    const fl = [];
    while (fl.length < n) { const x = pick(stock); if (!fl.includes(x)) fl.push(x); }
    const wraps = D.wraps.map((w) => w.id);
    Object.assign(state, {
      size: pick(["M", "L", "M", "XL"]),
      style: R() < 0.35 ? "airy" : "dome",
      palette: pick(D.palettes).code,
      flowers: fl,
      florist: false,
      green: pick(D.greens.slice(0, 4)).id,
      amount: pick(["light", "mid", "lush"]),
      wrap: pick(wraps),
      seed: 1 + Math.floor(R() * 1e6),
    });
    state.wrapColor = Math.floor(R() * Math.max(1, WRAPS[state.wrap].colors.length));
    state.ribbon = "auto";
    const st = $("#bbCanvas");
    st.classList.remove("is-magic"); void st.offsetWidth; st.classList.add("is-magic");
    render();
    syncControls();
  }

  /* ── шаги ─────────────────────────────────────────────── */
  let step = 1;
  function goStep(n) {
    step = Math.max(1, Math.min(6, n));
    $$(".bb-step").forEach((s) => { s.hidden = +s.dataset.step !== step; });
    $$(".bb-step-tab").forEach((t) => t.setAttribute("aria-selected", String(+t.dataset.step === step)));
    const active = $('.bb-step-tab[data-step="' + step + '"]');
    const tabs = $(".bb-tabs");
    if (active) tabs.scrollTo({ left: active.offsetLeft - (tabs.clientWidth - active.offsetWidth) / 2, behavior: reduceMotion ? "auto" : "smooth" });
    $("#bbBody").scrollTop = 0;
    $("#bbBack").hidden = step === 1;
    $("#bbNext").innerHTML = step < 6 ? 'Далее <span class="btn-arrow" aria-hidden="true">→</span>' : "Отправить флористу";
    $("#bbNext").classList.toggle("is-send", step === 6);
  }

  /* ── эскиз: удерживать, чтобы увидеть чистый контур ───── */
  function bindSketchHold() {
    const b = $("#bbSketch");
    const on = (e) => { e.preventDefault(); svg.classList.add("is-sketch"); b.setAttribute("aria-pressed", "true"); };
    const off = () => { svg.classList.remove("is-sketch"); b.setAttribute("aria-pressed", "false"); };
    b.addEventListener("pointerdown", on);
    ["pointerup", "pointerleave", "pointercancel", "blur"].forEach((ev) => b.addEventListener(ev, off));
    b.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") on(e); });
    b.addEventListener("keyup", off);
  }

  /* ── черновик и ссылка ────────────────────────────────── */
  const SHARE_KEYS = ["size", "style", "palette", "custom", "flowers", "florist", "green", "amount", "wrap", "wrapColor", "ribbon", "seed"];
  function encodeState() {
    const o = {};
    SHARE_KEYS.forEach((k) => { o[k] = state[k]; });
    return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function decodeState(s) {
    try {
      const o = JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/")))));
      return sanitize(o);
    } catch (e) { return null; }
  }
  function sanitize(o) {
    if (!o || typeof o !== "object") return null;
    const s = {};
    if (SIZES[o.size]) s.size = o.size;
    if (STYLES[o.style]) s.style = o.style;
    if (o.palette === null || o.palette === "custom" || PALETTES[o.palette]) s.palette = o.palette;
    if (Array.isArray(o.custom)) s.custom = o.custom.filter((c) => /^#[0-9A-Fa-f]{6}$/.test(c)).slice(0, 5);
    if (Array.isArray(o.flowers)) s.flowers = o.flowers.filter((id) => FLOWERS[id] && FLOWERS[id].inStock).slice(0, 5);
    if (typeof o.florist === "boolean") s.florist = o.florist;
    if (o.green === null || GREENS[o.green]) s.green = o.green;
    if (AMOUNTS[o.amount]) s.amount = o.amount;
    if (o.wrap === null || WRAPS[o.wrap]) s.wrap = o.wrap;
    if (Number.isInteger(o.wrapColor) && o.wrapColor >= 0 && o.wrapColor < 8) s.wrapColor = o.wrapColor;
    if (o.ribbon === "auto" || D.ribbons.some((r) => r[1] === o.ribbon)) s.ribbon = o.ribbon;
    if (Number.isInteger(o.seed)) s.seed = o.seed;
    ["cardText", "comment", "date"].forEach((k) => { if (typeof o[k] === "string") s[k] = o[k].slice(0, 300); });
    if (typeof o.card === "boolean") s.card = o.card;
    if (o.receive === "delivery" || o.receive === "pickup") s.receive = o.receive;
    return s;
  }
  function saveDraft() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* приватный режим */ }
  }
  function loadInitial() {
    const m = /[#&]b=([A-Za-z0-9_-]+)/.exec(location.hash);
    if (m) {
      const s = decodeState(m[1]);
      if (s) { Object.assign(state, s); return true; }
    }
    try {
      const s = sanitize(JSON.parse(localStorage.getItem(STORE_KEY) || "null"));
      if (s) Object.assign(state, s);
    } catch (e) { /* пусто */ }
    return false;
  }
  function shareUrl() {
    /* Пока страница закрыта ключом, ссылка несёт ключ — иначе менеджер
       не откроет эскиз. После публичного запуска ключа не будет. */
    let lab = "";
    try { lab = localStorage.getItem("paloma_lab_key") || ""; } catch (e) { /* нет доступа */ }
    return location.origin + location.pathname + (lab ? "?lab=" + encodeURIComponent(lab) : "") + "#b=" + encodeState();
  }
  function share() {
    const url = shareUrl();
    if (navigator.share) {
      navigator.share({ title: "Мой букет — PALOMA", url }).catch(() => {});
      return;
    }
    copy(url).then(() => toast("Ссылка на эскиз скопирована"));
  }
  function copy(text) {
    if (navigator.clipboard) return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    fallbackCopy(text);
    return Promise.resolve();
  }
  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ничего */ }
    ta.remove();
  }

  /* ── сохранить эскиз картинкой ────────────────────────── */
  function saveImage() {
    const clone = svg.cloneNode(true);
    clone.classList.remove("is-sketch", "bb-draw");
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", "1200");
    clone.setAttribute("height", "1440");
    /* Стили контура — прямо в файл, иначе картинка выйдет без линий */
    const st = document.createElementNS("http://www.w3.org/2000/svg", "style");
    st.textContent = ".bb-ink path{fill:none;stroke:" + INK + ";stroke-width:1.4px;stroke-linecap:round;stroke-linejoin:round}.bb-sheen{stroke:#fff!important;opacity:.7}.bb-stems path{fill:none;stroke:" + (svg.classList.contains("is-heads") ? "#6d8a58" : INK) + ";stroke-width:1.4px}.bb-ground{fill:rgba(27,26,24,.06)}";
    clone.insertBefore(st, clone.firstChild);
    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 1200; c.height = 1600;
      const x = c.getContext("2d");
      x.fillStyle = "#fffdfb"; x.fillRect(0, 0, c.width, c.height);
      x.drawImage(img, 0, 20, 1200, 1440);
      x.fillStyle = "#1b1a18"; x.font = "300 30px Montserrat, sans-serif"; x.textAlign = "center";
      x.fillText("PALOMA · эскиз авторского букета", 600, 1545);
      URL.revokeObjectURL(url);
      c.toBlob((b) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = "paloma-bouquet.png";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      }, "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast("Не получилось сохранить картинку"); };
    img.src = url;
  }

  /* ════════════════════════════════════════════════════════
     Отправка флористу
     ════════════════════════════════════════════════════════ */
  const dlg = document.getElementById("bbDialog");
  function openSend() {
    updateSummary();
    $("#bbDialogCompose").innerHTML = compositionLines().map((l) => "<li><span>" + esc(l[0]) + "</span><b>" + esc(l[1]) + "</b></li>").join("");
    $("#bbDialogPrice").textContent = fmt(price());
    $("#bbForm").hidden = false;
    $("#bbDone").hidden = true;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    setTimeout(() => { const n = $("#bbName"); if (n) n.focus(); }, 60);
  }
  function closeSend() {
    if (dlg.close) dlg.close(); else dlg.removeAttribute("open");
  }

  function managerDetails(messenger) {
    const lines = ["Флорист собирает по эскизу и присылает фото на одобрение до отправки.", ""];
    compositionLines().forEach((l) => lines.push(l[0] + ": " + l[1]));
    lines.push("Получение: " + (state.receive === "pickup" ? "самовывоз (Энгельса, 74/82)" : "доставка"));
    lines.push("Ориентир по цене: ≈ " + fmt(price()));
    if (messenger) lines.push("Фото на одобрение прислать: " + messenger);
    lines.push("", "Эскиз клиента: " + shareUrl());
    return lines.join("\n");
  }

  function bindForm() {
    const form = $("#bbForm");
    const phone = $("#bbPhone");
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
    $$("[data-close]", dlg).forEach((b) => b.addEventListener("click", closeSend));
    dlg.addEventListener("click", (e) => { if (e.target === dlg) closeSend(); });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#bbName").value.trim();
      const digits = phone.value.replace(/\D/g, "");
      const err = $("#bbFormError");
      if (digits.length !== 11) { err.textContent = "Проверьте номер телефона — нужно 11 цифр"; phone.focus(); return; }
      if (!$("#bbAgree").checked) { err.textContent = "Нужно согласие на обработку данных"; return; }
      err.textContent = "";
      const m = form.querySelector('input[name="messenger"]:checked');
      const messenger = m ? m.value : "";
      const btn = $("#bbSubmit");
      btn.disabled = true;
      btn.classList.add("is-busy");
      const payload = {
        page: "bouquet-builder",
        name,
        phone: phone.value,
        messenger,
        date: state.date,
        details: managerDetails(messenger),
        comment: state.comment,
        source: "Конструктор букета",
      };
      /* Копия у клиента — на случай, если сеть подвела */
      try {
        const list = JSON.parse(localStorage.getItem("paloma_builder_sent") || "[]");
        list.push({ at: Date.now(), payload });
        localStorage.setItem("paloma_builder_sent", JSON.stringify(list.slice(-5)));
      } catch (x) { /* ничего */ }
      const send = window.palomaSendLead ? window.palomaSendLead(payload) : Promise.resolve({ ok: false });
      send.then((r) => {
        btn.disabled = false;
        btn.classList.remove("is-busy");
        $("#bbDoneId").textContent = r && r.orderId ? "№ " + r.orderId : "";
        $("#bbDoneWhere").textContent = messenger ? messenger : "удобный вам мессенджер";
        $("#bbDoneBouquet").innerHTML = "";
        const mini = svg.cloneNode(true);
        mini.removeAttribute("id");
        mini.classList.remove("bb-draw", "is-sketch");
        $("#bbDoneBouquet").appendChild(mini);
        form.hidden = true;
        $("#bbDone").hidden = false;
        petals();
        if (typeof window.ym === "function") { try { window.ym(110912456, "reachGoal", "bouquet_builder_sent"); } catch (x) { /* ничего */ } }
      });
    });

    $("#bbCard").addEventListener("change", (e) => { state.card = e.target.checked; syncControls(); });
    $("#bbCardText").addEventListener("input", (e) => { state.cardText = e.target.value.slice(0, 200); updateSummary(); saveDraft(); });
    $("#bbDate").addEventListener("change", (e) => { state.date = e.target.value; saveDraft(); });
    $("#bbComment").addEventListener("input", (e) => { state.comment = e.target.value.slice(0, 300); saveDraft(); });
    const today = new Date();
    $("#bbDate").min = today.toISOString().slice(0, 10);
  }

  /* Лепестки на экране успеха */
  function petals() {
    if (reduceMotion) return;
    const box = $("#bbPetals");
    box.innerHTML = "";
    const pal = paletteColors() || ["#F2CFCB", "#E7385A", "#FBEAE4"];
    for (let i = 0; i < 26; i++) {
      const s = document.createElement("i");
      s.style.setProperty("--x", (Math.random() * 100).toFixed(1) + "%");
      s.style.setProperty("--r", Math.round(Math.random() * 360) + "deg");
      s.style.setProperty("--dur", (2.4 + Math.random() * 2).toFixed(2) + "s");
      s.style.setProperty("--del", (Math.random() * 0.8).toFixed(2) + "s");
      s.style.setProperty("--c", pal[i % pal.length]);
      box.appendChild(s);
    }
  }

  /* ════════════════════════════════════════════════════════
     Старт
     ════════════════════════════════════════════════════════ */
  /* Высота закреплённой шапки сайта — чтобы эскиз прилипал под ней */
  function measureHead() {
    const top = document.getElementById("siteTop") || document.getElementById("siteHeader");
    const main = document.getElementById("main");
    if (!top || !main) return;
    const pos = getComputedStyle(top).position;
    const h = pos === "sticky" || pos === "fixed" ? Math.max(0, Math.round(top.getBoundingClientRect().bottom)) : 0;
    main.style.setProperty("--bb-head", h + "px");
    /* Фиксированная шапка не занимает места в потоке — отступаем сами */
    main.style.setProperty("--bb-pad", (pos === "fixed" ? h : 0) + "px");
  }
  measureHead();
  window.addEventListener("resize", measureHead);
  window.addEventListener("scroll", () => { if (!measureHead.t) measureHead.t = setTimeout(() => { measureHead.t = 0; measureHead(); }, 200); }, { passive: true });

  buildControls();
  const fromLink = loadInitial();
  syncControls();
  render();
  goStep(1);
  bindSketchHold();
  onFlowerHold();
  bindForm();
  document.addEventListener("click", onClick);
  if (fromLink) toast("Открыт эскиз по ссылке");
})();
