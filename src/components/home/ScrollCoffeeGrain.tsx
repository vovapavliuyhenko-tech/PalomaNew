"use client";

import { useEffect, useRef } from "react";

/** SVG-«зерно», вращение по скроллу через обёртку (GSAP) */
export default function ScrollCoffeeGrain() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    void (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const wrap = wrapRef.current;
      const rot = rotRef.current;
      if (!wrap || !rot) return;

      const mob = window.innerWidth < 768;

      ctx = gsap.context(() => {
        gsap.set(rot, { transformOrigin: "50% 55%", rotateX: mob ? -4 : -8 });

        gsap.to(rot, {
          rotateY: mob ? 16 : 32,
          rotateZ: mob ? 22 : 40,
          ease: mob ? "power1.out" : "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top 85%",
            end: "bottom 15%",
            scrub: mob ? 1.35 : 1.05,
          },
        });
      }, wrap);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto flex w-full max-w-[min(520px,100%)] justify-center lg:justify-start"
      style={{ perspective: "1000px" }}
    >
      <div ref={rotRef} className="flex justify-center [transform-style:preserve-3d]">
        <svg
          viewBox="0 0 200 340"
          className="h-[min(380px,52vw)] w-auto overflow-visible lg:h-[min(420px,min(420px,40vw))] [&_ellipse]:stroke-[color-mix(in_srgb,var(--paloma-coal)_18%,transparent)]"
          aria-hidden
        >
          <defs>
            <linearGradient id="cg-shell" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="color-mix(in srgb, var(--paloma-burgundy) 70%, black)" />
              <stop offset="45%" stopColor="color-mix(in srgb, var(--paloma-coal) 55%, white)" />
              <stop offset="100%" stopColor="color-mix(in srgb, var(--paloma-orange) 40%, black)" />
            </linearGradient>
            <linearGradient id="cg-hilight" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="color-mix(in srgb, var(--paloma-white) 55%, transparent)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <filter id="cg-soft">
              <feGaussianBlur stdDeviation="1.8" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#cg-soft)">
            <ellipse cx="100" cy="170" rx="74" ry="132" fill="url(#cg-shell)" />
            <path
              d="M100 76 c-40 54 -52 134 -42 206 c10 42 92 42 104 10 c34 -88 -10 -174 -62 -216"
              fill="none"
              stroke="color-mix(in srgb, var(--paloma-burgundy) 55%, black)"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.92"
            />
            <ellipse cx="100" cy="170" rx="54" ry="118" fill="url(#cg-hilight)" opacity="0.42" />
          </g>
        </svg>
      </div>
    </div>
  );
}
