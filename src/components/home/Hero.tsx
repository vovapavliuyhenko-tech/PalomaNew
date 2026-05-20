"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import { FadeIn } from "@/components/motion/FadeIn";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Body, H1 } from "@/components/ui/typography";
import { BrandGiraffe } from "@/components/ui/BrandGiraffe";

const ctaPrimary =
  "inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-ink)] bg-[var(--color-ink)] px-8 font-[family-name:var(--font-body),sans-serif] text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--color-cream)] transition-opacity hover:opacity-[0.92] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)] sm:w-auto";

const ctaSecondary =
  "inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_srgb,var(--color-ink)_28%,transparent)] bg-transparent px-8 font-[family-name:var(--font-body),sans-serif] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)] sm:w-auto";

const ctaGhost =
  "inline-flex min-h-11 w-full items-center justify-center border-0 bg-transparent font-[family-name:var(--font-body),sans-serif] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink)] underline-offset-[6px] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)] sm:w-auto";

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const watermarkY = useTransform(scrollYProgress, [0, 0.55], ["0%", "-20%"]);
  const watermarkOpacity = useTransform(scrollYProgress, [0.2, 0.55], [1, 0]);
  const mascotScale = useTransform(scrollYProgress, [0, 0.45], [1, 1.04]);

  return (
    <Section
      ref={sectionRef}
      size="lg"
      tone="cream"
      className="relative !border-b-0 bg-[var(--color-bg-ivory)] !pt-0"
    >
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_90%_70%_at_75%_18%,color-mix(in_srgb,var(--color-accent-burgundy)_6%,transparent)_0%,transparent_55%)]"
        aria-hidden
      />

      <motion.div
        className="pointer-events-none absolute right-0 top-[14%] z-[2] hidden max-h-none w-[min(100%,36rem)] select-none lg:block xl:w-[min(100%,40rem)]"
        style={{ y: watermarkY, opacity: watermarkOpacity }}
        aria-hidden
      >
        <p className="translate-x-[8%] text-right font-[family-name:var(--font-display),var(--font-serif),serif] text-[clamp(2.75rem,11vw,7.5rem)] font-normal leading-none tracking-[-0.04em] text-[color-mix(in_srgb,var(--paloma-coal)_6%,transparent)]">
          PALOMA
        </p>
      </motion.div>

      <Container className="relative z-[3]">
        <div className="grid min-h-[min(86svh,820px)] grid-cols-1 gap-12 pb-[var(--space-xl)] pt-[calc(var(--header-h-mobile)+var(--space-lg))] md:min-h-[min(90svh,900px)] md:gap-14 md:pb-[var(--space-2xl)] md:pt-[calc(var(--header-h-desktop)+var(--space-md))] lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-20">
          <FadeIn className="min-w-0">
            <div className="flex max-w-[40rem] flex-col gap-10">
              <div className="flex flex-col gap-6">
                <H1 className="text-balance !leading-[1.1] tracking-[-0.022em] text-[var(--color-text-graphite)]">
                  Цветы, кофе и маленькие радости у моря
                </H1>
                <Body className="max-w-none !leading-[1.7] text-[color-mix(in_srgb,var(--paloma-coal)_52%,transparent)]">
                  Цветочный бутик и кофейня Paloma в Новороссийске — ул. Энгельса, 74
                </Body>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-5">
                <Link href="/catalog" className={ctaPrimary}>
                  Выбрать букет
                </Link>
                <Link href="/catalog" className={ctaSecondary}>
                  Перейти в каталог
                </Link>
              </div>

              <Link href="/wedding" className={`${ctaGhost} !w-fit`}>
                Свадебная флористика
              </Link>
            </div>
          </FadeIn>

          <FadeIn delay={0.06} className="relative min-w-0">
            <motion.div
              className="relative mx-auto aspect-[3/4] w-full max-w-[min(100%,440px)] lg:mx-0 lg:max-w-none lg:aspect-[4/5]"
              style={{ scale: mascotScale }}
            >
              <div className="absolute inset-0 rounded-[var(--radius-card)] bg-[var(--color-bg-milk)] shadow-[var(--shadow-soft)] ring-1 ring-[color-mix(in_srgb,var(--paloma-coal)_8%,transparent)]" />
              <div className="relative h-full w-full overflow-hidden rounded-[var(--radius-card)]">
                <BrandGiraffe priority withAnimation className="pb-[6%] pt-[4%]" />
              </div>
            </motion.div>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}
