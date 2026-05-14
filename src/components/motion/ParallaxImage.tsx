"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type ParallaxImageProps = Omit<ImageProps, "alt"> & {
  alt: string;
  className?: string;
  wrapperClassName?: string;
};

/** Лёгкий параллакс по вертикали через GSAP ScrollTrigger (этап 3). */
export function ParallaxImage({
  className,
  wrapperClassName,
  alt,
  src,
  ...props
}: ParallaxImageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (cancelled || !wrapRef.current) return;

      const img = el.querySelector("img");
      if (!img) return;

      ctx = gsap.context(() => {
        gsap.fromTo(
          img,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }, el);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={cn("relative overflow-hidden", wrapperClassName)}
    >
      <Image
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover", className)}
        sizes="(max-width: 768px) 100vw, 50vw"
        {...props}
      />
    </div>
  );
}
