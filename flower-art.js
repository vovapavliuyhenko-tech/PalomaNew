/* ════════════════════════════════════════════════════════
   flower-art.js — нарисованные цветы для конструктора букета
   (bouquet-create.html). Свои иллюстрации PALOMA в мягком акварельном
   стиле: всё рисуется кодом в SVG, без чужих картинок.

   PalomaArt.head(kind, color, r, seed) → SVG-группа головки цветка
     с центром в (0,0) и радиусом ~r.
   PalomaArt.spike(kind, color, len, seed) → колос (дельфиниум, лаванда…),
     растёт из (0,0) вверх на len.
   PalomaArt.green(kind, len, seed) → ветка зелени из (0,0) вверх.
   PalomaArt.defs() → общие <defs> (акварельный фильтр).
   ════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── цвет ── */
  function hex(c) {
    c = String(c).replace("#", "");
    if (c.length === 3) c = c.split("").map((x) => x + x).join("");
    return [0, 2, 4].map((i) => parseInt(c.substr(i, 2), 16));
  }
  function toHex(a) {
    return "#" + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  }
  function mix(c1, c2, t) {
    const a = hex(c1), b = hex(c2);
    return toHex(a.map((v, i) => v + (b[i] - v) * t));
  }
  const light = (c, t) => mix(c, "#ffffff", t);
  const dark = (c, t) => mix(c, "#2a1418", t);

  /* ── случайность с зерном: один и тот же букет рисуется одинаково ── */
  function rng(seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      return ((s >>> 0) % 100000) / 100000;
    };
  }

  let gid = 0;
  const uid = (p) => p + "-" + (++gid).toString(36);
  const f = (n) => Math.round(n * 10) / 10;

  /* радиальный градиент: светлая середина → цвет → тень по краю */
  function radGrad(id, inner, mid, outer, cx, cy) {
    return `<radialGradient id="${id}" cx="${cx == null ? 50 : cx}%" cy="${cy == null ? 50 : cy}%" r="60%">` +
      `<stop offset="0" stop-color="${inner}"/><stop offset=".55" stop-color="${mid}"/>` +
      `<stop offset="1" stop-color="${outer}"/></radialGradient>`;
  }
  function linGrad(id, a, b, vertical) {
    return `<linearGradient id="${id}" x1="0" y1="${vertical ? 1 : 0}" x2="${vertical ? 0 : 1}" y2="0">` +
      `<stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  }

  /* лепесток: основание в (0,0), растёт вверх на l, ширина w */
  function petal(l, w, round) {
    const k = round == null ? 0.55 : round;
    return `M0,0 C${f(w)},${f(-l * 0.25)} ${f(w * k * 1.6)},${f(-l * 0.95)} 0,${f(-l)} ` +
      `C${f(-w * k * 1.6)},${f(-l * 0.95)} ${f(-w)},${f(-l * 0.25)} 0,0Z`;
  }
  /* острый лепесток (георгин, лилия, подсолнух) */
  function sharp(l, w) {
    return `M0,0 C${f(w)},${f(-l * 0.3)} ${f(w * 0.7)},${f(-l * 0.8)} 0,${f(-l)} ` +
      `C${f(-w * 0.7)},${f(-l * 0.8)} ${f(-w)},${f(-l * 0.3)} 0,0Z`;
  }

  function ring(n, l, w, fill, stroke, rot, R, shape, jitter, rnd, dist) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const a = rot + (360 / n) * i + (jitter ? (rnd() - 0.5) * jitter : 0);
      const ll = l * (jitter ? 0.9 + rnd() * 0.2 : 1);
      s += `<path d="${(shape || petal)(ll, w)}" fill="${fill}" stroke="${stroke}" stroke-width=".6" ` +
        `transform="rotate(${f(a)}) translate(0,${f(-(dist || 0))})"/>`;
    }
    return s;
  }

  const WC = 'filter="url(#paWc)"';

  /* ════════ ГОЛОВКИ ════════ */
  const HEADS = {
    rose(c, r, rnd) {
      const g = uid("g");
      let s = `<defs>${radGrad(g, light(c, 0.55), c, dark(c, 0.18))}</defs>`;
      s += ring(5, r, r * 0.62, `url(#${g})`, dark(c, 0.25), rnd() * 72, 0, petal, 10, rnd);
      s += ring(5, r * 0.78, r * 0.5, `url(#${g})`, dark(c, 0.3), 36 + rnd() * 20, 0, petal, 10, rnd);
      s += ring(4, r * 0.55, r * 0.42, mix(c, light(c, 0.3), 0.5), dark(c, 0.3), rnd() * 90, 0, petal, 12, rnd);
      /* закрученная серединка */
      s += `<circle r="${f(r * 0.3)}" fill="${dark(c, 0.12)}"/>`;
      s += `<path d="M${f(-r * 0.22)},0 A${f(r * 0.22)},${f(r * 0.22)} 0 1 1 ${f(r * 0.15)},${f(r * 0.12)} ` +
        `A${f(r * 0.13)},${f(r * 0.13)} 0 1 1 ${f(-r * 0.06)},${f(-r * 0.08)}" fill="none" stroke="${dark(c, 0.35)}" stroke-width="${f(r * 0.05)}" stroke-linecap="round"/>`;
      return s;
    },
    gardenrose(c, r, rnd) {
      const g = uid("g");
      let s = `<defs>${radGrad(g, light(c, 0.7), light(c, 0.15), dark(c, 0.12))}</defs>`;
      s += ring(7, r, r * 0.5, `url(#${g})`, dark(c, 0.2), rnd() * 50, 0, petal, 14, rnd);
      s += ring(7, r * 0.85, r * 0.42, `url(#${g})`, dark(c, 0.22), 25, 0, petal, 14, rnd);
      s += ring(6, r * 0.66, r * 0.36, `url(#${g})`, dark(c, 0.25), 10, 0, petal, 16, rnd);
      s += ring(6, r * 0.46, r * 0.28, light(c, 0.25), dark(c, 0.25), 40, 0, petal, 18, rnd);
      for (let i = 0; i < 5; i++) {
        const rr = r * (0.28 - i * 0.05);
        s += `<path d="M${f(-rr)},${f(rr * 0.2)} Q0,${f(-rr * 1.2)} ${f(rr)},${f(rr * 0.2)}" fill="none" stroke="${dark(c, 0.3)}" stroke-width=".8" transform="rotate(${f(rnd() * 360)})"/>`;
      }
      return s;
    },
    peony(c, r, rnd) {
      const g = uid("g");
      let s = `<defs>${radGrad(g, light(c, 0.65), c, dark(c, 0.15))}</defs>`;
      for (let k = 0; k < 5; k++) {
        const n = 9 - k, l = r * (1 - k * 0.15), w = r * (0.5 - k * 0.05);
        s += ring(n, l, w, `url(#${g})`, dark(c, 0.2), rnd() * 360, 0, petal, 22, rnd);
      }
      s += `<circle r="${f(r * 0.2)}" fill="${light(c, 0.35)}"/>`;
      for (let i = 0; i < 9; i++) {
        const a = rnd() * Math.PI * 2, d = rnd() * r * 0.18;
        s += `<circle cx="${f(Math.cos(a) * d)}" cy="${f(Math.sin(a) * d)}" r="${f(r * 0.04)}" fill="#E9C46A"/>`;
      }
      return s;
    },
    hydrangea(c, r, rnd) {
      let s = `<circle r="${f(r * 0.95)}" fill="${dark(c, 0.08)}" opacity=".55"/>`;
      const n = 26;
      for (let i = 0; i < n; i++) {
        const a = i * 2.39996, d = r * 0.82 * Math.sqrt((i + 0.5) / n);
        const x = Math.cos(a) * d, y = Math.sin(a) * d;
        const t = rnd();
        const fc = t < 0.33 ? light(c, 0.35) : t < 0.66 ? c : mix(c, dark(c, 0.15), 0.6);
        const fr = r * (0.2 + rnd() * 0.05);
        let fl = "";
        for (let p = 0; p < 4; p++) {
          fl += `<path d="${petal(fr, fr * 0.75, 0.75)}" fill="${fc}" stroke="${dark(c, 0.2)}" stroke-width=".4" transform="rotate(${p * 90 + 45})"/>`;
        }
        fl += `<circle r="${f(fr * 0.15)}" fill="${dark(c, 0.3)}"/>`;
        s += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rnd() * 90)})">${fl}</g>`;
      }
      return s;
    },
    tulip(c, r, rnd) {
      const g = uid("g"), g2 = uid("g");
      let s = `<defs>${linGrad(g, dark(c, 0.2), light(c, 0.3), true)}${linGrad(g2, c, light(c, 0.55), true)}</defs>`;
      const t = r * 1.05, b = r * 0.9, w = r * 0.85;
      /* задний лепесток */
      s += `<path d="M0,${f(b)} C${f(-w * 0.9)},${f(b * 0.6)} ${f(-w * 0.75)},${f(-t * 0.6)} 0,${f(-t)} C${f(w * 0.75)},${f(-t * 0.6)} ${f(w * 0.9)},${f(b * 0.6)} 0,${f(b)}Z" fill="url(#${g2})" stroke="${dark(c, 0.3)}" stroke-width=".7"/>`;
      /* два передних, сходятся остриями */
      [-1, 1].forEach((k) => {
        s += `<path d="M0,${f(b)} C${f(k * w * 1.15)},${f(b * 0.55)} ${f(k * w * 1.05)},${f(-t * 0.45)} ${f(k * w * 0.38)},${f(-t * 0.88)} C${f(k * w * 0.05)},${f(-t * 0.35)} ${f(-k * w * 0.18)},${f(b * 0.3)} 0,${f(b)}Z" fill="url(#${g})" stroke="${dark(c, 0.3)}" stroke-width=".7"/>`;
      });
      s += `<path d="M${f(-w * 0.3)},${f(b * 0.2)} Q0,${f(-t * 0.2)} ${f(w * 0.3)},${f(b * 0.2)}" fill="none" stroke="${light(c, 0.5)}" stroke-width="1" opacity=".6"/>`;
      return s;
    },
    eustoma(c, r, rnd) {
      const g = uid("g");
      let s = `<defs>${radGrad(g, light(c, 0.75), light(c, 0.2), c)}</defs>`;
      s += ring(5, r, r * 0.75, `url(#${g})`, dark(c, 0.25), rnd() * 72, 0, petal, 8, rnd);
      s += ring(4, r * 0.6, r * 0.5, light(c, 0.3), dark(c, 0.25), 20, 0, petal, 10, rnd);
      s += `<circle r="${f(r * 0.18)}" fill="${dark(c, 0.35)}"/>`;
      s += `<circle r="${f(r * 0.08)}" fill="#D8C46A"/>`;
      return s;
    },
    chrys(c, r, rnd) {
      let s = "";
      [[30, 1, 0.13], [24, 0.8, 0.12], [18, 0.6, 0.11], [12, 0.4, 0.1]].forEach(([n, k, w], j) => {
        s += ring(n, r * k, r * w, j % 2 ? light(c, 0.15) : c, dark(c, 0.3), rnd() * 30, 0, petal, 6, rnd);
      });
      s += `<circle r="${f(r * 0.16)}" fill="${dark(c, 0.15)}"/>`;
      return s;
    },
    dahlia(c, r, rnd) {
      const g = uid("g");
      let s = `<defs>${radGrad(g, light(c, 0.5), c, dark(c, 0.2))}</defs>`;
      [[16, 1, 0.2], [14, 0.82, 0.19], [12, 0.64, 0.17], [10, 0.46, 0.15], [8, 0.3, 0.12]].forEach(([n, k, w], j) => {
        s += ring(n, r * k, r * w, `url(#${g})`, dark(c, 0.3), j * 11 + rnd() * 10, 0, sharp, 4, rnd);
      });
      s += `<circle r="${f(r * 0.12)}" fill="${dark(c, 0.3)}"/>`;
      return s;
    },
    ranunculus(c, r, rnd) {
      /* много тонких плотно сидящих лепестков, к середине светлее и мельче */
      let s = "";
      for (let k = 0; k < 7; k++) {
        const l = r * (1 - k * 0.135), n = 11 - k;
        const col = mix(c, light(c, 0.45), k / 7);
        s += ring(n, l, l * 0.62, col, dark(c, 0.22), k * 17 + rnd() * 20, 0, (L, W) => petal(L, W, 0.85), 8, rnd);
      }
      s += `<circle r="${f(r * 0.09)}" fill="#86A35A"/>`;
      return s;
    },
    carnation(c, r, rnd) {
      let s = "";
      for (let k = 0; k < 3; k++) {
        const rr = r * (1 - k * 0.28), n = 22 - k * 5;
        let d = "";
        for (let i = 0; i <= n * 2; i++) {
          const a = (Math.PI * 2 * i) / (n * 2), rad = rr * (i % 2 ? 0.86 : 1) * (0.94 + rnd() * 0.08);
          d += (i ? "L" : "M") + f(Math.cos(a) * rad) + "," + f(Math.sin(a) * rad);
        }
        s += `<path d="${d}Z" fill="${k === 1 ? light(c, 0.2) : c}" stroke="${dark(c, 0.3)}" stroke-width=".6"/>`;
      }
      return s;
    },
    daisy(c, r, rnd) {
      let s = ring(18, r, r * 0.16, "#FFFFFF", "#D9D2C4", rnd() * 20, 0, petal, 6, rnd);
      s += `<circle r="${f(r * 0.3)}" fill="#F2B632"/>`;
      for (let i = 0; i < 14; i++) {
        const a = rnd() * Math.PI * 2, d = rnd() * r * 0.24;
        s += `<circle cx="${f(Math.cos(a) * d)}" cy="${f(Math.sin(a) * d)}" r="${f(r * 0.03)}" fill="#C47D12"/>`;
      }
      return s;
    },
    sunflower(c, r, rnd) {
      let s = ring(20, r, r * 0.17, "#F4B83A", "#C98A14", rnd() * 18, 0, sharp, 6, rnd);
      s += ring(16, r * 0.82, r * 0.16, "#F7CC52", "#C98A14", 9, 0, sharp, 6, rnd);
      s += `<circle r="${f(r * 0.42)}" fill="#5A3518"/>`;
      for (let i = 0; i < 40; i++) {
        const a = i * 2.39996, d = r * 0.38 * Math.sqrt((i + 0.5) / 40);
        s += `<circle cx="${f(Math.cos(a) * d)}" cy="${f(Math.sin(a) * d)}" r="${f(r * 0.025)}" fill="#2C1608"/>`;
      }
      return s;
    },
    calla(c, r, rnd) {
      const g = uid("g");
      let s = `<defs>${linGrad(g, dark(c, 0.1), light(c, 0.45), true)}</defs>`;
      const h = r * 1.7;
      s += `<path d="M0,${f(h * 0.5)} C${f(-r * 0.9)},${f(h * 0.1)} ${f(-r * 1.05)},${f(-h * 0.45)} ${f(-r * 0.2)},${f(-h * 0.55)} ` +
        `C${f(r * 0.5)},${f(-h * 0.6)} ${f(r * 1)},${f(-h * 0.35)} ${f(r * 0.75)},${f(-h * 0.05)} C${f(r * 0.5)},${f(h * 0.2)} ${f(r * 0.2)},${f(h * 0.3)} 0,${f(h * 0.5)}Z" ` +
        `fill="url(#${g})" stroke="${dark(c, 0.3)}" stroke-width=".8"/>`;
      s += `<path d="M${f(-r * 0.05)},${f(-h * 0.35)} Q${f(r * 0.05)},0 ${f(-r * 0.05)},${f(h * 0.25)}" stroke="#E9B935" stroke-width="${f(r * 0.16)}" stroke-linecap="round" fill="none"/>`;
      return s;
    },
    orchid(c, r, rnd) {
      const g = uid("g");
      let s = `<defs>${radGrad(g, light(c, 0.7), light(c, 0.25), c)}</defs>`;
      s += ring(3, r, r * 0.38, `url(#${g})`, dark(c, 0.2), 0, 0, petal, 0, rnd);
      s += `<path d="${petal(r * 0.9, r * 0.6)}" fill="url(#${g})" stroke="${dark(c, 0.2)}" stroke-width=".6" transform="rotate(-60)"/>`;
      s += `<path d="${petal(r * 0.9, r * 0.6)}" fill="url(#${g})" stroke="${dark(c, 0.2)}" stroke-width=".6" transform="rotate(60)"/>`;
      s += `<path d="${petal(r * 0.55, r * 0.35)}" fill="${dark(c, 0.25)}" transform="rotate(180)"/>`;
      s += `<circle r="${f(r * 0.12)}" fill="#F2D24A"/>`;
      return s;
    },
    anemone(c, r, rnd) {
      const g = uid("g");
      let s = `<defs>${radGrad(g, light(c, 0.4), c, dark(c, 0.15))}</defs>`;
      s += ring(6, r, r * 0.72, `url(#${g})`, dark(c, 0.25), rnd() * 60, 0, petal, 10, rnd);
      s += `<circle r="${f(r * 0.3)}" fill="#1E1A2E"/>`;
      for (let i = 0; i < 16; i++) {
        const a = (Math.PI * 2 * i) / 16;
        s += `<circle cx="${f(Math.cos(a) * r * 0.36)}" cy="${f(Math.sin(a) * r * 0.36)}" r="${f(r * 0.035)}" fill="#1E1A2E"/>`;
      }
      return s;
    },
    lily(c, r, rnd) {
      const g = uid("g");
      let s = `<defs>${radGrad(g, light(c, 0.8), light(c, 0.3), c)}</defs>`;
      s += ring(3, r, r * 0.34, `url(#${g})`, dark(c, 0.2), 30, 0, sharp, 0, rnd);
      s += ring(3, r * 0.95, r * 0.3, `url(#${g})`, dark(c, 0.2), 90, 0, sharp, 0, rnd);
      for (let i = 0; i < 6; i++) {
        s += `<path d="M0,0 L0,${f(-r * 0.6)}" stroke="${dark(c, 0.15)}" stroke-width=".7" stroke-dasharray="2 3" transform="rotate(${30 + i * 60})"/>`;
        s += `<g transform="rotate(${i * 60 + 10})"><path d="M0,0 L0,${f(-r * 0.45)}" stroke="#7FA05A" stroke-width="1"/>` +
          `<ellipse cy="${f(-r * 0.48)}" rx="${f(r * 0.04)}" ry="${f(r * 0.08)}" fill="#A2541E"/></g>`;
      }
      return s;
    },
    anthurium(c, r, rnd) {
      const g = uid("g");
      let s = `<defs>${radGrad(g, light(c, 0.45), c, dark(c, 0.2), 35, 35)}</defs>`;
      s += `<path d="M0,${f(r * 0.9)} C${f(-r * 1.2)},${f(r * 0.1)} ${f(-r * 1.1)},${f(-r * 1)} ${f(-r * 0.15)},${f(-r * 0.8)} ` +
        `L0,${f(-r * 0.6)} L${f(r * 0.15)},${f(-r * 0.8)} C${f(r * 1.1)},${f(-r * 1)} ${f(r * 1.2)},${f(r * 0.1)} 0,${f(r * 0.9)}Z" ` +
        `fill="url(#${g})" stroke="${dark(c, 0.3)}" stroke-width=".8"/>`;
      s += `<path d="M0,${f(-r * 0.4)} Q${f(r * 0.3)},${f(-r * 0.9)} ${f(r * 0.45)},${f(-r * 1.15)}" stroke="#F0D9A0" stroke-width="${f(r * 0.17)}" stroke-linecap="round" fill="none"/>`;
      return s;
    },
    alstro(c, r, rnd) {
      let s = "";
      for (let k = 0; k < 3; k++) {
        const a = k * 120 + rnd() * 30, d = r * 0.45;
        const x = Math.cos((a * Math.PI) / 180) * d, y = Math.sin((a * Math.PI) / 180) * d;
        s += `<g transform="translate(${f(x)},${f(y)})">` + ring(6, r * 0.55, r * 0.22, light(c, 0.15), dark(c, 0.25), rnd() * 60, 0, petal, 8, rnd) +
          `<circle r="${f(r * 0.08)}" fill="#E9C46A"/></g>`;
      }
      return s;
    },
  };

  /* ════════ КОЛОСЬЯ (дельфиниум, матиола, лаванда, львиный зев) ════════ */
  function spike(kind, c, len, seed) {
    const rnd = rng(seed);
    let s = `<path d="M0,0 Q${f(len * 0.05)},${f(-len * 0.5)} 0,${f(-len)}" stroke="#7B9663" stroke-width="2" fill="none"/>`;
    const n = kind === "lavender" ? 16 : 11;
    for (let i = 0; i < n; i++) {
      const t = 0.32 + (i / n) * 0.68;
      const y = -len * t, size = (kind === "lavender" ? 4.5 : 11) * (1.15 - t * 0.6);
      const side = i % 2 ? 1 : -1;
      const x = side * size * 0.55 + len * 0.05 * Math.sin(t * 3);
      const col = i % 3 ? c : light(c, 0.3);
      if (kind === "lavender") {
        s += `<ellipse cx="${f(x * 0.5)}" cy="${f(y)}" rx="${f(size * 0.7)}" ry="${f(size)}" fill="${col}" stroke="${dark(c, 0.25)}" stroke-width=".4"/>`;
      } else {
        s += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rnd() * 60)})">` +
          ring(kind === "snapdragon" ? 3 : 5, size, size * 0.65, col, dark(c, 0.25), 0, 0, petal, 10, rnd) +
          `<circle r="${f(size * 0.18)}" fill="${dark(c, 0.3)}"/></g>`;
      }
    }
    return s;
  }

  /* гипсофила — облачко мелких цветочков */
  function gyps(c, r, seed) {
    const rnd = rng(seed);
    let s = "";
    for (let i = 0; i < 26; i++) {
      const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r;
      const x = Math.cos(a) * d, y = Math.sin(a) * d * 0.8;
      s += `<path d="M0,${f(r * 0.9)} L${f(x)},${f(y)}" stroke="#9DB389" stroke-width=".5"/>`;
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.8 + rnd() * 1.6)}" fill="${c}" stroke="#D8D0C2" stroke-width=".4"/>`;
    }
    return s;
  }

  /* ════════ ЗЕЛЕНЬ ════════ */
  function leaf(l, w, col, a, x, y) {
    return `<path d="${petal(l, w, 0.5)}" fill="${col}" stroke="${dark(col, 0.25)}" stroke-width=".5" transform="translate(${f(x)},${f(y)}) rotate(${f(a)})"/>`;
  }
  function green(kind, len, seed) {
    const rnd = rng(seed);
    const G = {
      eucalyptus: "#9DB4A6", fern: "#6E9A5A", ruscus: "#4F7A45", olive: "#8FA683",
      pistachio: "#5E8A50", ivy: "#4E7A3E", bluegum: "#8AA7B0",
    };
    const col = G[kind] || "#6E9A5A";
    let s = `<path d="M0,0 Q${f(len * 0.06)},${f(-len * 0.5)} 0,${f(-len)}" stroke="${dark(col, 0.25)}" stroke-width="1.6" fill="none"/>`;
    const n = kind === "fern" ? 16 : kind === "eucalyptus" || kind === "bluegum" ? 9 : 10;
    for (let i = 0; i < n; i++) {
      const t = 0.18 + (i / n) * 0.8, y = -len * t, x = len * 0.06 * Math.sin(t * 3.1);
      const shade = mix(col, i % 2 ? light(col, 0.2) : dark(col, 0.08), 0.5);
      const side = i % 2 ? 1 : -1;
      if (kind === "eucalyptus" || kind === "bluegum") {
        const rr = 13 * (1.1 - t * 0.5);
        s += `<circle cx="${f(x + side * rr * 0.9)}" cy="${f(y)}" r="${f(rr)}" fill="${shade}" stroke="${dark(col, 0.2)}" stroke-width=".5"/>`;
      } else if (kind === "fern") {
        const l = 34 * (1.15 - t * 0.85);
        s += leaf(l, l * 0.18, shade, side * 62, x, y);
        s += leaf(l, l * 0.18, shade, -side * 62, x, y - 3);
      } else if (kind === "ivy") {
        const l = 20 * (1.1 - t * 0.4);
        s += `<g transform="translate(${f(x)},${f(y)}) rotate(${side * 50})">` +
          leaf(l, l * 0.45, shade, -40, 0, 0) + leaf(l * 1.1, l * 0.5, shade, 0, 0, 0) + leaf(l, l * 0.45, shade, 40, 0, 0) + "</g>";
      } else {
        const l = (kind === "olive" ? 30 : kind === "pistachio" ? 24 : 26) * (1.1 - t * 0.4);
        const w = kind === "olive" ? l * 0.16 : kind === "ruscus" ? l * 0.32 : l * 0.42;
        s += leaf(l, w, shade, side * (50 + rnd() * 15), x, y);
      }
    }
    if (kind === "fern" || kind === "ruscus" || kind === "olive") s += leaf(22, 5, col, 0, 0, -len);
    return s;
  }

  function head(kind, color, r, seed) {
    const fn = HEADS[kind] || HEADS.rose;
    return `<g ${WC}>${fn(color, r, rng(seed || 7))}</g>`;
  }

  function defs() {
    return '<filter id="paWc" x="-20%" y="-20%" width="140%" height="140%">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feGaussianBlur in="d" stdDeviation=".25"/></filter>';
  }

  window.PalomaArt = {
    head, spike: (k, c, l, s) => `<g ${WC}>${spike(k, c, l, s || 3)}</g>`,
    gyps: (c, r, s) => `<g ${WC}>${gyps(c, r, s || 5)}</g>`,
    green: (k, l, s) => `<g ${WC}>${green(k, l, s || 9)}</g>`,
    defs, rng, mix, light, dark,
  };
})();
