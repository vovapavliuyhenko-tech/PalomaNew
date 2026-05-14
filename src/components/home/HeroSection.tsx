"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/** TODO(zamena): локальный бренд-кадр заменить загрузкой в /public */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1490750967868-88df5691cc9d?w=1920&q=85";

/** Первый экран: только фон и PALOMA; скролл — title вниз + opacity, фон scale 1→1.1 (desktop). */
export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

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

      const section = sectionRef.current;
      const bg = bgRef.current;
      const title = titleRef.current;
      if (!section || !bg || !title) return;

      const isMobile = window.innerWidth < 768;

      ctx = gsap.context(() => {
        gsap.set(bg, { scale: 1, transformOrigin: "50% 45%" });

        if (!isMobile) {
          gsap.to(bg, {
            scale: 1.1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom top",
              scrub: 1.2,
            },
          });
        }

        gsap.to(title, {
          yPercent: isMobile ? 12 : 28,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: isMobile ? 0.75 : 1.05,
          },
        });
      }, section);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative z-[30] min-h-[100svh] overflow-hidden lg:min-h-[125vh]">
      <div className="sticky top-0 flex min-h-[100svh] w-full overflow-hidden lg:h-[100svh]">
        <div ref={bgRef} className="absolute inset-0 z-0 will-change-transform">
          <Image
            src={HERO_IMAGE}
            alt="Цветочная композиция — фон главной секции PALOMA (TODO: замена на фото бренда)"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>

        <div
          className="absolute inset-0 z-[1] bg-gradient-to-t from-black/55 via-black/25 to-transparent"
          aria-hidden
        />

        <div className="pointer-events-none relative z-[2] flex w-full flex-1 items-center justify-center px-[var(--container-pad)]">
          <h1
            ref={titleRef}
            className="hero-title text-center uppercase text-[color-mix(in_srgb,var(--paloma-white)_98%,transparent)] [text-shadow:0_2px_40px_color-mix(in_srgb,var(--paloma-coal)_35%,transparent)] will-change-[transform,opacity]"
          >
            PALOMA
          </h1>
        </div>
      </div>
    </section>
  );
}
