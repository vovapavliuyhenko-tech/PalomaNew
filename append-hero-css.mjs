import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cssPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "styles.css");
const s = fs.readFileSync(cssPath, "utf8");
if (!s.includes("/* appended PALOMA hero")) {
  fs.appendFileSync(
    cssPath,
    `

/* appended PALOMA hero + blueprint utilities */
.hero-scene {
  position: relative;
  height: 100vh;
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--ivory);
}
.hero-scene__bg {
  position: absolute;
  inset: -8%;
  background-size: cover;
  background-position: center;
  transform-origin: center;
  will-change: transform;
}
.hero-scene__bg-placeholder {
  width: 100%;
  height: 100%;
}
.hero-scene__word {
  font-family: var(--serif);
  font-size: clamp(144px, 24vw, 360px);
  line-height: 0.84;
  letter-spacing: 0.005em;
  color: var(--graphite);
  margin: 0;
  position: relative;
  z-index: 1;
  text-align: center;
  user-select: none;
}
.hero-scene__giraffe {
  position: absolute;
  bottom: 0;
  z-index: 2;
  width: clamp(240px, 28vw, 440px);
  transform: translateX(-30vw);
  animation: giraffeWalk 3.2s var(--ease-cinema) 1.2s forwards;
}
.hero-scene__giraffe img {
  width: 100%;
  height: auto;
  display: block;
}
@keyframes giraffeWalk {
  to {
    transform: translateX(42vw);
  }
}
.hero-scene__cta {
  position: absolute;
  bottom: clamp(32px, 5vw, 64px);
  left: var(--gutter);
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  z-index: 3;
}
@media (prefers-reduced-motion: reduce) {
  .hero-scene__giraffe {
    animation: none;
    transform: translateX(18vw);
  }
  .hero-scene__bg {
    transform: none !important;
  }
}
.filter-btn.chip,
.filter-chip.chip {
  border-radius: var(--r-pill);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.2em;
  padding: 9px 18px;
  border: 1px solid var(--graphite);
}
.filter-btn.chip:hover,
.filter-chip.chip:hover {
  background: var(--milk);
}
.filter-chip.is-active.chip {
  background: var(--graphite);
  color: var(--ivory);
  border-color: var(--graphite);
}
.torn-bottom {
  position: relative;
}
.torn-bottom::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 24px;
  clip-path: polygon(
    0 100%, 0 50%, 3% 65%, 7% 40%, 12% 70%, 17% 35%, 22% 60%, 27% 40%, 33% 65%,
    38% 30%, 43% 55%, 48% 35%, 54% 60%, 60% 35%, 66% 60%, 72% 40%, 78% 65%,
    84% 35%, 90% 60%, 96% 40%, 100% 55%, 100% 100%
  );
  background: var(--ivory);
  pointer-events: none;
  z-index: 2;
}
.dark-section.torn-bottom::after {
  background: var(--ivory);
}
@media (hover: hover) and (pointer: fine) {
  body.custom-cursor-enabled .custom-cursor.is-hovering .custom-cursor__ring {
    width: 56px;
    height: 56px;
    margin-left: -18px;
    margin-top: -18px;
    border-color: transparent;
    background: rgba(244, 236, 215, 0.6);
  }
}
`
  );
  console.log("Appended blueprint utilities to styles.css");
} else {
  console.log("Already appended — skip");
}
