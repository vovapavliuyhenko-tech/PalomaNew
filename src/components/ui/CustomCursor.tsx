"use client";

import { useEffect, useRef, useState } from "react";

const INTERACTIVE =
  "a, button, [role='button'], input, textarea, select, label, summary, .product-card, .product-card-root, .btn-primary, .btn-secondary, .btn-outline, .add-to-cart-btn, .nav-ds-link";

function targetIsImage(el: EventTarget | null): boolean {
  if (!el || !(el instanceof Element)) return false;
  if (el.tagName === "IMG") return true;
  return el.closest("picture") !== null;
}

function targetIsInteractive(el: EventTarget | null): boolean {
  if (!el || !(el instanceof Element)) return false;
  return el.closest(INTERACTIVE) !== null;
}

const TRAIL_FOLLOWERS = 4;

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const followerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [cursorState, setCursorState] = useState<"default" | "hover" | "view">("default");
  const [enabled, setEnabled] = useState(false);

  const mouseTarget = useRef({ x: 0, y: 0 });
  const mainPos = useRef({ x: 0, y: 0 });
  const followerPos = useRef(Array.from({ length: TRAIL_FOLLOWERS }, () => ({ x: 0, y: 0 })));
  const raf = useRef<number>(0);

  useEffect(() => {
    const mqFine = window.matchMedia("(pointer: fine) and (min-width: 768px)");
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const applyMq = () => {
      const on = mqFine.matches && !mqReduce.matches;
      setEnabled(on);
      document.documentElement.classList.toggle("custom-cursor-active", on);
    };

    applyMq();
    mqFine.addEventListener("change", applyMq);
    mqReduce.addEventListener("change", applyMq);

    return () => {
      mqFine.removeEventListener("change", applyMq);
      mqReduce.removeEventListener("change", applyMq);
      document.documentElement.classList.remove("custom-cursor-active");
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let running = true;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      mainPos.current.x = lerp(mainPos.current.x, mouseTarget.current.x, 0.42);
      mainPos.current.y = lerp(mainPos.current.y, mouseTarget.current.y, 0.42);

      followerPos.current[0].x = lerp(followerPos.current[0].x, mouseTarget.current.x, 0.38);
      followerPos.current[0].y = lerp(followerPos.current[0].y, mouseTarget.current.y, 0.38);

      for (let i = 1; i < TRAIL_FOLLOWERS; i++) {
        followerPos.current[i].x = lerp(followerPos.current[i].x, followerPos.current[i - 1].x, 0.28);
        followerPos.current[i].y = lerp(followerPos.current[i].y, followerPos.current[i - 1].y, 0.28);
      }

      const m = dotRef.current;
      if (m) {
        m.style.transform = `translate3d(${mainPos.current.x}px, ${mainPos.current.y}px, 0) translate(-50%,-50%)`;
      }

      const label = labelRef.current;
      if (label) {
        label.style.transform = `translate(-50%,-50%)`;
      }

      followerRefs.current.forEach((el, i) => {
        if (!el) return;
        const o = 0.14 * (TRAIL_FOLLOWERS - i);
        const s = 6 + i * 3;
        el.style.width = `${s}px`;
        el.style.height = `${s}px`;
        el.style.opacity = String(o);
        el.style.transform = `translate3d(${followerPos.current[i].x}px, ${followerPos.current[i].y}px, 0) translate(-50%,-50%)`;
      });

      if (running) raf.current = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      mouseTarget.current.x = e.clientX;
      mouseTarget.current.y = e.clientY;
    };

    const onState = (e: MouseEvent) => {
      const t = e.target;
      if (targetIsImage(t) && targetIsInteractive(t)) {
        setCursorState("view");
        return;
      }
      if (targetIsInteractive(t)) {
        setCursorState("hover");
        return;
      }
      setCursorState("default");
    };

    const first = (e: MouseEvent) => {
      mouseTarget.current.x = e.clientX;
      mouseTarget.current.y = e.clientY;
      mainPos.current = { ...mouseTarget.current };
      followerPos.current.forEach((p) => {
        p.x = mouseTarget.current.x;
        p.y = mouseTarget.current.y;
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousemove", onState, { passive: true, capture: true });
    window.addEventListener("mousemove", first, { passive: true, once: true });

    raf.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousemove", onState, true);
    };
  }, [enabled]);

  const sizePx = cursorState === "hover" ? 54 : cursorState === "view" ? 64 : 34;

  if (!enabled) return null;

  return (
    <>
      {Array.from({ length: TRAIL_FOLLOWERS }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            followerRefs.current[i] = el;
          }}
          className="pointer-events-none fixed left-0 top-0 z-[calc(var(--z-cursor)-2)] rounded-full bg-[color-mix(in_srgb,var(--paloma-orange)_35%,transparent)] blur-[1px]"
          aria-hidden
        />
      ))}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[var(--z-cursor)] flex items-center justify-center rounded-full"
        style={{
          width: sizePx,
          height: sizePx,
          border: "1px solid color-mix(in srgb, var(--paloma-orange) 75%, transparent)",
          background: "color-mix(in srgb, var(--paloma-burgundy) 18%, transparent)",
          backdropFilter: "blur(7px)",
          WebkitBackdropFilter: "blur(7px)",
          boxShadow: "0 0 0 1px color-mix(in srgb, var(--paloma-white) 40%, transparent)",
          transition: "width 0.22s ease, height 0.22s ease",
        }}
      >
        <span
          ref={labelRef}
          className="pointer-events-none absolute left-1/2 top-1/2 select-none font-accent text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--paloma-orange)]"
          style={{ opacity: cursorState === "view" ? 1 : 0, transition: "opacity 0.18s ease" }}
        >
          смотреть
        </span>
      </div>
    </>
  );
}
