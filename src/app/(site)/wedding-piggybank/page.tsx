import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import WeddingPiggybankClient from "./WeddingPiggybankClient";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PageHero from "@/components/layout/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { siteConfig } from "@/lib/siteConfig";

const PIGGYBANK_HERO =
  "https://images.unsplash.com/photo-1569513586164-80529357ad6f?w=1920&q=85";

export const metadata: Metadata = {
  title: `Свадебная копилка — ${siteConfig.legalName}`,
  description: `Создайте свадебную копилку в ${siteConfig.legalName}. Гости пополняют депозит, молодожёны тратят на цветы и оформление свадьбы.`,
};

const steps = [
  {
    step: "01",
    title: "Молодожёны создают страницу",
    desc: "Заполните форму, и мы создадим вашу личную страницу копилки с уникальной ссылкой.",
  },
  {
    step: "02",
    title: "Гости пополняют депозит",
    desc: "Поделитесь ссылкой с гостями. Они могут внести любую сумму — от 500 ₽.",
  },
  {
    step: "03",
    title: "Молодожёны тратят на цветы",
    desc: "Используйте накопленные средства на свадебный букет, оформление зала и декор.",
  },
] as const;

export default function WeddingPiggybankPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Свадебная копилка", path: "/wedding-piggybank" },
        ]}
      />

      <PageHero
        crumbs={[{ name: "Главная", href: "/" }, { name: "Свадебная копилка" }]}
        eyebrow={`${siteConfig.legalName} · для гостей и пары`}
        title="Свадебная копилка"
        lead="Гости пополняют депозит — вы тратите на букеты и оформление в Paloma. Один сервис для подарка, который превращается в живые цветы."
      >
        <div className="mt-8">
          <Link
            href="/wedding"
            className="font-accent text-sm font-medium uppercase tracking-[var(--ls-wider)] text-[var(--color-cherry)] underline underline-offset-4 transition-colors hover:text-[var(--paloma-burgundy)]"
          >
            Свадебная флористика
          </Link>
        </div>
      </PageHero>

      <div className="container mx-auto py-8 md:py-10">
        <div className="relative aspect-[21/9] min-h-[180px] w-full max-h-[400px] overflow-hidden rounded-[var(--radius-medium)] border border-[var(--border)] shadow-[var(--shadow-card)]">
          <Image
            src={PIGGYBANK_HERO}
            alt="Свадебная атмосфера Paloma"
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority
          />
        </div>
      </div>

      <ScrollReveal>
      <section className="container mx-auto max-w-5xl py-[var(--space-xl)] md:py-[var(--space-xxl)]">
        <p className="font-accent mb-3 text-center text-xs font-medium uppercase italic tracking-[0.2em] text-[var(--color-cherry)]">
          Процесс
        </p>
        <h2
          className="mb-12 text-balance text-center text-[var(--text-primary)]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
            letterSpacing: "-0.02em",
            fontWeight: 400,
            lineHeight: 1.1,
          }}
        >
          Как это работает
        </h2>
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((item) => (
            <div
              key={item.step}
              className="rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] px-6 py-8 text-center shadow-[var(--shadow-soft)]"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--paloma-orange)_08%,var(--paloma-white))]">
                <span
                  className="text-[var(--paloma-burgundy)]"
                  style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 400 }}
                >
                  {item.step}
                </span>
              </div>
              <h3
                className="mb-3 text-lg leading-snug text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.02em" }}
              >
                {item.title}
              </h3>
              <p className="font-accent text-sm leading-relaxed text-[var(--text-secondary)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal>
      <WeddingPiggybankClient />
      </ScrollReveal>
    </div>
  );
}
