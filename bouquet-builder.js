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
  const FLORIST_MIX = ["pion-rose", "hydrangea", "eustoma", "spray"];

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
     Каждая фигура — { fills: [{d, tone, g, t, fix, alt, glow}], inks: [{d, t}] }
     g — как ложится свет на деталь (см. grad()):
       ring  — слой цветка сверху: глубина в центре, светлый край;
       petal — отдельный лепесток: тёмное основание, светлый кончик;
       cup   — чашечка (помпонный георгин): блик сверху, тень внутри;
       ball  — объём (бутон, ягода, кисть гортензии): блик слева сверху;
       leaf  — лист: тень у края, светлая середина;
       film  — плёнка упаковки; satin — атласная лента; flat — без градиента.
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
      const am = (p[2] + (k === n - 1 ? q[2] + TAU : q[2])) / 2;
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
  /* Лист с зубчатым краем (листья малины) */
  function serratedLeaf(len, w, R) {
    const n = 9;
    let right = "", left = "";
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1), y = -len * t;
      const ww = w * Math.sin(Math.PI * Math.pow(t, 0.8)) * (i % 2 ? 1 : 0.86);
      right += "L" + f1(ww + (R() - 0.5) * 1.5) + " " + f1(y);
      left = "L" + f1(-ww + (R() - 0.5) * 1.5) + " " + f1(y) + left;
    }
    return "M0 0" + right + "L0 " + f1(-len) + left + "Z";
  }
  /* Дужка-складка между точками на окружности — «рисунок» лепестка */
  function fold(r1, a1, r2, a2, bend) {
    const x1 = Math.cos(a1) * r1, y1 = Math.sin(a1) * r1;
    const x2 = Math.cos(a2) * r2, y2 = Math.sin(a2) * r2;
    const am = (a1 + a2) / 2, rm = ((r1 + r2) / 2) * bend;
    return "M" + f1(x1) + " " + f1(y1) + "Q" + f1(Math.cos(am) * rm) + " " + f1(Math.sin(am) * rm) + " " + f1(x2) + " " + f1(y2);
  }
  const rot = (deg, x, y) => (x != null ? "translate(" + f1(x) + " " + f1(y) + ") " : "") + "rotate(" + f1(deg) + ")";

  /* ════════════════════════════════════════════════════════
     Цветы. r — радиус головки, R — генератор случайностей.
     Формы списаны с того, что реально стоит в букетах PALOMA.
     ════════════════════════════════════════════════════════ */

  /* Кольцо из отдельных лепестков вокруг центра — как у живого цветка:
     лепестки перекрываются, у каждого тёмное основание и светлый край */
  function petalRing(fills, n, len, w, tone, offDeg, R, opts) {
    const o = opts || {};
    for (let k = 0; k < n; k++) {
      const a = offDeg + (360 * k) / n + (R() - 0.5) * (o.jit || 14);
      const l = len * (0.9 + R() * 0.16), ww = w * (0.88 + R() * 0.2);
      fills.push({ d: petal(l, ww, !!o.pointed), tone: tone + R() * 0.05, g: o.g || "petal", t: rot(a), glow: o.glow && k === 0 });
    }
  }

  const SHAPES = {
    /* Классическая роза сверху: спираль плотных лепестков */
    /* Классическая роза сверху: спираль из плотно сомкнутых лепестков */
    rose(r, R) {
      const a0 = R() * 360;
      const fills = [];
      petalRing(fills, 6, r, r * 0.62, 0.02, a0, R, { glow: true });
      petalRing(fills, 5, r * 0.76, r * 0.56, 0.1, a0 + 30, R);
      petalRing(fills, 5, r * 0.54, r * 0.5, 0.18, a0 + 66, R);
      fills.push({ d: bumpy(r * 0.3, 4, 0.3, (a0 * Math.PI) / 180, 0.12, R), tone: 0.3, g: "ring" });
      fills.push({ d: bumpy(r * 0.15, 3, 0.36, (a0 * Math.PI) / 180 + 1, 0.12, R), tone: 0.42, g: "ball" });
      const inks = [{ d: "M" + f1(r * 0.1) + " 0A" + f1(r * 0.1) + " " + f1(r * 0.1) + " 0 1 0 0 " + f1(r * 0.11) }];
      return { fills, inks };
    },

    /* Пионовидная (садовая) роза: много рюшевых слоёв, открытый центр */
    /* Пионовидная (садовая) роза: широкие перекрывающиеся лепестки
       в четыре яруса и плотная рюшевая серединка */
    peony(r, R) {
      const a0 = R() * 360;
      const fills = [];
      petalRing(fills, 8, r, r * 0.52, 0.02, a0, R, { glow: true, jit: 18 });
      petalRing(fills, 8, r * 0.8, r * 0.46, 0.08, a0 + 22, R, { jit: 18 });
      petalRing(fills, 7, r * 0.6, r * 0.4, 0.15, a0 + 9, R, { jit: 20 });
      petalRing(fills, 6, r * 0.42, r * 0.34, 0.22, a0 + 40, R, { jit: 22 });
      fills.push({ d: bumpy(r * 0.24, 7, 0.22, (a0 * Math.PI) / 180, 0.2, R), tone: 0.28, g: "ring" });
      fills.push({ d: bumpy(r * 0.12, 5, 0.3, 0.5, 0.2, R), tone: 0.38, g: "ball" });
      return { fills, inks: [] };
    },

    /* Кустовая роза: несколько маленьких роз и бутоны с чашелистиками */
    spray(r, R) {
      const fills = [], inks = [];
      const spots = [[-0.42, -0.2, 0.46], [0.4, -0.3, 0.42], [0.02, 0.36, 0.44], [0.6, 0.42, 0.2], [-0.62, 0.46, 0.19]];
      spots.forEach((s, i) => {
        const t = "translate(" + f1(s[0] * r) + " " + f1(s[1] * r) + ")";
        if (s[2] < 0.3) {
          const tt = t + " rotate(" + f1(R() * 60 - 30) + ")";
          fills.push({ d: petal(r * s[2] * 1.5, r * s[2] * 0.36, true), fix: "#7c9a5e", tone: 0.1, g: "leaf", t: tt + " rotate(150)" });
          fills.push({ d: petal(r * s[2] * 1.5, r * s[2] * 0.36, true), fix: "#7c9a5e", tone: 0.1, g: "leaf", t: tt + " rotate(210)" });
          fills.push({ d: ellipse(r * s[2] * 0.62, r * s[2] * 0.9, 0, 0), tone: 0.18, g: "ball", t: tt });
        } else {
          const m = SHAPES.rose(r * s[2], R);
          m.fills.forEach((f) => fills.push(Object.assign({}, f, { t, glow: f.glow && i === 0 })));
          m.inks.forEach((k) => inks.push(Object.assign({}, k, { t })));
        }
      });
      return { fills, inks };
    },

    /* Гортензия: шапка из десятков маленьких четырёхлепестковых цветочков */
    /* Гортензия: плотная шапка из десятков четырёхлепестковых цветочков */
    hydrangea(r, R) {
      const fills = [{ d: bumpy(r * 0.95, 12, 0.08, R() * TAU, 0.1, R), tone: 0.16, g: "ball" }];
      const n = 40;
      for (let i = 0; i < n; i++) {
        const t = Math.sqrt((i + 0.5) / n);
        const rr = r * 0.82 * t;
        const a = i * 2.39996 + R() * 0.3;
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        const fr = r * (0.21 - t * 0.04 + R() * 0.03);
        fills.push({ d: bumpy(fr, 4, 0.62, R() * TAU, 0.14, R), tone: t * 0.12 + R() * 0.08, g: "ring", alt: i % 4 === 0, t: "translate(" + f1(x) + " " + f1(y) + ")" });
        fills.push({ d: circle(fr * 0.14, x, y), tone: 0.28, g: "flat" });
      }
      return { fills, inks: [] };
    },

    /* Георгин декоративный (Пичес): кольца заострённых лепестков */
    dahlia(r, R) {
      const a0 = R() * 360;
      const fills = [{ d: circle(r * 0.94), tone: 0.4, g: "ball" }];
      const rings = [[16, 1, 0.21, 0], [13, 0.78, 0.2, 0.08], [10, 0.56, 0.18, 0.16], [7, 0.36, 0.15, 0.26]];
      rings.forEach((g, gi) => {
        for (let k = 0; k < g[0]; k++) {
          const a = a0 + (360 * k) / g[0] + gi * 11 + (R() - 0.5) * 6;
          fills.push({ d: petal(r * g[1] * (0.95 + R() * 0.08), r * g[2], true), tone: g[3], g: "petal", t: rot(a), glow: gi === 0 && k === 0 });
        }
      });
      fills.push({ d: circle(r * 0.12), tone: 0.5, g: "ball" });
      return { fills, inks: [] };
    },

    /* Помпонный георгин: шар из свёрнутых трубочкой лепестков-чашечек */
    pompon(r, R) {
      const fills = [{ d: circle(r), tone: 0.38, g: "ball", glow: true }];
      const inks = [];
      for (let k = 0; k < 6; k++) {
        const rk = r * (0.86 - k * 0.15);
        if (rk <= 0) break;
        const s = r * (0.17 - k * 0.014);
        const n = Math.max(5, Math.round((TAU * rk) / (s * 1.75)));
        const off = R() * TAU;
        for (let i = 0; i < n; i++) {
          const a = off + (TAU * i) / n;
          const x = Math.cos(a) * rk, y = Math.sin(a) * rk;
          const deg = (a * 180) / Math.PI + 90;
          fills.push({ d: ellipse(s, s * 0.8, 0, 0), tone: k * 0.04 + R() * 0.06, g: "cup", t: rot(deg, x, y) });
          inks.push({ d: "M" + f1(-s * 0.5) + " " + f1(-s * 0.1) + "Q0 " + f1(s * 0.5) + " " + f1(s * 0.5) + " " + f1(-s * 0.1), t: rot(deg, x, y) });
        }
      }
      fills.push({ d: circle(r * 0.08), tone: 0.42, g: "ball" });
      return { fills, inks };
    },

    /* Хризантема бигуди: плотный шар, лепестки загнуты к центру */
    chrysball(r, R) {
      const fills = [{ d: circle(r), tone: 0.42, g: "ball", glow: true }];
      for (let k = 0; k < 6; k++) {
        const rk = r * (0.9 - k * 0.15);
        if (rk <= 0.05 * r) break;
        const len = r * (0.3 - k * 0.025), w = len * 0.32;
        const n = Math.max(6, Math.round((TAU * rk) / (w * 1.9)));
        const off = R() * TAU;
        for (let i = 0; i < n; i++) {
          const a = off + (TAU * i) / n;
          const deg = (a * 180) / Math.PI - 90 + (R() - 0.5) * 14;
          fills.push({ d: petal(len, w, false), tone: k * 0.035 + R() * 0.05, g: "petal", t: rot(deg, Math.cos(a) * rk, Math.sin(a) * rk) });
        }
      }
      fills.push({ d: circle(r * 0.1), tone: 0.36, g: "ball" });
      return { fills, inks: [] };
    },

    /* Диантус (гвоздика): рваный «кружевной» край */
    carnation(r, R) {
      const a0 = R() * TAU;
      return {
        fills: [
          { d: jagged(r, 28, 0.12, a0, R), tone: 0, g: "ring", glow: true },
          { d: jagged(r * 0.76, 22, 0.14, a0 + 0.2, R), tone: 0.12, g: "ring" },
          { d: jagged(r * 0.52, 16, 0.16, a0 + 0.4, R), tone: 0.24, g: "ring" },
          { d: jagged(r * 0.28, 10, 0.2, a0 + 0.6, R), tone: 0.36, g: "ring" },
        ],
        inks: [],
      };
    },

    /* Эустома: широкие шёлковые лепестки, закрученные чашей */
    /* Эустома: пять широких шёлковых лепестков чашей, тёмное сердечко */
    eustoma(r, R) {
      const a0 = R() * 360;
      const fills = [];
      petalRing(fills, 5, r, r * 0.66, 0.02, a0, R, { glow: true, jit: 10 });
      petalRing(fills, 4, r * 0.62, r * 0.5, 0.12, a0 + 36, R, { jit: 10 });
      fills.push({ d: bumpy(r * 0.24, 4, 0.4, (a0 * Math.PI) / 180, 0.1, R), tone: 0.3, g: "ring" });
      fills.push({ d: circle(r * 0.09), fix: "#c9b24a", tone: 0.1, g: "ball" });
      return { fills, inks: [] };
    },

    /* Дельфиниум: колос из звёздочек с белым «глазком» */
    /* Дельфиниум: колос из крупных звёздочек с маленьким светлым «глазком» */
    delph(r, R) {
      const fills = [], inks = [{ d: "M0 " + f1(r * 0.5) + "L0 " + f1(-r * 1.4) }];
      const steps = 9;
      for (let i = 0; i < steps; i++) {
        const y = r * 0.42 - (i * r * 1.7) / steps;
        const w = r * (0.46 - i * 0.032);
        const x = (i % 2 ? 1 : -1) * w * 0.4;
        if (i < steps - 2) {
          fills.push({ d: bumpy(w, 5, 0.52, R() * TAU, 0.14, R), tone: i * 0.025, g: "ring", t: "translate(" + f1(x) + " " + f1(y) + ")", glow: i === 0 });
          fills.push({ d: circle(w * 0.16, x, y), fix: "#f4f1ec", tone: 0, g: "ball" });
        } else {
          fills.push({ d: ellipse(w * 0.55, w * 0.8, x, y), tone: 0.22, g: "ball" });
        }
      }
      return { fills, inks };
    },

    /* Львиный зев / маттиола: колос из «губастых» цветков */
    matthiola(r, R) {
      const fills = [], inks = [{ d: "M0 " + f1(r * 0.4) + "L0 " + f1(-r * 1.2) }];
      const steps = 8;
      for (let i = 0; i < steps; i++) {
        const y = r * 0.3 - (i * r * 1.45) / steps;
        const w = r * (0.42 - i * 0.04);
        const side = i % 2 ? 1 : -1;
        fills.push({ d: bumpy(w, 5, 0.34, R() * TAU, 0.12, R), tone: i * 0.05, g: "ball", t: "translate(" + f1(side * w * 0.35) + " " + f1(y) + ")", glow: i === 0 });
      }
      return { fills, inks };
    },

    /* Антуриум: глянцевое «сердце» и початок */
    anthurium(r, R) {
      const w = r * 1.05, h = r * 1.15;
      const heart = "M0 " + f1(h * 0.55) + "C" + f1(w * 0.55) + " " + f1(h * 0.25) + " " + f1(w) + " " + f1(-h * 0.1) + " " + f1(w * 0.7) + " " + f1(-h * 0.48) +
        "C" + f1(w * 0.45) + " " + f1(-h * 0.72) + " " + f1(w * 0.1) + " " + f1(-h * 0.62) + " 0 " + f1(-h * 0.4) +
        "C" + f1(-w * 0.1) + " " + f1(-h * 0.62) + " " + f1(-w * 0.45) + " " + f1(-h * 0.72) + " " + f1(-w * 0.7) + " " + f1(-h * 0.48) +
        "C" + f1(-w) + " " + f1(-h * 0.1) + " " + f1(-w * 0.55) + " " + f1(h * 0.25) + " 0 " + f1(h * 0.55) + "Z";
      return {
        fills: [
          { d: heart, tone: 0, g: "ball", glow: true },
          { d: petal(r * 0.75, r * 0.1, false), fix: "#efe0b8", tone: 0.15, g: "petal", t: "translate(0 " + f1(-h * 0.25) + ") rotate(" + f1(25 + R() * 15) + ")" },
        ],
        inks: [{ d: "M0 " + f1(h * 0.5) + "Q" + f1(w * 0.05) + " 0 0 " + f1(-h * 0.38) }],
      };
    },

    ranunculus(r, R) {
      const a0 = R() * TAU;
      const fills = [];
      for (let i = 0; i < 7; i++) {
        fills.push({ d: bumpy(r * (1 - i * 0.13), 12 - i, 0.07, a0 + i * 0.4, 0.06, R), tone: i * 0.07, g: "ring", glow: i === 0 });
      }
      fills.push({ d: circle(r * 0.1), fix: "#6f7d4a", tone: 0, g: "ball" });
      return { fills, inks: [] };
    },

    berries(r, R) {
      const fills = [], inks = [];
      const n = 9;
      for (let i = 0; i < n; i++) {
        const rr = r * 0.62 * Math.sqrt((i + 0.5) / n);
        const a = i * 2.39996 + R();
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        const br = r * (0.26 + R() * 0.06);
        fills.push({ d: ellipse(br * 0.9, br, x, y), tone: R() * 0.2, g: "ball", glow: i === 0, alt: i % 4 === 1 });
        inks.push({ d: "M" + f1(x - br * 0.18) + " " + f1(y - br * 0.72) + "l" + f1(br * 0.36) + " " + f1(-br * 0.2) });
      }
      return { fills, inks };
    },

    cotton(r, R) {
      const a0 = R() * 360;
      const fills = [];
      for (let k = 0; k < 5; k++) fills.push({ d: petal(r * 1.05, r * 0.2, true), fix: "#6b4a33", tone: 0, g: "petal", t: rot(a0 + k * 72 + 36) });
      for (let k = 0; k < 4; k++) {
        const a = (a0 * Math.PI) / 180 + (TAU * k) / 4;
        fills.push({ d: bumpy(r * 0.45, 7, 0.12, R() * TAU, 0.1, R), fix: "#fbf8f2", tone: 0, g: "ball", t: "translate(" + f1(Math.cos(a) * r * 0.36) + " " + f1(Math.sin(a) * r * 0.36) + ")", glow: k === 0 });
      }
      return { fills, inks: [] };
    },
  };
  /* Старые коды из прежних данных — на ближайший похожий рисунок */
  SHAPES.chrys = SHAPES.chrysball;
  SHAPES.pion = SHAPES.peony;

  /* Базовый радиус головки на эскизе */
  const HEAD_R = { rose: 33, peony: 42, pion: 45, spray: 38, hydrangea: 52, dahlia: 41, pompon: 30, chrysball: 36, chrys: 36, carnation: 29, eustoma: 32, delph: 34, matthiola: 32, anthurium: 32, ranunculus: 30, berries: 25, cotton: 27 };
  const SPIKES = { matthiola: 1, delph: 1 };

  /* ── Зелень: веточка «вверх» из 0,0, длина len ──────── */
  const SPRIGS = {
    eucalyptus(len, R) {
      const fills = [], inks = [{ d: "M0 0Q" + f1(len * 0.08) + " " + f1(-len * 0.5) + " 0 " + f1(-len) }];
      const n = 8;
      for (let i = 1; i <= n; i++) {
        const y = -(len * i) / (n + 0.6);
        const side = i % 2 ? 1 : -1;
        const r = len * (0.11 - i * 0.006);
        fills.push({ d: circle(r, side * r * 0.95, y), tone: R() * 0.22, g: "ring" });
      }
      return { fills, inks };
    },
    raspleaf(len, R) {
      const fills = [], inks = [{ d: "M0 0L0 " + f1(-len * 0.35) }];
      [[-38, 0.62], [0, 0.78], [36, 0.6]].forEach((l, i) => {
        const t = "translate(0 " + f1(-len * 0.3) + ") rotate(" + f1(l[0] + (R() - 0.5) * 12) + ")";
        fills.push({ d: serratedLeaf(len * l[1], len * 0.2, R), tone: R() * 0.15, g: "leaf", t, alt: i === 1 });
        inks.push({ d: "M0 0L0 " + f1(-len * l[1] * 0.92), t });
      });
      return { fills, inks };
    },
    panicum(len, R) {
      const fills = [], inks = [{ d: "M0 0Q" + f1(len * 0.06) + " " + f1(-len * 0.5) + " 0 " + f1(-len) }];
      for (let i = 0; i < 7; i++) {
        const y = -len * (0.35 + i * 0.09);
        const s = i % 2 ? 1 : -1;
        const bx = s * len * (0.16 + R() * 0.1), by = y - len * 0.1;
        inks.push({ d: "M0 " + f1(y) + "Q" + f1(bx * 0.5) + " " + f1(y - len * 0.02) + " " + f1(bx) + " " + f1(by) });
        for (let k = 0; k < 4; k++) fills.push({ d: circle(len * 0.012, bx * (0.4 + k * 0.2), y + (by - y) * (0.4 + k * 0.2)), tone: 0.1, g: "flat" });
      }
      return { fills, inks };
    },
    tropic(len, R) {
      const w = len * 0.24;
      return {
        fills: [{ d: petal(len * 1.15, w, true), tone: R() * 0.1, g: "leaf", glow: true, t: "rotate(" + f1((R() - 0.5) * 16) + ")" }],
        inks: [{ d: "M0 0L0 " + f1(-len * 1.1) }],
      };
    },
    pistacia(len, R) {
      const fills = [], inks = [{ d: "M0 0Q" + f1(-len * 0.06) + " " + f1(-len * 0.5) + " 0 " + f1(-len) }];
      for (let i = 1; i <= 5; i++) {
        const y = -(len * i) / 5.5;
        [-1, 1].forEach((s) => fills.push({ d: petal(len * 0.2, len * 0.055, false), tone: R() * 0.3, g: "leaf", t: "translate(0 " + f1(y) + ") rotate(" + s * 58 + ")" }));
      }
      return { fills, inks };
    },
    ruscus(len, R) {
      const fills = [], inks = [{ d: "M0 0L0 " + f1(-len) }];
      for (let i = 1; i <= 6; i++) {
        const s = i % 2 ? 1 : -1;
        fills.push({ d: petal(len * 0.26, len * 0.07, true), tone: R() * 0.25, g: "leaf", t: "translate(0 " + f1(-(len * i) / 6.4) + ") rotate(" + s * 40 + ")" });
      }
      return { fills, inks };
    },
    pampas(len, R) {
      const fills = [];
      const inks = [{ d: "M0 0L0 " + f1(-len * 0.3) }];
      for (let i = 0; i < 5; i++) {
        const y = -len * (0.32 + i * 0.13);
        const w = len * (0.15 - i * 0.018);
        const tilt = (i % 2 ? 1 : -1) * (8 + R() * 8);
        fills.push({ d: petal(len * 0.34, w, false), tone: i * 0.05 + R() * 0.08, g: "petal", t: "translate(0 " + f1(y + len * 0.1) + ") rotate(" + f1(tilt) + ")", glow: i === 0 });
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
     Свет: градиенты под цвет детали
     Одинаковые сочетания «тип + цвет + глубина» переиспользуются.
     ════════════════════════════════════════════════════════ */
  const GRADS = new Map();
  function gradHost() { return svg.querySelector("#bbGrads"); }
  function resetGrads() { GRADS.clear(); if (typeof PFILT !== "undefined") PFILT.clear(); const h = gradHost(); if (h) h.innerHTML = ""; }
  function lum(hex) { const c = hexToRgb(hex); return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255; }
  function stops(list) {
    return list.map((s) => '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : "") + "/>").join("");
  }
  function paintFill(type, color, tone) {
    const base = shade(color, tone || 0);
    if (!type || type === "flat") return base;
    const t = Math.round((tone || 0) * 20) / 20;
    const key = type + color + t;
    if (GRADS.has(key)) return GRADS.get(key);
    const id = "bbg" + gen + "_" + GRADS.size;
    /* Светлые цвета темнеют в серо-тёплое, а не в бордовое */
    const shadowInk = lum(base) > 0.82 ? "#8a7d72" : "#2b1018";
    const deep = mix(base, shadowInk, lum(base) > 0.82 ? 0.28 : 0.34);
    const lite = mix(base, "#ffffff", 0.42);
    let el;
    if (type === "ring") el = '<radialGradient id="' + id + '" cx="50%" cy="50%" r="52%">' + stops([[0, deep], [0.62, base], [1, lite]]) + "</radialGradient>";
    else if (type === "petal") el = '<linearGradient id="' + id + '" x1="0" y1="1" x2="0" y2="0">' + stops([[0, deep], [0.5, base], [1, lite]]) + "</linearGradient>";
    else if (type === "cup") el = '<radialGradient id="' + id + '" cx="50%" cy="30%" r="70%">' + stops([[0, lite], [0.55, base], [1, deep]]) + "</radialGradient>";
    else if (type === "ball") el = '<radialGradient id="' + id + '" cx="36%" cy="32%" r="74%">' + stops([[0, lite], [0.5, base], [1, deep]]) + "</radialGradient>";
    else if (type === "leaf") el = '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0">' + stops([[0, deep], [0.48, mix(base, "#ffffff", 0.18)], [0.52, base], [1, deep]]) + "</linearGradient>";
    else if (type === "film") el = '<linearGradient id="' + id + '" x1="0" y1="0" x2="0.4" y2="1">' + stops([[0, mix(base, "#ffffff", 0.55), 0.8], [0.55, base, 0.62], [1, mix(base, "#6d6560", 0.18), 0.74]]) + "</linearGradient>";
    else if (type === "satin") el = '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' + stops([[0, deep], [0.42, base], [0.5, mix(base, "#ffffff", 0.55)], [0.58, base], [1, deep]]) + "</linearGradient>";
    else if (type === "rope") el = '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' + stops([[0, lite], [0.45, base], [1, deep]]) + "</linearGradient>";
    else return base;
    const host = gradHost();
    if (host) host.insertAdjacentHTML("beforeend", el);
    const url = "url(#" + id + ")";
    GRADS.set(key, url);
    return url;
  }
  /* ════════════════════════════════════════════════════════
     Настоящие цветы: снимки головок из каталога (D.photos)
     Снимок подбирается к цвету палитры по яркости и тону, затем
     перекрашивается фильтром: насыщенность → поворот тона → яркость,
     и сразу получает мягкую тень на соседние цветы.
     ════════════════════════════════════════════════════════ */
  const PHOTOS = D.photos || {};
  const PFILT = new Map();
  function hexToHsl(hex) {
    const c = hexToRgb(hex).map((v) => v / 255);
    const mx = Math.max(c[0], c[1], c[2]), mn = Math.min(c[0], c[1], c[2]);
    let h = 0, s2 = 0;
    const l = (mx + mn) / 2;
    if (mx !== mn) {
      const d = mx - mn;
      s2 = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === c[0] ? (c[1] - c[2]) / d + (c[1] < c[2] ? 6 : 0) : mx === c[1] ? (c[2] - c[0]) / d + 2 : (c[0] - c[1]) / d + 4;
      h *= 60;
    }
    return [h, s2, l];
  }
  function photoFor(kind, color) {
    const list = PHOTOS[kind];
    if (!list || !list.length) return null;
    const t = hexToHsl(color);
    let best = list[0], bd = Infinity;
    list.forEach((p) => {
      const dh = Math.min(Math.abs(p.hsl[0] - t[0]), 360 - Math.abs(p.hsl[0] - t[0])) / 360;
      const d = Math.abs(p.hsl[2] - t[2]) + dh * 0.35;
      if (d < bd) { bd = d; best = p; }
    });
    return best;
  }
  function photoFilter(p, color) {
    const key = p.src + color;
    if (PFILT.has(key)) return PFILT.get(key);
    const id = "bbp" + gen + "_" + PFILT.size;
    const [sh, ss, sl] = p.hsl, [th, ts, tl] = hexToHsl(color);
    const white = ts < 0.16 && tl > 0.82;
    const sat = white ? 0.1 : Math.max(0.15, Math.min(2.4, ts / Math.max(0.05, ss)));
    const hue = Math.round(th - sh);
    const k = Math.max(0.45, Math.min(2.4, tl / Math.max(0.08, sl)));
    const b = white ? 0.1 : 0;
    const fn = (c) => '<feFunc' + c + ' type="linear" slope="' + k.toFixed(3) + '" intercept="' + b + '"/>';
    const el = '<filter id="' + id + '" x="-25%" y="-25%" width="150%" height="160%" color-interpolation-filters="sRGB">' +
      '<feColorMatrix type="saturate" values="' + sat.toFixed(3) + '"/>' +
      '<feColorMatrix type="hueRotate" values="' + hue + '"/>' +
      "<feComponentTransfer>" + fn("R") + fn("G") + fn("B") + "</feComponentTransfer>" +
      '<feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#3a2418" flood-opacity=".32"/></filter>';
    const host = gradHost();
    if (host) host.insertAdjacentHTML("beforeend", el);
    const url = "url(#" + id + ")";
    PFILT.set(key, url);
    return url;
  }
  function photoImage(p, r, color, deg) {
    const big = r * 2.25, w = p.w >= p.h ? big : big * (p.w / p.h), h = p.w >= p.h ? big * (p.h / p.w) : big;
    return '<image data-photo="1" href="' + p.src + '" x="' + f1(-w / 2) + '" y="' + f1(-h / 2) + '" width="' + f1(w) + '" height="' + f1(h) +
      '" preserveAspectRatio="xMidYMid meet" filter="' + photoFilter(p, color) + '"' + (deg ? ' transform="rotate(' + f1(deg) + ')"' : "") + "/>";
  }

  /* Цвет контура, в который «перетекает» карандаш, когда деталь окрашена */
  const tintOf = (color) => mix(shade(color, 0.3), "#1b1a18", 0.35);

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
  const isBoxed = (w) => w === "box" || w === "basket";

  function layout() {
    const R = mulberry32(state.seed);
    const size = SIZES[state.size];
    const airy = state.style === "airy";
    const Rd = domeR();
    const n = size.stems;
    const kinds = activeFlowers();
    /* В коробке и корзине цветы сидят ниже и плотнее — прямо у бортика */
    const boxed = isBoxed(state.wrap);
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
    const greenish = (hex) => { const c = hexToRgb(hex); return c[1] > c[0] + 8 && c[1] > c[2] + 8; };
    const bloom = pal.filter((c) => !greenish(c));
    const kindColors = {};
    kinds.forEach((id, i) => {
      const src = FLOWERS[id].kind === "hydrangea" || !bloom.length ? pal : bloom;
      kindColors[id] = [src[i % src.length], src[(i + 2) % src.length]];
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
      if ((airy || SPIKES[kind]) && y < cy && R() < (SPIKES[kind] ? 0.7 : 0.45)) { y -= 30 + R() * 55; raised = true; }
      const r = (HEAD_R[kind] || 32) * scaleBySize * (airy ? 0.85 + R() * 0.4 : 0.9 + R() * 0.2);
      const cols = kindColors[id];
      const color = cols[R() < 0.72 ? 0 : 1];
      const color2 = cols[1] === color ? cols[0] : cols[1];
      let rotDeg = R() * 360;
      if (SPIKES[kind] || kind === "anthurium") rotDeg = (Math.atan2(y - cy - 40, x - CX) * 180) / Math.PI + 90 + (R() - 0.5) * 20;
      heads.push({ id, kind, x, y, r, rot: rotDeg, color, color2, raised });
    }
    /* Плотность: мелкие цветы оставляли дыры — подгоняем головки так,
       чтобы они закрывали купол с нахлёстом, как в живом букете. */
    const dome = Math.PI * Rd * 1.03 * Rd * (boxed ? 0.6 : 0.72);
    const cover = heads.reduce((acc, h) => acc + Math.PI * h.r * h.r, 0);
    const k = Math.max(0.9, Math.min(2, Math.sqrt((dome * 1.55) / cover)));
    heads.forEach((h) => { h.r *= k; h.shape = (SHAPES[h.kind] || SHAPES.rose)(h.r, R); });
    heads.sort((a, b) => a.y - b.y);

    /* Зелень по краю купола (верх и бока — низ закрыт упаковкой) */
    const greens = [];
    const g = state.green === null ? GREENS[D.greens[0].id] : GREENS[state.green];
    if (g && g.kind !== "none" && SPRIGS[g.kind]) {
      const count = Math.round(AMOUNTS[state.amount].count * (0.8 + Rd / 660));
      for (let i = 0; i < count; i++) {
        const a = Math.PI * (1.02 + (i / Math.max(1, count - 1)) * 0.96) + (R() - 0.5) * 0.18;
        const rr = Rd * (0.78 + R() * 0.2);
        const x = CX + Math.cos(a) * rr * 1.14;
        const y = cy + Math.sin(a) * rr * (boxed ? 0.7 : 0.82) + 12;
        const big = g.kind === "pampas" ? 105 : g.kind === "tropic" ? 98 : 92;
        const len = big * (0.8 + R() * 0.45) * (airy ? 1.18 : 1) * (0.85 + Rd / 800);
        const r2 = (a * 180) / Math.PI + 90 + (R() - 0.5) * 16;
        greens.push({ kind: g.kind, x, y, rot: r2, len, color: g.color, color2: g.color2 || g.color, shape: SPRIGS[g.kind](len, R) });
      }
    }
    return { heads, greens, Rd, airy, cy };
  }

  /* ════════════════════════════════════════════════════════
     Упаковка — как в студии: матовая плёнка «лепестками»,
     джутовая корзина с биркой PALOMA, белая коробка PALOMA, лента.
     ════════════════════════════════════════════════════════ */
  function ribbonColor() {
    if (state.ribbon !== "auto") return state.ribbon;
    const pal = paletteColors();
    return pal ? (lum(pal[0]) > 0.9 ? pal[1] : pal[0]) : "#ffffff";
  }
  function wrapColor() {
    const w = WRAPS[state.wrap || "film"] || WRAPS.film;
    const c = w.colors[state.wrapColor] || w.colors[0];
    return c ? c[1] : "#ffffff";
  }

  function bow(x, y, s) {
    const lp = (sx) => "M" + x + " " + y + "C" + f1(x + sx * 34 * s) + " " + f1(y - 30 * s) + " " + f1(x + sx * 58 * s) + " " + f1(y - 6 * s) + " " + f1(x + sx * 40 * s) + " " + f1(y + 10 * s) + "C" + f1(x + sx * 26 * s) + " " + f1(y + 20 * s) + " " + f1(x + sx * 10 * s) + " " + f1(y + 6 * s) + " " + x + " " + y + "Z";
    const tail = (sx) => "M" + f1(x - sx * 3) + " " + f1(y + 4) + "C" + f1(x + sx * 10 * s) + " " + f1(y + 40 * s) + " " + f1(x + sx * 6 * s) + " " + f1(y + 70 * s) + " " + f1(x + sx * 22 * s) + " " + f1(y + 120 * s) + "L" + f1(x + sx * 34 * s) + " " + f1(y + 112 * s) + "C" + f1(x + sx * 20 * s) + " " + f1(y + 62 * s) + " " + f1(x + sx * 24 * s) + " " + f1(y + 34 * s) + " " + f1(x + sx * 8) + " " + f1(y + 2) + "Z";
    return [
      { d: tail(-1), tone: 0.12, g: "satin", rib: true }, { d: tail(1), tone: 0.06, g: "satin", rib: true },
      { d: lp(-1), tone: 0.04, g: "satin", rib: true, glow: true }, { d: lp(1), tone: 0, g: "satin", rib: true },
      { d: ellipse(9 * s, 8 * s, x, y), tone: 0.16, g: "ball", rib: true },
    ];
  }

  /* Лист плёнки: снизу у стеблей, раскрывается к верхнему краю */
  function sheet(x0, y0, x1, y1, x2, y2, curl) {
    return "M" + f1(x0) + " " + f1(y0) + "L" + f1(x1) + " " + f1(y1) +
      "Q" + f1((x1 + x2) / 2 + curl[0]) + " " + f1((y1 + y2) / 2 + curl[1]) + " " + f1(x2) + " " + f1(y2) + "Z";
  }

  function buildWrap(Rd) {
    const R = mulberry32(state.seed + 7);
    const kind = (WRAPS[state.wrap || "film"] || WRAPS.film).kind;
    /* Каждая деталь — отдельный слой, чтобы линии задних деталей
       не просвечивали сквозь передние (листы плёнки, бант). */
    const back = { fills: [], inks: [] };
    const parts = [];
    let front = { fills: [], inks: [] };
    const cut = () => { if (front.fills.length) parts.push(front); front = { fills: [], inks: [] }; };
    const rib = (list) => { cut(); list.forEach((f) => front.fills.push(f)); cut(); };

    if (kind === "film") {
      /* Сзади — веер из больших матовых «лепестков» над букетом */
      const tipY = WRAP_TIP - 40;
      const n = 6;
      for (let i = 0; i < n; i++) {
        const a = Math.PI * (1.1 + (0.8 * i) / (n - 1)) + (R() - 0.5) * 0.08;
        const rr = Rd * (1.32 + R() * 0.12);
        const ex = CX + Math.cos(a) * rr * 1.08, ey = CY + 10 + Math.sin(a) * rr * 0.92;
        const spread = Rd * 0.42;
        const nx = -Math.sin(a), ny = Math.cos(a);
        back.fills.push({
          d: sheet(CX + (R() - 0.5) * 20, tipY, ex - nx * spread, ey - ny * spread, ex + nx * spread, ey + ny * spread,
            [Math.cos(a) * Rd * 0.18, Math.sin(a) * Rd * 0.18]),
          tone: 0.1 + (i % 2) * 0.08, g: "film", glow: i === 2,
        });
        back.inks.push({ d: "M" + f1(CX) + " " + f1(tipY) + "L" + f1(ex) + " " + f1(ey) });
      }
      /* Спереди — два листа крест-накрест закрывают стебли */
      const yl = CY + Rd * 0.42, yr = CY + Rd * 0.36;
      cut();
      front.fills.push({ d: "M" + CX + " " + WRAP_TIP + "L" + f1(CX + Rd * 1.25) + " " + f1(yr) + "Q" + f1(CX + Rd * 0.5) + " " + f1(CY + Rd * 0.66) + " " + f1(CX - Rd * 0.22) + " " + f1(CY + Rd * 0.86) + "Z", tone: 0.12, g: "film" });
      front.inks.push({ d: "M" + f1(CX + 18) + " " + (WRAP_TIP - 60) + "L" + f1(CX + Rd * 0.55) + " " + f1(CY + Rd * 0.7), sheen: true });
      cut();
      front.fills.push({ d: "M" + CX + " " + WRAP_TIP + "L" + f1(CX - Rd * 1.25) + " " + f1(yl) + "Q" + f1(CX - Rd * 0.42) + " " + f1(CY + Rd * 0.7) + " " + f1(CX + Rd * 0.32) + " " + f1(CY + Rd * 0.8) + "Z", tone: 0, g: "film", glow: true });
      front.inks.push({ d: "M" + f1(CX - Rd * 0.9) + " " + f1(yl + 40) + "Q" + f1(CX - Rd * 0.5) + " " + f1(yl + 60) + " " + f1(CX - Rd * 0.28) + " " + f1(yl + 120), sheen: true });
      rib(bow(CX, 588, 1));
    } else if (kind === "box" || kind === "basket") {
      const basket = kind === "basket";
      const rx = Rd * (basket ? 1.1 : 0.98), ry = Rd * (basket ? 0.2 : 0.17);
      const yTop = CY + Rd * 0.68;
      const H = Math.min(WRAP_TIP - 10 - yTop, Rd * (basket ? 0.95 : 1.15));
      back.fills.push({ d: ellipse(rx, ry, CX, yTop), tone: 0.55, g: "flat" });
      const bot = yTop + H;
      const bx = basket ? rx * 0.82 : rx * 0.9;
      const body = "M" + f1(CX - rx) + " " + f1(yTop) + "L" + f1(CX - bx) + " " + f1(bot) + "A" + f1(bx) + " " + f1(ry) + " 0 0 0 " + f1(CX + bx) + " " + f1(bot) + "L" + f1(CX + rx) + " " + f1(yTop) + "A" + f1(rx) + " " + f1(ry) + " 0 0 1 " + f1(CX - rx) + " " + f1(yTop) + "Z";
      if (basket) {
        /* Джутовый шнур: ряды витков сверху вниз */
        front.fills.push({ d: body, tone: 0.2, g: "flat" });
        const rows = 9;
        for (let k = 0; k < rows; k++) {
          const y = yTop + (H * k) / rows, w = rx - (rx - bx) * (k / rows), w2 = rx - (rx - bx) * ((k + 1) / rows);
          const y2 = yTop + (H * (k + 1)) / rows;
          front.fills.push({ d: "M" + f1(CX - w) + " " + f1(y) + "A" + f1(w) + " " + f1(ry) + " 0 0 0 " + f1(CX + w) + " " + f1(y) + "L" + f1(CX + w2) + " " + f1(y2) + "A" + f1(w2) + " " + f1(ry) + " 0 0 1 " + f1(CX - w2) + " " + f1(y2) + "Z", tone: (k % 2) * 0.08, g: "rope" });
        }
        cut();
        /* Бирка PALOMA, как на корзинах студии */
        const tx = CX + rx * 0.18, ty = yTop + H * 0.12;
        front.fills.push({ d: "M" + f1(tx) + " " + f1(ty) + "l40 -6l14 96l-40 6Z", fix: "#fbf8f4", tone: 0, g: "flat", label: { x: tx + 26, y: ty + 48, rot: 82, size: 15 } });
        cut();
      } else {
        front.fills.push({ d: body, tone: 0.04, g: "ball", glow: true, label: { x: CX, y: yTop + H * 0.58, rot: 0, size: Math.round(Rd * 0.2) } });
        cut();
        rib(bow(CX + rx * 0.42, yTop + H * 0.2, 0.75));
      }
    } else {
      /* На ленте: стебли видны, лента обвивает букет */
      front.fills.push({ d: "M" + (CX - 22) + " 552Q" + CX + " 562 " + (CX + 22) + " 552L" + (CX + 22) + " 582Q" + CX + " 592 " + (CX - 22) + " 582Z", tone: 0.1, g: "satin", rib: true });
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

  /* item: { fills, inks } → группа из трёх слоёв: белая подложка,
     краска (под маской, которая растекается) и карандашный контур */
  function itemSVG(key, shape, colorOf, opts) {
    const id = "bbc" + gen + "_" + key;
    const o = opts || {};
    let base = "", paint = "", ink = "", labels = "";
    shape.fills.forEach((f) => {
      base += "<path " + pathAttrs(f) + ' fill="#fff"/>';
      paint += "<path " + pathAttrs(f) + ' fill="' + colorOf(f) + '" data-tone="' + (f.tone || 0) + '" data-g="' + (f.g || "flat") + '"' +
        (f.fix ? ' data-fix="' + f.fix + '"' : "") + (f.alt ? ' data-alt="1"' : "") + (f.rib ? ' data-rib="1"' : "") + "/>";
      if (f.glow) paint += "<path " + pathAttrs(f) + ' fill="url(#bbGlow)"/>';
      ink += "<path " + pathAttrs(f) + ' pathLength="1"/>';
      if (f.label) {
        labels += '<text class="bb-label" x="' + f1(f.label.x) + '" y="' + f1(f.label.y) + '" font-size="' + f.label.size + '"' +
          (f.label.rot ? ' transform="rotate(' + f.label.rot + " " + f1(f.label.x) + " " + f1(f.label.y) + ')"' : "") + ">PALOMA</text>";
      }
    });
    shape.inks.forEach((k) => {
      ink += "<path " + pathAttrs(k) + ' pathLength="1"' + (k.sheen ? ' class="bb-sheen"' : "") + "/>";
    });
    /* Настоящий цветок: снимок заменяет нарисованные лепестки в слое краски,
       а карандашный эскиз (подложка и контур) остаётся до окраски */
    if (o.photo) paint = o.photo;
    const clipT = o.origin ? "translate(" + o.origin[0] + " " + o.origin[1] + ") scale(0)" : "scale(0)";
    const style = [];
    if (o.delay != null) style.push("--d:" + o.delay + "ms");
    if (o.tint) style.push("--tint:" + o.tint);
    return '<g class="bb-item ' + (o.cls || "") + (o.photo ? " is-photo" : "") + '" data-key="' + key + '"' + (o.t ? ' transform="' + o.t + '"' : "") + (style.length ? ' style="' + style.join(";") + '"' : "") + ">" +
      '<clipPath id="' + id + '"><path class="bb-clip" d="' + BLOB + '" transform="' + clipT + '"/></clipPath>' +
      '<g class="bb-base">' + base + "</g>" +
      '<g class="bb-paint" clip-path="url(#' + id + ')">' + paint + labels + "</g>" +
      '<g class="bb-ink">' + ink + "</g></g>";
  }

  function headColor(h) {
    return (f) => paintFill(f.g, f.fix || (f.alt ? h.color2 : h.color), f.fix ? 0 : f.tone);
  }
  const greenColor = (g) => (f) => paintFill(f.g, f.fix || (f.alt ? g.color2 : g.color), f.tone);

  /* Купол: цветы у края букета чуть развёрнуты в сторону и видны овалом,
     в центре смотрят прямо на нас — как у живого букета на фото */
  function headTransform(h) {
    const pos = "translate(" + f1(h.x) + " " + f1(h.y) + ")";
    if (SPIKES[h.kind]) return pos + " rotate(" + f1(h.rot) + ")";
    const ph = photoFor(h.kind, h.color);
    if (ph) return pos + " rotate(" + f1(ph.free ? h.rot : (h.rot % 36) - 18) + ")";
    const dx = h.x - CX, dy = h.y - (model.cy || CY);
    const t = Math.min(1, Math.hypot(dx / 1.14, dy / 0.8) / (model.Rd || 130));
    const out = (Math.atan2(dy, dx) * 180) / Math.PI;
    const squash = 1 - 0.34 * t * t;
    return pos + " rotate(" + f1(out) + ") scale(" + f1(squash * 100) / 100 + " 1) rotate(" + f1(h.rot - out) + ")";
  }

  function render() {
    gen++;
    resetGrads();
    model = layout();
    model.wrap = buildWrap(model.Rd);
    const { heads, greens } = model;
    const bind = model.wrap.kind === "ribbon" ? 568 : 588;
    const dist = (x, y) => Math.hypot(x - CX, y - CY);

    let html = "";
    /* Мягкая тень на «столе» */
    html += '<ellipse class="bb-ground" cx="' + CX + '" cy="732" rx="' + f1(model.Rd * 0.95) + '" ry="16"/>';

    const wc = wrapColor(), rc = ribbonColor();
    const wrapFill = (f) => (f.fix ? paintFill(f.g, f.fix, 0) : paintFill(f.g, f.rib ? rc : wc, f.tone));
    if (model.wrap.back.fills.length) {
      html += itemSVG("wb", model.wrap.back, wrapFill, { cls: "bb-wrap", origin: [CX, WRAP_TIP], delay: 0, tint: tintOf(wc) });
    }

    greens.forEach((g, i) => {
      html += itemSVG("g" + i, g.shape, greenColor(g), {
        cls: "bb-green", t: "translate(" + f1(g.x) + " " + f1(g.y) + ") rotate(" + f1(g.rot) + ")",
        delay: 80 + Math.round(dist(g.x, g.y) * 1.4), tint: tintOf(g.color),
      });
    });

    /* Стебли */
    let stems = "";
    const boxed = isBoxed(model.wrap.kind);
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
      h.photo = photoFor(h.kind, h.color);
      html += itemSVG("h" + i, h.shape, headColor(h), {
        photo: h.photo ? photoImage(h.photo, h.r, h.color, 0) : null,
        cls: "bb-head", t: headTransform(h),
        delay: 200 + Math.round(dist(h.x, h.y) * 2), tint: tintOf(h.color),
      });
    });

    model.wrap.parts.forEach((p, i) => {
      html += itemSVG("w" + i, p, wrapFill, { cls: "bb-wrap", origin: [CX, WRAP_TIP], delay: 120 + i * 60, tint: tintOf(p.fills[0] && p.fills[0].rib ? rc : wc) });
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
    if (key[0] === "h") { const h = model.heads[+key.slice(1)]; return h.r * (SPIKES[h.kind] ? 2.8 : 2.1); }
    return model.greens[+key.slice(1)].len * 1.4;
  }
  /* Окрашенная деталь: контур из карандаша становится цветным краем,
     появляется тень — класс is-on (см. bouquet-builder.css) */
  function paintGroup(sel, on, baseDelay, stepMul) {
    svg.querySelectorAll(".bb-item" + sel).forEach((g) => {
      const clip = g.querySelector(".bb-clip");
      const d = parseFloat(g.style.getPropertyValue("--d")) || 0;
      if (on) {
        const delay = baseDelay + d * stepMul;
        spread(clip, maxScale(g), delay, 950);
        clearTimeout(g._on);
        g._on = setTimeout(() => g.classList.add("is-on"), Math.max(0, delay) + 200);
      } else {
        spread(clip, 0, 0, 1);
        clearTimeout(g._on);
        g.classList.remove("is-on");
      }
    });
  }

  /* Перекраска без перерисовки: старый цвет остаётся снизу,
     новый растекается поверх. */
  function repaint(sel, colorOf, tintFor, photoOf) {
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
      if (photoOf) paint.querySelectorAll("image[data-photo]").forEach((im) => photoOf(g, im));
      if (tintFor) g.style.setProperty("--tint", tintFor(g));
      const m = /translate\([^)]*\)\s*/.exec(clip.getAttribute("transform") || "");
      clip.setAttribute("transform", (m ? m[0] : "") + "scale(0)");
      const d = parseFloat(g.style.getPropertyValue("--d")) || 0;
      spread(clip, maxScale(g), d * 0.8, 900, () => { if (old) old.remove(); });
      clearTimeout(g._on);
      g._on = setTimeout(() => g.classList.add("is-on"), d * 0.8 + 200);
    });
  }

  function repaintHeads() {
    const pal = paletteColors();
    svg.classList.toggle("is-heads", !!pal);
    if (!pal) { paintGroup(".bb-head", false, 0, 0); return; }
    /* Цвета пересчитываются той же раскладкой (seed тот же) */
    const fresh = layout();
    model.heads.forEach((h, i) => { h.color = fresh.heads[i].color; h.color2 = fresh.heads[i].color2; });
    const headOf = (g) => model.heads[+g.dataset.key.slice(1)];
    repaint(".bb-head", (g, p) => {
      const h = headOf(g);
      if (p.dataset.fix) return paintFill(p.dataset.g, p.dataset.fix, 0);
      return paintFill(p.dataset.g, p.dataset.alt ? h.color2 : h.color, +p.dataset.tone);
    }, (g) => tintOf(headOf(g).color), (g, im) => {
      const h = headOf(g);
      const p = photoFor(h.kind, h.color);
      if (!p) return;
      im.setAttribute("href", p.src);
      im.setAttribute("filter", photoFilter(p, h.color));
    });
    /* Лента «в тон» следует за палитрой */
    if (state.ribbon === "auto" && state.wrap !== null) repaintWrap();
  }
  function repaintWrap() {
    const wc = wrapColor(), rc = ribbonColor();
    repaint(".bb-wrap", (g, p) => (p.dataset.fix ? paintFill(p.dataset.g, p.dataset.fix, 0) : paintFill(p.dataset.g, p.dataset.rib ? rc : wc, +p.dataset.tone)), () => tintOf(wc));
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
    const w = WRAPS[state.wrap || "film"];
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
    const pill = (attr, val, html, extra) =>
      '<button type="button" class="pdp-size-btn' + (extra ? " " + extra : "") + '" data-' + attr + '="' + val + '" aria-pressed="false" data-cursor="hover">' + html + "</button>";
    /* Размер — как размерный ряд в карточке товара */
    $("#bbSizes").innerHTML = D.sizes.map((s) => pill("size", s.code, s.name + " · " + s.stems + " шт")).join("");
    $("#bbStyles").innerHTML = D.styles.map((s) => pill("style", s.code, s.name)).join("");

    /* Палитры: пилюля с кружком из пяти оттенков */
    const ring = (cols) => "conic-gradient(" + cols.map((c, i) => c + " " + (i * 100) / cols.length + "% " + ((i + 1) * 100) / cols.length + "%").join(",") + ")";
    buildControls.ring = ring;
    $("#bbPalettes").innerHTML = D.palettes.map((p) =>
      pill("palette", p.code, '<i class="bb-dot" style="background:' + ring(p.colors) + '"></i>' + p.name, "bb-pal")).join("") +
      pill("palette", "custom", '<i class="bb-dot bb-dot--custom" id="bbCustomDot"></i>Своя палитра', "bb-pal");
    $("#bbSwatches").innerHTML = D.swatches.map((c) =>
      '<button type="button" class="bb-swatch" data-swatch="' + c + '" style="--c:' + c + '" aria-label="Цвет ' + c + '" aria-pressed="false"></button>').join("");

    /* Цветы и зелень — плитки с рисунком, как карточки допов */
    $("#bbStockDate").textContent = D.stockUpdated;
    $("#bbFlowers").innerHTML = D.flowers.filter((f) => f.inStock).map((f) =>
      '<button type="button" class="bb-tile" data-flower="' + f.id + '" aria-pressed="false" title="' + esc(f.note) + '" data-cursor="hover">' +
      miniIcon(f.kind) + '<span class="bb-tile__name">' + f.name + "</span>" +
      '<span class="bb-tile__note">' + esc(f.note) + "</span>" +
      '<span class="bb-tile__hero">акцент</span></button>').join("");
    $("#bbGreens").innerHTML = D.greens.map((g) =>
      '<button type="button" class="bb-tile" data-green="' + g.id + '" aria-pressed="false" data-cursor="hover">' +
      (g.kind === "none" ? '<svg class="bb-mini" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="12" fill="none"/><path d="M16 32L32 16" fill="none"/></svg>' : miniIcon(g.kind, true)) +
      '<span class="bb-tile__name">' + g.name + "</span></button>").join("");
    $("#bbAmounts").innerHTML = D.greenAmounts.map((a) => pill("amount", a.code, a.name)).join("");

    /* Упаковка */
    $("#bbWraps").innerHTML = D.wraps.map((w) =>
      pill("wrap", w.id, w.name + (w.extra ? '<span class="bb-pill-extra">+ ' + fmt(w.extra) + "</span>" : ""))).join("");
    $("#bbRibbons").innerHTML = D.ribbons.map((r) =>
      '<button type="button" class="bb-swatch' + (r[1] === "auto" ? " is-auto" : "") + '" data-ribbon="' + r[1] + '" style="--c:' + (r[1] === "auto" ? "transparent" : r[1]) + '" aria-pressed="false" title="' + r[0] + '" aria-label="' + r[0] + '"></button>').join("");
  }

  function renderWrapColors() {
    const w = WRAPS[state.wrap || "film"];
    $("#bbWrapColors").innerHTML = w.colors.map((c, i) =>
      '<button type="button" class="bb-swatch" data-wrapcolor="' + i + '" style="--c:' + c[1] + '" aria-pressed="' + (i === state.wrapColor) + '" title="' + c[0] + '" aria-label="' + c[0] + '"></button>').join("");
    const wc = w.colors[state.wrapColor] || w.colors[0];
    $("#bbWrapColorName").textContent = wc ? wc[0].toLowerCase() : "";
    const rib = D.ribbons.find((r) => r[1] === state.ribbon);
    $("#bbRibbonName").textContent = rib ? rib[0].toLowerCase() : "";
    $("#bbWrapColorsRow").hidden = !w.colors.length || state.wrap === null;
    $("#bbRibbonRow").hidden = state.wrap === null;
  }

  /* Короткие итоги шага — справа в заголовке аккордеона */
  function stepSummaries() {
    const s = SIZES[state.size];
    const pal = state.palette === "custom" ? "своя палитра" : state.palette ? PALETTES[state.palette].name : "";
    const fl = state.florist ? "на выбор флориста" : state.flowers.map((id) => FLOWERS[id].name).join(", ");
    const g = state.green === null ? "" : state.green === "none" ? "без зелени" : GREENS[state.green].name + ", " + AMOUNTS[state.amount].name.toLowerCase();
    let w = "";
    if (state.wrap !== null) {
      const wr = WRAPS[state.wrap], c = wr.colors[state.wrapColor];
      w = wr.name + (c ? ", " + c[0].toLowerCase() : "");
    }
    const det = [state.date ? state.date.split("-").reverse().slice(0, 2).join(".") : "", state.receive === "pickup" ? "самовывоз" : "", state.card ? "открытка" : ""].filter(Boolean).join(" · ");
    return { 1: s.name + " · " + STYLES[state.style].name.toLowerCase(), 2: pal, 3: fl, 4: g, 5: w, 6: det };
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

    const sum = stepSummaries();
    Object.keys(sum).forEach((k) => {
      const el = $("#bbSum" + k);
      el.textContent = sum[k];
      el.closest(".bb-step").classList.toggle("is-done", !!sum[k]);
    });

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
      if (was === null && ds.wrap === "film") repaintWrap(); else rerender();
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
    } else if (b.id === "bbSend") {
      openSend(); return;
    } else if (ds.next) {
      openStep(+ds.next); return;
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

  /* ── шаги-аккордеоны: открыт один шаг за раз ─────────── */
  function openStep(n) {
    const target = $('.bb-step[data-step="' + n + '"]');
    if (!target) return;
    /* Сначала закрываем остальные, иначе высота над шагом меняется
       уже после расчёта прокрутки и шаг уезжает под эскиз */
    $$(".bb-step").forEach((o) => { if (o !== target) o.open = false; });
    target.open = true;
    requestAnimationFrame(() => {
      const top = target.getBoundingClientRect().top;
      /* Верхняя граница видимой области: шапка сайта, а на телефоне —
         ещё и прилипший эскиз */
      let edge = parseFloat(getComputedStyle(document.getElementById("main")).getPropertyValue("--bb-head")) || 0;
      const gal = $(".bb .pdp-gallery");
      if (gal && getComputedStyle(gal).position === "sticky" && window.innerWidth <= 900) edge += gal.offsetHeight;
      if (top < edge + 8 || top > window.innerHeight * 0.7) {
        window.scrollTo({ top: window.scrollY + top - edge - 12, behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
  }
  function bindSteps() {
    $$(".bb-step").forEach((d) => d.addEventListener("toggle", () => {
      if (!d.open) return;
      $$(".bb-step").forEach((o) => { if (o !== d) o.open = false; });
    }));
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
  async function inlinePhotos(clone) {
    const imgs = Array.from(clone.querySelectorAll("image[data-photo]"));
    const cache = {};
    await Promise.all(imgs.map(async (im) => {
      const src = im.getAttribute("href");
      if (!cache[src]) {
        cache[src] = fetch(src).then((r) => r.blob()).then((b) => new Promise((res) => {
          const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b);
        })).catch(() => src);
      }
      im.setAttribute("href", await cache[src]);
    }));
  }
  async function saveImage() {
    const clone = svg.cloneNode(true);
    await inlinePhotos(clone);
    clone.classList.remove("is-sketch", "bb-draw");
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", "1200");
    clone.setAttribute("height", "1440");
    /* Стили контура — прямо в файл, иначе картинка выйдет без линий */
    const st = document.createElementNS("http://www.w3.org/2000/svg", "style");
    st.textContent = ".bb-ink path{fill:none;stroke:" + INK + ";stroke-width:1.4px;stroke-linecap:round;stroke-linejoin:round}.bb-sheen{stroke:#fff!important;opacity:.7}.bb-stems path{fill:none;stroke:" + (svg.classList.contains("is-heads") ? "#6d8a58" : INK) + ";stroke-width:1.4px}.bb-ground{fill:rgba(27,26,24,.06)}" +
      /* те же правила окраски, что на странице: цветной край, тень, надпись */
      ".bb-paint path[data-tone]{stroke:var(--tint,#2a2522);stroke-opacity:.28;stroke-width:.7px;stroke-linejoin:round}.bb-wrap .bb-paint path[data-tone]{stroke-opacity:.14}.bb-item.is-on .bb-ink{opacity:0}.bb-item.is-on.bb-wrap .bb-ink{opacity:1}.bb-item.is-on.bb-wrap .bb-ink path:not(.bb-sheen){stroke-opacity:0}" +
      ".bb-head.is-on:not(.is-photo)>.bb-base,.bb-green.is-on>.bb-base{filter:url(#bbShade)}.bb-head.is-photo.is-on>.bb-base{opacity:0}.bb-label{font-family:Italiana,Georgia,serif;letter-spacing:.2em;fill:#1b1a18;fill-opacity:.72;text-anchor:middle;dominant-baseline:middle}";
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
    $("#bbDialogCompose").innerHTML = compositionLines().map((l) =>
      '<div class="pdp-info__row"><span class="pdp-info__row-label">' + esc(l[0]) + '</span><span class="pdp-info__row-val">' + esc(l[1]) + "</span></div>").join("");
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
  }
  measureHead();
  window.addEventListener("resize", measureHead);
  window.addEventListener("scroll", () => { if (!measureHead.t) measureHead.t = setTimeout(() => { measureHead.t = 0; measureHead(); }, 200); }, { passive: true });

  buildControls();
  const fromLink = loadInitial();
  syncControls();
  render();
  bindSteps();
  bindSketchHold();
  onFlowerHold();
  bindForm();
  document.addEventListener("click", onClick);
  if (fromLink) toast("Открыт эскиз по ссылке");
})();
