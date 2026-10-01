/* ════════════════════════════════════════════════════════
   bouquet-builder.js — конструктор авторского букета («раскраска»)

   Слева — букет, нарисованный тонким контуром, как страница
   раскраски. Клиент выбирает размер, палитру, цветы и упаковку —
   и контур заливается цветом. Справа — четыре простых шага.

   Как устроено:
   • layout() — раскладка: сколько головок, где каждая стоит, какой
     цветок, зелень и упаковка. Пересчитывается при смене размера,
     цветов, зелени, упаковки или по кнопке «Перемешать»;
   • render() — рисует раскладку в SVG: у каждой детали есть ключ
     цвета (data-k) и оттенок (data-t: светлее/темнее);
   • paint() — только перекрашивает: при смене палитры краска
     разливается по контуру, а рисунок остаётся тем же.

   Готовый эскиз уходит менеджеру через palomaSendLead (lead-send.js).
   ════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  const D = window.PALOMA_BUILDER_DATA;
  const svg = document.getElementById("bbSvg");
  const art = document.getElementById("bbArt");
  if (!D || !svg || !art) return;

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduceMotion = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const f1 = (n) => Math.round(n * 10) / 10;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
  const byId = (list, id) => (list || []).find((x) => x.id === id || x.code === id);

  const MAX_FLOWERS = 3;
  const FLORIST_MIX = ["pion-rose", "hydrangea", "eustoma", "spray"];
  const SPIKES = { delph: 1, matthiola: 1 };
  const HEADS = { S: 7, M: 11, L: 15, XL: 19 };
  const HEAD_R = { S: 60, M: 57, L: 54, XL: 51 };
  const KIND_K = { hydrangea: 1.3, peony: 1.05, pion: 1.15, spray: 1.05, rose: 0.9, eustoma: 0.92, carnation: 0.85, dahlia: 1.08, pompon: 0.8, chrysball: 0.95, anthurium: 1.0, ranunculus: 0.85 };
  const VIEW_W = 600, VIEW_H = 750, CX = 300;
  const GREENS_SHOWN = ["eucalyptus", "raspleaf", "pampas", "none"];

  const state = { size: "M", palette: null, flowers: [], green: "eucalyptus", wrap: "film", seed: 7, date: "", comment: "", card: false, cardText: "", receive: "delivery" };

  /* ── случайность с зерном: один и тот же выбор — один и тот же рисунок ── */
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ── цвет ─────────────────────────────────────────────── */
  function hexRgb(h) {
    h = h.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgbHex = (c) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  /* t < 0 — светлее (к белому), t > 0 — глубже того же тона */
  function tone(hex, t) {
    const c = hexRgb(hex);
    if (t < 0) return rgbHex(c.map((v) => v + (255 - v) * -t));
    return rgbHex(c.map((v) => v * (1 - t * 0.42)));
  }
  function hsl(hex) {
    const [r, g, b] = hexRgb(hex).map((v) => v / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    let h = 0, s = 0;
    if (mx !== mn) {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = (mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60;
    }
    return [h, s, l];
  }
  const isGreen = (hex) => { const [h, s, l] = hsl(hex); return h > 65 && h < 170 && s > 0.12 && l < 0.9; };

  /* ── геометрия ────────────────────────────────────────── */
  function P(a, ox, oy) {
    const c = Math.cos(a), s = Math.sin(a);
    return (x, y) => f1(ox + x * c - y * s) + " " + f1(oy + x * s + y * c);
  }
  /* Лепесток вдоль угла a: от r0 до r1, полуширина w.
     kind: round — округлый, point — острый, ruffle — с выемкой, fringe — зубчатый */
  function petal(a, r0, r1, w, kind, ox, oy) {
    const p = P(a, ox || 0, oy || 0), L = r1 - r0;
    if (kind === "point") {
      return "M" + p(r0, 0) + "C" + p(r0 + L * 0.25, -w) + " " + p(r0 + L * 0.72, -w * 0.85) + " " + p(r1, 0) +
        "C" + p(r0 + L * 0.72, w * 0.85) + " " + p(r0 + L * 0.25, w) + " " + p(r0, 0) + "Z";
    }
    let d = "M" + p(r0, 0) + "C" + p(r0 + L * 0.05, -w * 0.85) + " " + p(r0 + L * 0.45, -w * 1.05) + " " + p(r0 + L * 0.78, -w * 0.86);
    if (kind === "ruffle") {
      d += "C" + p(r1, -w * 0.74) + " " + p(r1 + L * 0.05, -w * 0.2) + " " + p(r1 - L * 0.06, 0) +
        "C" + p(r1 + L * 0.05, w * 0.2) + " " + p(r1, w * 0.74) + " " + p(r0 + L * 0.78, w * 0.86);
    } else if (kind === "fringe") {
      for (let i = 1; i <= 8; i++) {
        const y = -w * 0.86 + (w * 1.72 * i) / 8, q = Math.abs(y / w);
        const x = i === 8 ? r0 + L * 0.78 : r0 + L * (i % 2 ? 1.02 - 0.12 * q : 0.9 - 0.1 * q);
        d += "L" + p(x, y);
      }
    } else {
      d += "C" + p(r1 + L * 0.03, -w * 0.55) + " " + p(r1 + L * 0.03, w * 0.55) + " " + p(r0 + L * 0.78, w * 0.86);
    }
    return d + "C" + p(r0 + L * 0.45, w * 1.05) + " " + p(r0 + L * 0.05, w * 0.85) + " " + p(r0, 0) + "Z";
  }
  function vein(a, r0, r1, ox, oy) {
    const p = P(a, ox || 0, oy || 0), L = r1 - r0;
    return "M" + p(r0 + L * 0.18, 0) + "Q" + p(r0 + L * 0.5, L * 0.04) + " " + p(r0 + L * 0.8, 0);
  }
  function cupArc(a, r0, r1, w) {
    const p = P(a, 0, 0), L = r1 - r0;
    return "M" + p(r0 + L * 0.5, -w * 0.62) + "Q" + p(r0 + L * 0.8, 0) + " " + p(r0 + L * 0.5, w * 0.62);
  }
  function ellipseD(cx, cy, rx, ry, rot) {
    const p = P(rot || 0, cx, cy), k = 0.5523;
    return "M" + p(rx, 0) + "C" + p(rx, ry * k) + " " + p(rx * k, ry) + " " + p(0, ry) + "C" + p(-rx * k, ry) + " " + p(-rx, ry * k) + " " + p(-rx, 0) +
      "C" + p(-rx, -ry * k) + " " + p(-rx * k, -ry) + " " + p(0, -ry) + "C" + p(rx * k, -ry) + " " + p(rx, -ry * k) + " " + p(rx, 0) + "Z";
  }
  const circleD = (cx, cy, r) => ellipseD(cx, cy, r, r, 0);
  function arcD(rr, a1, a2) {
    return "M" + f1(Math.cos(a1) * rr) + " " + f1(Math.sin(a1) * rr) + "A" + f1(rr) + " " + f1(rr) + " 0 " + (a2 - a1 > Math.PI ? 1 : 0) + " 1 " + f1(Math.cos(a2) * rr) + " " + f1(Math.sin(a2) * rr);
  }
  function blobD(r, n, amp, R) {
    const pts = [], a0 = R() * 6.28;
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * Math.PI * 2, rr = r * (1 - amp * R());
      pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m = mid(pts[n - 1], pts[0]);
    let d = "M" + f1(m[0]) + " " + f1(m[1]);
    for (let i = 0; i < n; i++) {
      const mm = mid(pts[i], pts[(i + 1) % n]);
      d += "Q" + f1(pts[i][0]) + " " + f1(pts[i][1]) + " " + f1(mm[0]) + " " + f1(mm[1]);
    }
    return d + "Z";
  }
  function spiral(r0, r1, turns, a0) {
    const T = turns * Math.PI * 2;
    let d = "";
    for (let th = 0; th <= T; th += 0.28) {
      const rr = r0 + ((r1 - r0) * th) / T;
      d += (d ? "L" : "M") + f1(Math.cos(th + a0) * rr) + " " + f1(Math.sin(th + a0) * rr);
    }
    return d;
  }

  /* Кольцо лепестков. Деталь: { d, t } — заливка с контуром,
     { d, ln: 1 } — тонкая линия (прожилка, изгиб), k — свой цвет */
  function ring(o, n, r0, r1, w, kind, t, a0, R, opt) {
    opt = opt || {};
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * Math.PI * 2 + (R() - 0.5) * 0.12;
      const rr = r1 * (0.95 + R() * 0.08);
      o.push({ d: petal(a, r0, rr, w, kind), t: t + (R() - 0.5) * 0.06 });
      if (opt.vein) o.push({ d: vein(a, r0, rr), ln: 1 });
      if (opt.cup) o.push({ d: cupArc(a, r0, rr, w), ln: 1 });
    }
  }

  /* ════════════════════════════════════════════════════════
     Цветы — вид сверху, центр в 0,0, радиус r
     ════════════════════════════════════════════════════════ */
  const SH = {
    rose(r, R) {
      const o = [], a0 = R() * 6.28;
      ring(o, 5, r * 0.1, r, r * 0.52, "round", -0.22, a0, R);
      ring(o, 4, r * 0.08, r * 0.74, r * 0.42, "round", -0.04, a0 + 0.7, R);
      o.push({ d: circleD(0, 0, r * 0.42), t: 0.18 });
      o.push({ d: spiral(r * 0.04, r * 0.4, 2.3, a0), ln: 1 });
      return o;
    },
    /* Пионовидная (садовая) роза: волнистые лепестки и «чашка» */
    peony(r, R, extra) {
      const o = [], a0 = R() * 6.28, e = extra || 0;
      ring(o, 6 + e, r * 0.15, r, r * 0.5, "ruffle", -0.24, a0, R);
      ring(o, 6 + e, r * 0.12, r * 0.8, r * 0.42, "ruffle", -0.08, a0 + 0.5, R);
      ring(o, 5 + e, r * 0.1, r * 0.6, r * 0.34, "round", 0.08, a0 + 1.1, R);
      o.push({ d: circleD(0, 0, r * 0.34), t: 0.25 });
      for (let k = 0; k < 4; k++) {
        const a1 = R() * 6.28;
        o.push({ d: arcD(r * (0.08 + 0.065 * k), a1, a1 + 2.2 + R()), ln: 1 });
      }
      return o;
    },
    pion(r, R) { return SH.peony(r, R, 2); },
    spray(r, R) {
      const sub = (dx, dy, s) => SH.rose(r * s, R).map((it) => Object.assign({}, it, { tf: "translate(" + f1(dx) + " " + f1(dy) + ")" }));
      const bx = r * 0.7, by = r * 0.42, ba = 0.6;
      const bud = [
        { d: ellipseD(bx, by, r * 0.17, r * 0.26, ba), t: 0.05 },
        { d: petal(ba + Math.PI / 2 + 0.5, r * 0.05, r * 0.3, r * 0.07, "point", bx, by), t: 0, k: "gr" },
        { d: petal(ba + Math.PI / 2 - 0.5, r * 0.05, r * 0.3, r * 0.07, "point", bx, by), t: 0, k: "gr" },
      ];
      return [].concat(sub(r * 0.38, -r * 0.34, 0.55), sub(-r * 0.4, -r * 0.18, 0.56), bud, sub(-r * 0.02, r * 0.32, 0.6));
    },
    hydrangea(r, R) {
      const o = [{ d: blobD(r * 0.98, 14, 0.1, R), t: 0.12 }];
      const n = 20, a0 = R() * 6.28, fl = [];
      for (let i = 0; i < n; i++) {
        const rr = r * 0.8 * Math.sqrt((i + 0.5) / n), a = a0 + i * 2.39996;
        fl.push([Math.cos(a) * rr, Math.sin(a) * rr]);
      }
      fl.sort((a, b) => a[1] - b[1]).forEach(([x, y]) => {
        const fr = r * 0.2 * (0.9 + R() * 0.2), rot = R() * 6.28, t = -0.24 + R() * 0.14;
        for (let j = 0; j < 4; j++) o.push({ d: petal(rot + (j * Math.PI) / 2, fr * 0.08, fr, fr * 0.55, "round", x, y), t, thin: 1 });
        o.push({ d: circleD(x, y, fr * 0.13), t: 0.45 });
      });
      return o;
    },
    eustoma(r, R) {
      const o = [], a0 = R() * 6.28;
      for (let i = 0; i < 5; i++) o.push({ d: petal(a0 + i * 1.2566, 0, r, r * 0.62, "round"), t: -0.2 + i * 0.025 });
      for (let i = 0; i < 4; i++) o.push({ d: petal(a0 + 0.6 + (i * Math.PI) / 2, 0, r * 0.56, r * 0.4, "round"), t: 0.04 });
      o.push({ d: circleD(0, 0, r * 0.15), t: 0.1, k: "gr" });
      for (let i = 0; i < 5; i++) {
        const a = a0 + i * 1.2566 + 0.3, x = Math.cos(a) * r * 0.24, y = Math.sin(a) * r * 0.24;
        o.push({ d: "M0 0L" + f1(x) + " " + f1(y), ln: 1 });
        o.push({ d: circleD(x, y, r * 0.035), t: 0, k: "y" });
      }
      return o;
    },
    carnation(r, R) {
      const o = [], a0 = R() * 6.28;
      ring(o, 10, r * 0.18, r, r * 0.32, "fringe", -0.2, a0, R);
      ring(o, 8, r * 0.12, r * 0.72, r * 0.3, "fringe", -0.02, a0 + 0.4, R);
      ring(o, 6, r * 0.05, r * 0.45, r * 0.24, "fringe", 0.18, a0 + 0.8, R);
      for (let k = 0; k < 3; k++) { const a1 = R() * 6.28; o.push({ d: arcD(r * (0.06 + 0.05 * k), a1, a1 + 2), ln: 1 }); }
      return o;
    },
    dahlia(r, R) {
      const o = [], a0 = R() * 6.28;
      ring(o, 16, r * 0.22, r, r * 0.2, "point", -0.24, a0, R, { vein: 1 });
      ring(o, 13, r * 0.18, r * 0.8, r * 0.18, "point", -0.08, a0 + 0.2, R, { cup: 1 });
      ring(o, 11, r * 0.14, r * 0.6, r * 0.16, "point", 0.08, a0 + 0.4, R);
      ring(o, 8, r * 0.08, r * 0.4, r * 0.13, "point", 0.22, a0 + 0.6, R);
      o.push({ d: circleD(0, 0, r * 0.13), t: 0.45 });
      return o;
    },
    pompon(r, R) {
      const o = [{ d: circleD(0, 0, r * 0.98), t: 0.2 }], a0 = R() * 6.28;
      [[17, 0.58, 1, 0.19, -0.22], [15, 0.44, 0.84, 0.18, -0.1], [12, 0.3, 0.67, 0.17, 0.02], [9, 0.16, 0.5, 0.15, 0.14], [6, 0.03, 0.32, 0.13, 0.26]]
        .forEach(([n, r0, r1, w, t], i) => ring(o, n, r * r0, r * r1, r * w, "round", t, a0 + i * 0.3, R, { cup: 1 }));
      return o;
    },
    chrysball(r, R) {
      const o = [{ d: circleD(0, 0, r * 0.98), t: 0.2 }], a0 = R() * 6.28;
      [[24, 0.55, 1, 0.09, -0.22], [21, 0.42, 0.86, 0.09, -0.1], [18, 0.3, 0.72, 0.085, 0.02], [14, 0.18, 0.56, 0.08, 0.14], [9, 0.05, 0.38, 0.075, 0.26]]
        .forEach(([n, r0, r1, w, t], i) => ring(o, n, r * r0, r * r1, r * w, "round", t, a0 + i * 0.2, R));
      return o;
    },
    ranunculus(r, R) {
      const o = [{ d: circleD(0, 0, r * 0.96), t: 0.15 }], a0 = R() * 6.28;
      [[10, 0.3, 1, 0.36, -0.2], [9, 0.22, 0.82, 0.32, -0.08], [8, 0.15, 0.64, 0.27, 0.04], [7, 0.08, 0.46, 0.22, 0.15], [5, 0, 0.28, 0.17, 0.25]]
        .forEach(([n, r0, r1, w, t], i) => ring(o, n, r * r0, r * r1, r * w, "round", t, a0 + i * 0.35, R));
      o.push({ d: circleD(0, 0, r * 0.07), t: 0.1, k: "gr" });
      return o;
    },
    /* Антуриум: сердце-покрывало с прожилками и початок */
    anthurium(r) {
      const p = (x, y) => f1(x * r) + " " + f1(y * r);
      const heart = "M" + p(0, 0.55) + "C" + p(-0.25, 0.9) + " " + p(-1, 0.78) + " " + p(-0.96, 0.1) + "C" + p(-0.92, -0.55) + " " + p(-0.36, -0.86) + " " + p(0, -1.06) +
        "C" + p(0.36, -0.86) + " " + p(0.92, -0.55) + " " + p(0.96, 0.1) + "C" + p(1, 0.78) + " " + p(0.25, 0.9) + " " + p(0, 0.55) + "Z";
      const o = [{ d: heart, t: -0.04 }];
      o.push({ d: "M" + p(0, 0.42) + "Q" + p(0.04, -0.2) + " " + p(0, -0.9), ln: 1 });
      [[-0.55, 0.05], [-0.75, 0.4], [0.55, 0.05], [0.75, 0.4]].forEach(([x, y]) =>
        o.push({ d: "M" + p(0, 0.36) + "Q" + p(x * 0.55, y - 0.55) + " " + p(x, y - 0.6), ln: 1 }));
      o.push({ d: ellipseD(-0.14 * r, -0.12 * r, 0.075 * r, 0.4 * r, -0.4), t: 0, k: "y" });
      return o;
    },
  };

  /* Колосья (дельфиниум, львиный зев): от 0,0 вверх, длина len */
  function spikeItems(len, kind, R) {
    const o = [], bend = (R() - 0.5) * len * 0.25;
    const pt = (u) => [bend * u * u, -len * u];
    o.push({ d: "M0 0Q" + f1(bend * 0.5) + " " + f1(-len * 0.5) + " " + f1(bend) + " " + f1(-len), ln: 1 });
    const n = kind === "delph" ? 11 : 9;
    for (let i = n - 1; i >= 0; i--) {
      const u = 0.2 + (0.8 * i) / (n - 1), [x, y] = pt(u), side = i % 2 ? 1 : -1;
      const fr = len * (kind === "delph" ? 0.14 : 0.125) * (1.15 - 0.7 * u);
      const ox = x + side * fr * 0.45, oy = y;
      if (i >= n - 3) { o.push({ d: ellipseD(ox, oy, fr * 0.45, fr * 0.7, (R() - 0.5) * 0.6), t: 0.05 }); continue; }
      if (kind === "delph") {
        const a0 = R() * 6.28;
        for (let j = 0; j < 5; j++) o.push({ d: petal(a0 + j * 1.2566, 0, fr, fr * 0.55, "round", ox, oy), t: -0.15 + R() * 0.1 });
        o.push({ d: circleD(ox, oy, fr * 0.22), t: 0.45 });
      } else {
        o.push({ d: petal(-Math.PI / 2 + side * 0.3, 0, fr * 1.05, fr * 0.6, "round", ox, oy), t: -0.1 });
        o.push({ d: petal(Math.PI / 2 - side * 0.5, 0, fr * 0.85, fr * 0.5, "round", ox, oy), t: 0.05 });
        o.push({ d: petal(Math.PI / 2 + side * 0.5, 0, fr * 0.85, fr * 0.5, "round", ox, oy), t: -0.05 });
        o.push({ d: circleD(ox, oy, fr * 0.2), t: 0.3 });
      }
    }
    return o;
  }

  /* Зелень: веточка от 0,0 вверх */
  function sprigItems(kind, len, R) {
    const o = [], bend = (R() - 0.5) * len * 0.5;
    const pt = (u) => [bend * u * u, -len * u];
    o.push({ d: "M0 0Q" + f1(bend * 0.5) + " " + f1(-len * 0.5) + " " + f1(bend) + " " + f1(-len), ln: 1 });
    if (kind === "eucalyptus") {
      const n = 8;
      for (let i = 0; i < n; i++) {
        const u = 0.24 + (0.76 * i) / (n - 1), [x, y] = pt(u), rc = len * 0.062 * (1.25 - 0.6 * u);
        if (i === n - 1) { o.push({ d: ellipseD(x, y, rc, rc * 0.92, R()), t: -0.05, k: "g" }); break; }
        [-1, 1].forEach((sd) => o.push({ d: ellipseD(x + sd * rc * 0.85, y + sd * rc * 0.2, rc, rc * 0.92, R()), t: -0.08 + R() * 0.2, k: "g" }));
      }
    } else if (kind === "raspleaf") {
      const n = 5;
      for (let i = 0; i < n; i++) {
        const u = 0.3 + (0.7 * i) / (n - 1), [x, y] = pt(u), side = i % 2 ? 1 : -1, s = 1.1 - 0.4 * u;
        const a = i === n - 1 ? -Math.PI / 2 : -Math.PI / 2 + side * 0.9;
        o.push({ d: petal(a, 0, len * 0.3 * s, len * 0.1 * s, "point", x, y), t: -0.05 + R() * 0.15, k: "g" });
        o.push({ d: vein(a, 0, len * 0.3 * s, x, y), ln: 1 });
      }
    } else if (kind === "pampas") {
      const [x, y] = pt(0.4), a = -Math.PI / 2 + (bend / len) * 0.6, L = len * 0.68, w = len * 0.12;
      o.push({ d: petal(a, 0, L, w, "point", x, y), t: -0.05, k: "g" });
      const p = P(a, x, y);
      for (let j = 1; j < 11; j++) {
        const dd = (L * j) / 11, sd = j % 2 ? 1 : -1, ww = w * 0.6 * Math.sin((Math.PI * j) / 11);
        o.push({ d: "M" + p(dd, 0) + "L" + p(dd + ww * 0.8, sd * ww), ln: 1 });
      }
    }
    return o;
  }

  /* ════════════════════════════════════════════════════════
     Раскладка букета
     ════════════════════════════════════════════════════════ */
  let L0 = null;

  function chosenFlowers() {
    const p = paletteObj();
    return (state.flowers.length ? state.flowers : (p && p.mix) || FLORIST_MIX).map((id) => byId(D.flowers, id)).filter(Boolean);
  }

  function layout() {
    const R = rng(state.seed * 7919 + 13);
    const N = HEADS[state.size] || 11, HR = HEAD_R[state.size] || 46;
    const chosen = chosenFlowers();
    const headTypes = chosen.filter((f) => !SPIKES[f.kind]);
    const spikeTypes = chosen.filter((f) => SPIKES[f.kind]);
    const nSpikes = spikeTypes.length ? (headTypes.length ? Math.max(2, Math.round(N / 4)) : N) : 0;
    const nHeads = headTypes.length ? N - Math.floor(nSpikes / 2) : 0;
    const s = HR * 1.36, rowH = s * 0.866 * 0.9;
    const rx = nHeads ? Math.sqrt((nHeads * s * rowH) / (Math.PI * 0.78)) : 70;
    const ry = rx * 0.78;
    const cy = state.wrap === "film" ? 300 : 330;
    const typeIndex = (f) => chosen.indexOf(f);

    /* Головки: соты внутри эллипса, ближние к центру — первыми */
    const pts = [];
    for (let j = -8; j <= 8; j++) for (let i = -8; i <= 8; i++) {
      const x = (i + (j & 1 ? 0.5 : 0)) * s, y = j * rowH;
      const e0 = (x / rx) ** 2 + (y / ry) ** 2;
      pts.push({ x, y, e0, e: e0 + R() * 0.08 });
    }
    pts.sort((a, b) => a.e - b.e);
    const sel = pts.slice(0, nHeads);
    /* Кто где стоит: первый выбранный цветок — акцент (≈40% и центр) */
    const pattern = [];
    if (headTypes.length) {
      const first = headTypes.length === 1 ? nHeads : Math.ceil(nHeads * 0.4);
      for (let i = 0; i < first; i++) pattern.push(headTypes[0]);
      for (let i = 0; pattern.length < nHeads; i++) pattern.push(headTypes[1 + (i % (headTypes.length - 1))]);
      for (let i = pattern.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [pattern[i], pattern[j]] = [pattern[j], pattern[i]]; }
      const ai = pattern.indexOf(headTypes[0]);
      if (ai > 0) [pattern[0], pattern[ai]] = [pattern[ai], pattern[0]];
    }
    const heads = sel.map((pt, k) => {
      const f = pattern[k];
      const x = pt.x + (R() - 0.5) * s * 0.22, y = pt.y + (R() - 0.5) * s * 0.22;
      const depth = Math.max(0, Math.min(1, (y + ry) / (2 * ry)));
      const r = HR * (KIND_K[f.kind] || 1) * (0.9 + depth * 0.16) * (0.94 + R() * 0.12);
      const rot = f.kind === "anthurium" ? (R() - 0.5) * 50 + (x < 0 ? -15 : 15) : R() * 360;
      return { f, x: CX + x, y: cy + y, r, rot, k, ti: typeIndex(f), alt: R() < 0.3, items: (SH[f.kind] || SH.rose)(r, rng(state.seed * 131 + k * 17)) };
    });
    /* Второй ряд — в просветах между головками, чуть глубже по тону:
       купол получается плотным, без пустот, как у живого букета */
    const maxE = sel.reduce((m, p) => Math.max(m, p.e0), 0);
    const back = [];
    if (pattern.length) sel.forEach((p) => {
      [[s * 0.5, rowH / 3], [s * 0.5, -rowH / 3], [-s * 0.5, rowH / 3], [-s * 0.5, -rowH / 3]].forEach(([dx, dy]) => {
        const x = p.x + dx, y = p.y - dy;
        if ((x / rx) ** 2 + (y / ry) ** 2 > maxE * 1.02) return;
        if (back.some((b) => Math.abs(b.x0 - x) < 2 && Math.abs(b.y0 - y) < 2)) return;
        const f = pattern[(back.length * 7 + 3) % pattern.length], kk = 100 + back.length;
        const r = HR * 0.74 * (KIND_K[f.kind] || 1) * (0.94 + R() * 0.12);
        const items = (SH[f.kind] || SH.rose)(r, rng(state.seed * 53 + kk * 13)).map((it) => it.t != null ? Object.assign({}, it, { t: it.t + 0.12 }) : it);
        back.push({ f, x0: x, y0: y, x: CX + x, y: cy + y, r, rot: f.kind === "anthurium" ? (R() - 0.5) * 50 : R() * 360, k: kk, ti: typeIndex(f), alt: R() < 0.3, items });
      });
    });
    const domeTop = cy - ry - HR * 0.9;

    /* Колосья встают из-за купола */
    const spikes = [];
    for (let i = 0; i < nSpikes; i++) {
      const f = spikeTypes[i % spikeTypes.length];
      const u = nSpikes > 1 ? i / (nSpikes - 1) - 0.5 : 0;
      let bx, by, ang, len;
      if (nHeads) {
        bx = CX + u * rx * 1.3; by = cy - ry * 0.3 + Math.abs(u) * ry * 0.5;
        ang = u * 50 + (R() - 0.5) * 8;
        len = HR * 3.6 * (0.85 + R() * 0.2);
      } else {
        bx = CX + u * 30; by = cy + 60;
        ang = u * 70 + (R() - 0.5) * 6;
        len = HR * 4.6 * (0.8 + R() * 0.25);
      }
      spikes.push({ f, x: bx, y: by, ang, len, ti: typeIndex(f), alt: R() < 0.3, items: spikeItems(len, f.kind, rng(state.seed * 71 + i * 29)) });
    }

    /* Зелень веером из-за купола */
    const g = byId(D.greens, state.green);
    const greens = [];
    if (g && g.kind !== "none") {
      const cnt = { S: 6, M: 8, L: 10, XL: 12 }[state.size] || 8;
      const n = g.kind === "pampas" ? Math.max(3, Math.round(cnt * 0.6)) : cnt;
      const rxE = rx + HR * 0.6, ryE = ry + HR * 0.6;
      for (let i = 0; i < n; i++) {
        const a = (-80 + (160 * (i + 0.5)) / n + (R() - 0.5) * 10) * (Math.PI / 180);
        const sx = Math.sin(a), sy = -Math.cos(a);
        const edge = 1 / Math.sqrt((sx / rxE) ** 2 + (sy / ryE) ** 2);
        const len = edge + (g.kind === "pampas" ? 70 : 28) + R() * 22;
        greens.push({ x: CX, y: cy + ry * 0.25, ang: (a * 180) / Math.PI, items: sprigItems(g.kind, len, rng(state.seed * 37 + i * 11)) });
      }
    }

    /* Упаковка */
    const wrap = buildWrap(state.wrap, { rx, ry, cy, HR, domeTop });

    /* Верх и низ рисунка — чтобы букет стоял по центру холста */
    let top = domeTop;
    spikes.forEach((sp) => { top = Math.min(top, sp.y - sp.len * Math.cos((sp.ang * Math.PI) / 180) - 20); });
    greens.forEach((gr) => { const it = gr.items, len = parseFloat(it[0].d.split(" ").pop()); top = Math.min(top, gr.y + len * Math.cos((gr.ang * Math.PI) / 180) - 16); });
    top = Math.min(top, wrap.top);
    const halfW = Math.max(state.wrap === "film" ? rx + HR + 40 : rx + HR * 0.6 + 4, greens.length ? rx + HR + 60 : 0);
    L0 = { halfW, mass: { rx: rx * 0.9, ry: ry * 0.85, cy }, heads: back.concat(heads).sort((a, b) => (a.k >= 100) - (b.k >= 100) || a.y - b.y).sort((a, b) => (b.k >= 100) - (a.k >= 100)), spikes, greens, wrap, top, bottom: wrap.bottom, g };
  }

  /* Лист матовой плёнки: квадрат, повёрнутый углом наружу, — как
     сложенная плёнка «блюр» на букетах PALOMA. a — куда смотрит угол */
  function sheetD(cx, cy, a, len, spread, skew) {
    const p = P(a, cx, cy), w = len * spread;
    return "M" + p(0, 0) + "L" + p(len * 0.56, -w) + "L" + p(len, w * (skew || 0)) + "L" + p(len * 0.56, w) + "Z";
  }
  /* Веер листов за цветами */
  function sheetFan(out, cx, oy, rx, ry, HR, extra, n) {
    for (let i = 0; i < n; i++) {
      const deg = -82 + (164 * i) / (n - 1), a = (deg - 90) * (Math.PI / 180);
      const sx = Math.cos(a), sy = Math.sin(a);
      const edge = 1 / Math.sqrt((sx / (rx + HR * 0.9)) ** 2 + (sy / (ry + HR * 0.9)) ** 2);
      const len = edge + extra + (i % 2) * 20;
      out.push({ d: sheetD(cx, oy, a, len, 0.44, i % 2 ? 0.2 : -0.2), t: i % 2 ? -0.04 : 0.04, k: "fl", film: 1 });
      out.push({ d: "M" + P(a, cx, oy)(len * 0.5, 0) + "L" + P(a, cx, oy)(len * 0.97, 0), ln: 1 });
    }
  }
  /* Атласная лента PALOMA через букет */
  function sash(out, rx, ry, cy, id) {
    const A = [CX - rx * 0.98, cy - ry * 0.18], C = [CX - rx * 0.1, cy + ry * 0.62], B = [CX + rx * 0.98, cy + ry * 0.05], th = 15;
    const q = (dy) => f1(A[0]) + " " + f1(A[1] + dy) + "Q" + f1(C[0]) + " " + f1(C[1] + dy) + " " + f1(B[0]) + " " + f1(B[1] + dy);
    out.push({ d: "M" + q(0) + "L" + f1(B[0]) + " " + f1(B[1] + th) + "Q" + f1(C[0]) + " " + f1(C[1] + th) + " " + f1(A[0]) + " " + f1(A[1] + th) + "Z", t: 0, k: "rib" });
    out.push({ textPath: "M" + q(th * 0.5 + 3), id, text: ["PALOMA", "PALOMA", "PALOMA"].join(" ".repeat(12)) });
  }

  /* ── упаковка: back — за цветами, front — поверх ─────── */
  function buildWrap(kind, o) {
    const { rx, ry, cy, HR, domeTop } = o;
    const back = [], front = [];
    let bottom, top = domeTop, shadowW;
    const pt = (x, y) => f1(x) + " " + f1(y);
    if (kind === "box") {
      /* Высокая белая коробка PALOMA: шире кверху, жёлтая наклейка,
         внутри — серая плёнка, как на фото каталога */
      const tw = rx + HR * 0.4, bw = tw * 0.8, Yt = cy + ry * 0.55, H = tw * 1.45, Yb = Yt + H;
      sheetFan(back, CX, cy + ry * 0.3, rx, ry, HR, 26, 8);
      back.push({ d: "M" + pt(CX - tw, Yt) + "L" + pt(CX - tw * 0.92, Yt - 18) + "L" + pt(CX + tw * 0.92, Yt - 18) + "L" + pt(CX + tw, Yt) + "Z", t: 0.16, k: "bx" });
      sash(front, rx, ry, cy, "bbRib");
      front.push({ d: "M" + pt(CX + tw, Yt) + "L" + pt(CX + tw + 16, Yt - 12) + "L" + pt(CX + bw + 14, Yb - 9) + "L" + pt(CX + bw, Yb) + "Z", t: 0.14, k: "w" });
      front.push({ d: "M" + pt(CX - tw, Yt) + "L" + pt(CX - bw, Yb) + "L" + pt(CX + bw, Yb) + "L" + pt(CX + tw, Yt) + "Z", t: -0.02, k: "w" });
      const hw = (y) => tw + ((bw - tw) * (y - Yt)) / H, y1 = Yt + H * 0.4, y2 = Yt + H * 0.62;
      front.push({ d: "M" + pt(CX - hw(y1), y1) + "L" + pt(CX + hw(y1), y1) + "L" + pt(CX + hw(y2), y2) + "L" + pt(CX - hw(y2), y2) + "Z", t: 0, k: "yl" });
      front.push({ text: "PALOMA", x: CX, y: (y1 + y2) / 2 + 8, size: 30, ls: 7 });
      front.push({ text: "flowers · coffee · you", x: CX, y: y2 + 16, size: 9, ls: 3 });
      bottom = Yb + 16; shadowW = bw + 18;
    } else if (kind === "basket") {
      const rb = rx + HR * 0.5, rb2 = rb * 0.8, Yt = cy + ry * 0.42, H = Math.max(120, rb * 0.55), Yb = Yt + H, e = rb * 0.2, e2 = rb2 * 0.2;
      const apex = domeTop - 34, A = (apex - 0.25 * Yt) / 0.75;
      back.push({ d: "M" + pt(CX - rb + 14, Yt) + "C" + pt(CX - rb + 4, A) + " " + pt(CX + rb - 4, A) + " " + pt(CX + rb - 14, Yt) + "L" + pt(CX + rb - 32, Yt) +
        "C" + pt(CX + rb - 22, A + 24) + " " + pt(CX - rb + 22, A + 24) + " " + pt(CX - rb + 32, Yt) + "Z", t: 0.05, k: "w" });
      back.push({ d: ellipseD(CX, Yt, rb, e, 0), t: 0.3, k: "w" });
      front.push({ d: "M" + pt(CX - rb, Yt) + "L" + pt(CX - rb2, Yb) + "A" + f1(rb2) + " " + f1(e2) + " 0 0 0 " + pt(CX + rb2, Yb) + "L" + pt(CX + rb, Yt) + "A" + f1(rb) + " " + f1(e) + " 0 0 1 " + pt(CX - rb, Yt) + "Z", t: -0.02, k: "w" });
      const m = Math.max(5, Math.floor(H / 17));
      for (let i = 0; i <= m; i++) {
        const u = i / (m + 1), y = Yt + 10 + u * (H - 10), hw = rb + (rb2 - rb) * u, ee = hw * 0.2;
        front.push({ d: "M" + pt(CX - hw, y) + "A" + f1(hw) + " " + f1(ee) + " 0 0 0 " + pt(CX + hw, y), ln: 1 });
        if (i === m) break;
        const step = (H - 10) / (m + 1), cols = 13;
        for (let j = 0; j < cols; j++) {
          const th = Math.PI * ((j + (i % 2 ? 0.5 : 0) + 0.25) / cols);
          const x = CX + hw * Math.cos(th), yy = y + ee * Math.sin(th);
          front.push({ d: "M" + pt(x, yy + 3) + "L" + pt(x, yy + step - 3), ln: 1 });
        }
      }
      top = Math.min(top, apex - 10);
      bottom = Yb + e2 + 16; shadowW = rb2 + 14;
    } else {
      /* Матовая плёнка «блюр», как на букетах PALOMA: сзади — веер
         угловатых серых листов, спереди — два листа конусом, через
         цветы — атласная лента PALOMA, внизу — длинные хвосты ленты */
      const W = rx + HR * 0.9, Ty = cy + ry + HR + 70;
      sheetFan(back, CX, cy + ry * 0.3, rx, ry, HR, 46, 9);
      for (let i = 0; i < 6; i++) back.push({ d: "M" + pt(CX + (i - 2.5) * 4, Ty) + "L" + pt(CX + (i - 2.5) * 9, Ty + 70), ln: 1 });
      sash(front, rx, ry, cy, "bbRib");
      [-1, 1].forEach((sd) => {
        const X = (dx) => CX + sd * dx;
        const corner = [X(W + 22), cy + ry * 0.02], inner = [X(-W * 0.2), cy + ry + HR * 0.5];
        front.push({ d: "M" + pt(X(-4), Ty) + "L" + pt(corner[0], corner[1]) + "Q" + pt(X(W * 0.45), cy + ry * 0.62) + " " + pt(inner[0], inner[1]) + "Z", t: -0.02, k: "fl", film: 1 });
        front.push({ d: "M" + pt(X(0), Ty - 8) + "L" + pt(X(W * 0.62), cy + ry * 0.55), ln: 1 });
      });
      /* Узел и длинные хвосты атласной ленты */
      front.push({ d: petal(Math.PI / 2 + 0.16, 2, 128, 6.5, "point", CX, Ty), t: 0.04, k: "rib" });
      front.push({ d: petal(Math.PI / 2 - 0.1, 2, 112, 6.5, "point", CX, Ty), t: -0.02, k: "rib" });
      front.push({ d: petal(Math.PI + 0.5, 2, 30, 10, "round", CX, Ty), t: 0, k: "rib" });
      front.push({ d: petal(-0.5, 2, 30, 10, "round", CX, Ty), t: 0, k: "rib" });
      front.push({ d: ellipseD(CX, Ty, 9, 7, 0), t: 0.1, k: "rib" });
      bottom = Ty + 132; shadowW = 70;
      top = Math.min(top, cy - ry - HR - 60);
    }
    return { kind, back, front, top, bottom, shadowW };
  }

  /* ════════════════════════════════════════════════════════
     Рисование
     ════════════════════════════════════════════════════════ */
  function itemsSVG(items, key) {
    return items.map((it) => {
      if (it.textPath) return '<path id="' + it.id + '" d="' + it.textPath + '" fill="none" stroke="none"/><text class="bb-rib" font-size="8.5" letter-spacing="4"><textPath href="#' + it.id + '" startOffset="50%" text-anchor="middle">' + esc(it.text) + "</textPath></text>";
      if (it.text) return '<text x="' + f1(it.x) + '" y="' + f1(it.y) + '" font-size="' + it.size + '" letter-spacing="' + it.ls + '" text-anchor="middle">' + esc(it.text) + "</text>";
      const tf = it.tf ? ' transform="' + it.tf + '"' : "";
      if (it.ln) return '<path class="l" d="' + it.d + '"' + tf + "/>";
      return '<path class="f' + (it.film ? " film" : "") + (it.thin ? " thin" : "") + '" d="' + it.d + '" data-k="' + (it.k || key) + '" data-t="' + f1(it.t * 100) / 100 + '"' + tf + "/>";
    }).join("");
  }

  /* Головки у края купола смотрят вбок — сжаты по радиусу, как на живом куполе */
  function tilt(hd) {
    const m = L0.mass, dx = (hd.x - CX) / m.rx, dy = (hd.y - m.cy) / m.ry, d = Math.min(1, Math.sqrt(dx * dx + dy * dy));
    const phi = (Math.atan2(dy * m.ry, dx * m.rx) * 180) / Math.PI;
    return "rotate(" + f1(phi) + ") scale(" + f1((1 - 0.3 * d * d) * 100) / 100 + " .94) rotate(" + f1(-phi) + ")";
  }

  function render() {
    layout();
    const Lr = L0;
    const h = Lr.bottom - Lr.top, k = Math.min(1.3, (VIEW_H - 30) / h, (VIEW_W - 20) / (2 * Lr.halfW));
    let html = '<g transform="translate(' + CX + " " + VIEW_H / 2 + ") scale(" + f1(k * 1000) / 1000 + ") translate(" + -CX + " " + f1(-(Lr.top + Lr.bottom) / 2) + ')">';
    html += '<path class="bb-shadow" d="' + ellipseD(CX, Lr.bottom - 8, Lr.wrap.shadowW, 11, 0) + '"/>';
    html += '<g class="bb-g" style="--d:0ms">' + itemsSVG(Lr.wrap.back, "w") + "</g>";
    Lr.greens.forEach((g, i) => {
      html += '<g class="bb-g" style="--d:' + i * 30 + 'ms" transform="translate(' + f1(g.x) + " " + f1(g.y) + ") rotate(" + f1(g.ang) + ')">' + itemsSVG(g.items, "g") + "</g>";
    });
    Lr.spikes.forEach((sp, i) => {
      html += '<g class="bb-g" style="--d:' + (120 + i * 60) + 'ms" transform="translate(' + f1(sp.x) + " " + f1(sp.y) + ") rotate(" + f1(sp.ang) + ')">' + itemsSVG(sp.items, "s" + i) + "</g>";
    });
    html += '<g class="bb-g" style="--d:150ms"><path class="f mass" d="' + ellipseD(CX, Lr.mass.cy, Lr.mass.rx, Lr.mass.ry, 0) + '" data-k="m" data-t="0.5"/></g>';
    Lr.heads.forEach((hd, i) => {
      html += '<g class="bb-g" style="--d:' + (200 + (hd.k >= 100 ? (hd.k - 100) * 25 : 300 + hd.k * 55)) + 'ms" transform="translate(' + f1(hd.x) + " " + f1(hd.y) + ") " + tilt(hd) + " rotate(" + f1(hd.rot) + ')">' + itemsSVG(hd.items, "h" + i) + "</g>";
    });
    html += '<g class="bb-g bb-front" style="--d:0ms">' + itemsSVG(Lr.wrap.front, "w") + "</g>";
    html += "</g>";
    art.innerHTML = html;
    svg.classList.toggle("is-film", Lr.wrap.kind === "film");
    if (state.palette && !reduceMotion) {
      requestAnimationFrame(() => requestAnimationFrame(paint));
    } else paint();
  }

  function paletteObj() { return state.palette ? byId(D.palettes, state.palette) : null; }
  function flowerColors() {
    const p = paletteObj();
    if (!p) return null;
    const fc = p.colors.filter((c) => !isGreen(c));
    return fc.length ? fc : p.colors;
  }
  const WRAP_COLOR = { film: "#E4E2DF", box: "#FDFCFA", basket: "#CFAE84" };

  function keyColor(k) {
    const fc = flowerColors();
    if (!fc) return "#FFFFFF";
    const t = k.charAt(0);
    if (t === "h" || t === "s") {
      const it = (t === "h" ? L0.heads : L0.spikes)[+k.slice(1)];
      return it ? fc[(it.ti + (it.alt ? 1 : 0)) % fc.length] : fc[0];
    }
    if (k === "g") return (L0.g && L0.g.color) || "#8FA89C";
    if (k === "gr") return "#93A97E";
    if (k === "y") return "#EBCB6B";
    if (k === "w") return WRAP_COLOR[state.wrap] || "#FFFFFF";
    if (k === "bx") return "#D9D4CE";
    if (k === "fl") return "#E4E2DF";
    if (k === "rib") return "#F4ECE2";
    if (k === "yl") return "#F3DC3C";
    if (k === "rb" || k === "m") return fc[0];
    return fc[0];
  }

  function paint() {
    const cache = {};
    $$("path[data-k]", art).forEach((p) => {
      const k = p.getAttribute("data-k");
      const c = cache[k] || (cache[k] = keyColor(k));
      p.style.fill = state.palette ? tone(c, +p.getAttribute("data-t") || 0) : "#FFFFFF";
    });
    svg.classList.toggle("is-blank", !state.palette);
    const hint = $("#bbHint");
    if (hint) hint.hidden = !!state.palette;
  }

  /* ════════════════════════════════════════════════════════
     Цена и состав
     ════════════════════════════════════════════════════════ */
  function price() {
    const s = byId(D.sizes, state.size) || D.sizes[1];
    const fl = chosenFlowers();
    const prem = fl.reduce((a, f) => a + (f.premium || 1), 0) / (fl.length || 1);
    const w = byId(D.wraps, state.wrap);
    const p = s.price * (1 + (prem - 1) * 0.5) + (w ? w.extra : 0) + (state.card ? D.cardPrice || 350 : 0);
    return Math.round(p / 100) * 100;
  }
  function compositionLines() {
    const s = byId(D.sizes, state.size), p = paletteObj(), w = byId(D.wraps, state.wrap), g = byId(D.greens, state.green);
    const fl = state.flowers.length ? state.flowers.map((id) => (byId(D.flowers, id) || {}).name).filter(Boolean).join(", ") : "на выбор флориста";
    const out = [
      ["Размер", s.code + " · " + s.name + " · " + s.stems + " цветов"],
      ["Палитра", p ? p.name + " (" + p.colors.join(" ") + ")" : "на выбор флориста"],
      ["Цветы", fl],
      ["Зелень", g ? g.name : "—"],
      ["Упаковка", w ? w.name : "—"],
    ];
    if (state.card) out.push(["Открытка", state.cardText || "текст уточним"]);
    return out;
  }

  /* ════════════════════════════════════════════════════════
     Панель справа
     ════════════════════════════════════════════════════════ */
  const ICONS = {
    film: '<path d="M12 21L5 6c3-2 4 0 7-2 3 2 4 0 7 2z"/><path d="M12 21l-3-12M12 21l3-12"/><path d="M10 19.5c-1.5.5-2.5 1.5-3 2.5M14 19.5c1.5.5 2.5 1.5 3 2.5"/>',
    box: '<ellipse cx="12" cy="8" rx="8" ry="2.6"/><path d="M4 8v10c0 1.5 3.6 2.6 8 2.6s8-1.1 8-2.6V8"/><path d="M4 10.5c0 1.5 3.6 2.6 8 2.6s8-1.1 8-2.6"/>',
    basket: '<path d="M6 10c0-6 12-6 12 0"/><path d="M3 10h18l-2 10H5z"/><path d="M4 13.5h16M4.6 17h14.8"/>',
  };

  function buildControls() {
    $("#bbSizes").innerHTML = D.sizes.map((s) =>
      '<button type="button" class="bb-size" data-size="' + s.code + '" data-cursor="hover"><b>' + s.code + "</b><span>" + s.stems + " цветов</span><em>" + fmt(s.price) + "</em></button>").join("");

    $("#bbPalettes").innerHTML = D.palettes.map((p) =>
      '<button type="button" class="bb-pal" data-pal="' + p.code + '" title="' + esc(p.name) + '" data-cursor="hover"><span class="bb-pal__dots">' +
      p.colors.slice(0, 4).map((c) => '<i style="background:' + c + '"></i>').join("") + '</span><span class="bb-pal__name">' + esc(p.name) + "</span></button>").join("");

    $("#bbFlowers").innerHTML = '<button type="button" class="pdp-size-btn" data-florist data-cursor="hover">На выбор флориста</button>' +
      D.flowers.filter((f) => f.inStock).map((f) => '<button type="button" class="pdp-size-btn" data-flower="' + f.id + '" data-cursor="hover">' + esc(f.name) + "</button>").join("");

    $("#bbGreens").innerHTML = D.greens.filter((g) => GREENS_SHOWN.indexOf(g.id) >= 0).map((g) =>
      '<button type="button" class="pdp-size-btn" data-green="' + g.id + '" data-cursor="hover">' + esc(g.name) + "</button>").join("");

    $("#bbWraps").innerHTML = D.wraps.map((w) =>
      '<button type="button" class="bb-wrap" data-wrap="' + w.id + '" data-cursor="hover"><svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[w.kind] || "") + "</svg><b>" +
      esc(w.id === "film" ? "Плёнка «блюр»" : w.id === "box" ? "Коробка" : "Корзина") + "</b><em>" + (w.extra ? "+ " + fmt(w.extra) : "входит") + "</em></button>").join("");

    const sd = $("#bbStockDate");
    if (sd) sd.textContent = D.stockUpdated || "";
  }

  function syncControls() {
    $$("[data-size]").forEach((b) => b.classList.toggle("is-active", b.dataset.size === state.size));
    $$("[data-pal]").forEach((b) => b.classList.toggle("is-active", b.dataset.pal === state.palette));
    const full = state.flowers.length >= MAX_FLOWERS;
    $$("[data-flower]").forEach((b) => {
      const on = state.flowers.indexOf(b.dataset.flower) >= 0;
      b.classList.toggle("is-active", on);
      b.classList.toggle("is-muted", full && !on);
    });
    const fb = $("[data-florist]");
    if (fb) fb.classList.toggle("is-active", !state.flowers.length);
    $$("[data-green]").forEach((b) => b.classList.toggle("is-active", b.dataset.green === state.green));
    $$("[data-wrap]").forEach((b) => b.classList.toggle("is-active", b.dataset.wrap === state.wrap));
    $$("[data-receive]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.receive === state.receive)));

    const s = byId(D.sizes, state.size), p = paletteObj(), w = byId(D.wraps, state.wrap);
    $("#bbV1").textContent = s ? s.name : "";
    $("#bbV2").textContent = p ? p.name : "не выбрана";
    $("#bbV3").textContent = state.flowers.length ? state.flowers.length + " из " + MAX_FLOWERS : "флорист подберёт";
    $("#bbV4").textContent = w ? w.name : "";
    $("#bbPrice").textContent = "≈ " + fmt(price());
    const ct = $("#bbCardText");
    if (ct) ct.hidden = !state.card;
    saveDraft();
  }

  let toastT = 0;
  function toast(msg) {
    const t = $("#bbToast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("is-on"), 2200);
  }

  function onClick(e) {
    const b = e.target.closest("button");
    if (!b) return;
    let geom = false;
    if (b.dataset.size) { state.size = b.dataset.size; geom = true; }
    else if (b.dataset.pal) {
      state.palette = state.palette === b.dataset.pal ? null : b.dataset.pal;
      syncControls(); paint(); return;
    }
    else if (b.hasAttribute("data-florist")) { state.flowers = []; geom = true; }
    else if (b.dataset.flower) {
      const id = b.dataset.flower, i = state.flowers.indexOf(id);
      if (i >= 0) state.flowers.splice(i, 1);
      else if (state.flowers.length >= MAX_FLOWERS) { toast("Можно выбрать до трёх видов цветов"); return; }
      else state.flowers.push(id);
      geom = true;
    }
    else if (b.dataset.green) { state.green = b.dataset.green; geom = true; }
    else if (b.dataset.wrap) { state.wrap = b.dataset.wrap; geom = true; }
    else if (b.id === "bbShuffle") { state.seed = (state.seed * 17 + 11) % 9973; geom = true; }
    else if (b.dataset.receive) { state.receive = b.dataset.receive; syncControls(); return; }
    else if (b.id === "bbSend") { openSend(); return; }
    else return;
    syncControls();
    if (geom) render();
  }

  /* ── черновик и ссылка на эскиз ───────────────────────── */
  function encodeState() {
    return "s=" + state.size + "&p=" + (state.palette || "") + "&f=" + state.flowers.join(",") + "&g=" + state.green + "&w=" + state.wrap + "&r=" + state.seed;
  }
  function applyState(q) {
    if (byId(D.sizes, q.get("s"))) state.size = q.get("s");
    state.palette = byId(D.palettes, q.get("p")) ? q.get("p") : null;
    state.flowers = (q.get("f") || "").split(",").filter((id) => { const f = byId(D.flowers, id); return f && f.inStock; }).slice(0, MAX_FLOWERS);
    if (GREENS_SHOWN.indexOf(q.get("g")) >= 0) state.green = q.get("g");
    if (byId(D.wraps, q.get("w"))) state.wrap = q.get("w");
    if (+q.get("r")) state.seed = +q.get("r");
  }
  function shareUrl() {
    let k = "";
    try { k = localStorage.getItem("paloma_lab_key") || ""; } catch (e) { /* нет доступа */ }
    return location.origin + location.pathname + (k ? "?lab=" + encodeURIComponent(k) : "") + "#" + encodeState();
  }
  function saveDraft() {
    try { localStorage.setItem("paloma_builder_draft2", encodeState()); } catch (e) { /* нет доступа */ }
  }
  function loadInitial() {
    if (location.hash.length > 3) { applyState(new URLSearchParams(location.hash.slice(1))); return true; }
    try { const d = localStorage.getItem("paloma_builder_draft2"); if (d) applyState(new URLSearchParams(d)); } catch (e) { /* нет доступа */ }
    return false;
  }

  /* ════════════════════════════════════════════════════════
     Отправка флористу
     ════════════════════════════════════════════════════════ */
  const dlg = document.getElementById("bbDialog");
  function openSend() {
    $("#bbDialogCompose").innerHTML = compositionLines().map((l) =>
      '<div class="pdp-info__row"><span class="pdp-info__row-label">' + esc(l[0]) + '</span><span class="pdp-info__row-val">' + esc(l[1]) + "</span></div>").join("");
    $("#bbDialogPrice").textContent = fmt(price());
    $("#bbForm").hidden = false;
    $("#bbDone").hidden = true;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    setTimeout(() => { const n = $("#bbName"); if (n) n.focus(); }, 60);
  }
  function closeSend() { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); }

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
    const form = $("#bbForm"), phone = $("#bbPhone");
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
    $$("[data-receive]", dlg).forEach((b) => b.addEventListener("click", () => { state.receive = b.dataset.receive; syncControls(); }));

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
        page: "bouquet-builder", name, phone: phone.value, messenger, date: state.date,
        details: managerDetails(messenger), comment: state.comment, source: "Конструктор букета",
      };
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
        $("#bbDoneWhere").textContent = messenger || "удобный вам мессенджер";
        const mini = svg.cloneNode(true);
        mini.removeAttribute("id");
        $("#bbDoneBouquet").innerHTML = "";
        $("#bbDoneBouquet").appendChild(mini);
        form.hidden = true;
        $("#bbDone").hidden = false;
        petals();
        if (typeof window.ym === "function") { try { window.ym(110912456, "reachGoal", "bouquet_builder_sent"); } catch (x) { /* ничего */ } }
      });
    });

    $("#bbCard").addEventListener("change", (e) => { state.card = e.target.checked; syncControls(); });
    $("#bbCardText").addEventListener("input", (e) => { state.cardText = e.target.value.slice(0, 200); });
    $("#bbDate").addEventListener("change", (e) => { state.date = e.target.value; });
    $("#bbComment").addEventListener("input", (e) => { state.comment = e.target.value.slice(0, 300); });
    $("#bbDate").min = new Date().toISOString().slice(0, 10);
  }

  function petals() {
    if (reduceMotion) return;
    const box = $("#bbPetals");
    box.innerHTML = "";
    const pal = flowerColors() || ["#F2CFCB", "#E7385A", "#FBEAE4"];
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

  /* Высота закреплённой шапки — чтобы эскиз прилипал под ней */
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

  buildControls();
  const fromLink = loadInitial();
  syncControls();
  render();
  bindForm();
  document.addEventListener("click", (e) => { if (!e.target.closest("#bbDialog")) onClick(e); });
  if (fromLink) toast("Открыт эскиз по ссылке");
})();
