"use client";

import Link from "next/link";

import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Body, H2 } from "@/components/ui/typography";

const primary =
  "inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-ink)] bg-[var(--color-ink)] px-8 font-[family-name:var(--font-body),sans-serif] text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--color-cream)] transition-opacity hover:opacity-[0.92] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)] lg:w-auto";

const secondary =
  "inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_srgb,var(--color-ink)_28%,transparent)] bg-transparent px-8 font-[family-name:var(--font-body),sans-serif] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)] lg:w-auto";

export default function CafeBlock() {
  return (
    <Section size="lg" tone="cream">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-bg-milk)] ring-1 ring-[color-mix(in_srgb,var(--paloma-coal)_8%,transparent)] lg:order-1">
            <ParallaxImage
              src="/images/placeholders/product-3x4.svg"
              alt=""
              width={800}
              height={1000}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="lg:order-2">
            <H2 className="text-[var(--color-ink)]">Цветы, кофе и маленькие радости в одном месте</H2>
            <Body className="mt-6 text-[var(--color-ink)]/85">
              Латте с молоком «как облако», какао на густом шоколаде и десерты из витрины — к букету или
              отдельно. Заходите после пляжа: запах свежих стеблей у входа, тёплая чашка внутри и спокойный
              ритм Paloma.
            </Body>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/coffee" className={primary}>
                Перейти в кофейню
              </Link>
              <Link href="/catalog/coffee-desserts" className={secondary}>
                Добавить кофе к букету
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
