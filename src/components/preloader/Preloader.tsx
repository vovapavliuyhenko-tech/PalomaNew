"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { Logo } from "@/components/layout/Logo";
import { useUIStore } from "@/lib/store/uiStore";

const STORAGE_KEY = "paloma-preloader-shown";
const VISIBLE_MS = 2200;
const FADE_MS = 600;

const ORBIT_COPY =
  "PALOMA · FLOWERS · COFFEE · YOU · НОВОРОССИЙСК · PALOMA · FLOWERS · COFFEE · YOU · ";

export default function Preloader() {
  const { setPreloaderDone } = useUIStore();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const bypass = useRef(false);

  useLayoutEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    bypass.current =
      window.sessionStorage.getItem(STORAGE_KEY) === "1" || useUIStore.getState().preloaderDone;

    if (bypass.current) {
      setVisible(false);
      setPreloaderDone();
    }
  }, [setPreloaderDone]);

  useEffect(() => {
    if (!mounted || bypass.current) return;

    const t = window.setTimeout(() => setFading(true), VISIBLE_MS);
    return () => window.clearTimeout(t);
  }, [mounted]);

  useEffect(() => {
    if (!fading || bypass.current) return;
    const t = window.setTimeout(() => {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
      setVisible(false);
      setPreloaderDone();
    }, FADE_MS);
    return () => window.clearTimeout(t);
  }, [fading, setPreloaderDone]);

  useEffect(() => {
    if (!mounted || bypass.current || !visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible, mounted]);

  if (!mounted || !visible) return null;

  return (
    <div
      className="fixed inset-0 z-[var(--z-loader)] flex flex-col items-center justify-center px-[var(--container-gutter)] transition-opacity ease-[var(--ease-soft)]"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 50% 20%, color-mix(in srgb, var(--paloma-white) 12%, transparent), transparent 55%), var(--color-bordeaux)",
        opacity: fading ? 0 : 1,
        transitionDuration: `${FADE_MS}ms`,
        pointerEvents: fading ? "none" : "auto",
      }}
      aria-busy={!fading}
      aria-live="polite"
      aria-label="Загрузка Paloma Flowers"
      role="status"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.14]"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={reduceMotion ? undefined : { repeat: Infinity, duration: 42, ease: "linear" }}
        aria-hidden
      >
        <svg className="h-[min(72vw,520px)] w-[min(72vw,520px)]" viewBox="0 0 440 440" fill="none">
          <defs>
            <path
              id="paloma-preloader-orbit"
              d="M220,220 m-198,0 a198,198 0 1,1 396,0 a198,198 0 1,1 -396,0"
            />
          </defs>
          <text
            fill="var(--color-cream)"
            style={{
              fontFamily: "var(--font-body), system-ui, sans-serif",
              fontSize: "13px",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
            }}
          >
            <textPath href="#paloma-preloader-orbit" startOffset="0%">
              {ORBIT_COPY.repeat(2)}
            </textPath>
          </text>
        </svg>
      </motion.div>

      <div className="relative z-[1] pointer-events-none select-none text-center">
        <Logo size="lg" tone="cream" asLink={false} />
      </div>
    </div>
  );
}
