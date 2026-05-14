import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/seo/FaqPageJsonLd";
import PageHero from "@/components/layout/PageHero";
import { siteConfig } from "@/lib/siteConfig";
import { definePageMeta } from "@/lib/seo";
import WeddingQuoteClient from "./WeddingQuoteClient";
import {
  WEDDING_GALLERY,
  WEDDING_PAGE_FAQ,
  WEDDING_PRD_SERVICES,
  WEDDING_PROCESS_STEPS,
} from "@/data/wedding-content";

const WEDDING_HERO =
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920&q=85";

export const metadata: Metadata = definePageMeta({
  title: `Свадебная флористика — ${siteConfig.legalName}`,
  description: `Свадебное оформление в ${siteConfig.city}: букет невесты, арка, декор столов, фотозона, ресторан, выездная регистрация, пакет под ключ. Расчёт по заявке.`,
  path: "/wedding",
});

export default function WeddingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <FaqPageJsonLd items={WEDDING_PAGE_FAQ} />
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Свадебная флористика", path: "/wedding" },
        ]}
      />

      <PageHero
        crumbs={[{ name: "Главная", href: "/" }, { name: "Свадебная флористика" }]}
        eyebrow={`${siteConfig.legalName} · свадьбы и церемонии`}
        title="Свадебная флористика"
        lead="Сопровождаем пару от первой встречи до монтажа на площадке — с премиальной палитрой Paloma и живыми текстурами сезона."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/contacts" className="btn-primary">
            Обсудить проект
          </Link>
          <Link href="#quote" className="btn-secondary scroll-smooth">
            Рассчитать оформление
          </Link>
          <Link href="/wedding-piggybank" className="btn-secondary">
            Свадебная копилка
          </Link>
        </div>
      </PageHero>

      <ScrollReveal>
        <div className="container mx-auto py-[var(--space-xl)] md:py-[var(--space-xxl)]">
          <div className="relative aspect-[21/9] min-h-[180px] w-full max-h-[400px] overflow-hidden rounded-[var(--radius-medium)] border border-[var(--border)] shadow-[var(--shadow-card)]">
            <Image
              src={WEDDING_HERO}
              alt="Свадебное оформление Paloma"
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <section className="border-t border-[var(--color-line)] bg-[var(--bg-primary)] py-[var(--space-xl)] lg:scroll-mt-[calc(var(--header-h-desktop)+12px)] md:py-[var(--space-xxl)] scroll-mt-[calc(var(--header-h-mobile)+12px)]">
          <div className="container mx-auto">
            <p className="font-accent mb-3 text-xs font-medium uppercase italic tracking-[0.2em] text-[var(--color-cherry)]">
              Что делаем
            </p>
            <h2
              className="mb-10 max-w-2xl text-balance text-[var(--text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                letterSpacing: "-0.02em",
                fontWeight: 400,
                lineHeight: 1.12,
              }}
            >
              Полный спектр свадебного оформления
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {WEDDING_PRD_SERVICES.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-soft)] md:p-8"
                >
                  <h3
                    className="mb-2 text-lg text-[var(--text-primary)]"
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em", fontWeight: 400 }}
                  >
                    {item.title}
                  </h3>
                  <p className="font-accent text-sm leading-relaxed text-[var(--text-secondary)]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="container mx-auto py-[var(--space-xl)] md:py-[var(--space-xxl)]">
          <p className="font-accent mb-3 text-center text-xs font-medium uppercase italic tracking-[0.2em] text-[var(--color-cherry)]">
            Как проходит работа
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
            Семь шагов до вашего дня
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WEDDING_PROCESS_STEPS.map((item, idx) => (
              <div
                key={item.step}
                className={
                  idx === WEDDING_PROCESS_STEPS.length - 1
                    ? "rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] px-5 py-7 text-center shadow-[var(--shadow-soft)] sm:col-span-2 sm:max-w-lg sm:justify-self-center lg:col-span-3 lg:max-w-xl"
                    : "rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] px-5 py-7 text-center shadow-[var(--shadow-soft)]"
                }
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
                  className="mb-2 text-base leading-snug text-[var(--text-primary)]"
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
        <section className="border-t border-[var(--color-line)] bg-[var(--bg-secondary)] py-[var(--space-xl)] md:py-[var(--space-xxl)]">
          <div className="container mx-auto">
            <p className="font-accent mb-3 text-center text-xs font-medium uppercase italic tracking-[0.2em] text-[var(--color-cherry)]">
              Галерея работ
            </p>
            <h2
              className="mb-10 text-balance text-center text-[var(--text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                letterSpacing: "-0.02em",
                fontWeight: 400,
                lineHeight: 1.1,
              }}
            >
              Эстетика и детали
            </h2>
            <div className="grid gap-[var(--space-md)] sm:grid-cols-2 lg:grid-cols-4 md:gap-[var(--space-lg)]">
              {WEDDING_GALLERY.map((g) => (
                <div
                  key={g.src}
                  className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] shadow-[var(--shadow-soft)]"
                >
                  <Image src={g.src} alt={g.alt} fill className="object-cover" sizes="(max-width:640px) 100vw, 25vw" />
                </div>
              ))}
            </div>
            <p className="caption mx-auto mt-8 max-w-2xl text-center text-[var(--text-secondary)]">
              Примеры настроения и масштаба; в портфолио добавляем реальные кейсы монтажа Paloma.
            </p>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section
          id="quote"
          className="border-t border-[var(--color-line)] bg-[var(--bg-primary)] py-[var(--space-xl)] scroll-mt-[calc(var(--header-h-mobile)+12px)] md:py-[var(--space-xxl)] lg:scroll-mt-[calc(var(--header-h-desktop)+12px)]"
        >
          <div className="container mx-auto max-w-3xl">
            <p className="font-accent mb-3 text-center text-xs font-medium uppercase italic tracking-[0.2em] text-[var(--color-cherry)]">
              Расчёт
            </p>
            <h2
              className="mb-4 text-balance text-center text-[var(--text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                letterSpacing: "-0.02em",
                fontWeight: 400,
                lineHeight: 1.1,
              }}
            >
              Заявка на оформление
            </h2>
            <p className="font-accent mx-auto mb-10 max-w-lg text-center text-sm leading-relaxed text-[var(--text-secondary)]">
              Заполните форму — мы уточним детали и подготовим ориентир по смете. Обработка персональных данных — по{" "}
              <Link href="/consent" className="text-[var(--color-cherry)] underline underline-offset-2">
                согласию
              </Link>
              .
            </p>
            <WeddingQuoteClient />
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="border-t border-[var(--color-line)] bg-[var(--bg-card)] py-[var(--space-xl)] md:py-[var(--space-xxl)]">
          <div className="container mx-auto max-w-3xl">
            <p className="font-accent mb-3 text-center text-xs font-medium uppercase italic tracking-[0.2em] text-[var(--color-cherry)]">
              Вопросы
            </p>
            <h2
              className="mb-10 text-balance text-center text-[var(--text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                letterSpacing: "-0.02em",
                fontWeight: 400,
                lineHeight: 1.1,
              }}
            >
              FAQ
            </h2>
            <div className="space-y-4">
              {WEDDING_PAGE_FAQ.map((item) => (
                <div
                  key={item.question}
                  className="rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-primary)] p-6 shadow-[var(--shadow-soft)]"
                >
                  <h3 className="mb-2 font-accent text-base font-medium text-[var(--text-primary)]">{item.question}</h3>
                  <p className="font-accent text-sm leading-relaxed text-[var(--text-secondary)]">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="border-t border-[var(--color-line)] bg-[var(--bg-primary)] py-[var(--space-xl)] md:py-[var(--space-xxl)]">
          <div className="container mx-auto max-w-2xl text-center">
            <p className="font-accent mb-3 text-xs font-medium uppercase italic tracking-[0.2em] text-[var(--color-cherry)]">
              Контакты
            </p>
            <h2
              className="mb-6 text-[var(--text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                letterSpacing: "-0.02em",
                fontWeight: 400,
              }}
            >
              Paloma в {siteConfig.city}
            </h2>
            <p className="font-accent mb-2 text-sm text-[var(--text-secondary)]">{siteConfig.address}</p>
            <p className="font-accent mb-6 text-sm text-[var(--text-secondary)]">{siteConfig.workingHours}</p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href={`tel:${siteConfig.phoneTel}`} className="btn-primary min-w-[200px] justify-center">
                {siteConfig.phone}
              </Link>
              <Link href="/contacts" className="btn-secondary min-w-[200px] justify-center">
                Все контакты
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="border-t border-[var(--color-line)] bg-[var(--bg-card)] py-[var(--space-xl)] md:py-[var(--space-xxl)]">
          <div className="container mx-auto text-center">
            <p className="font-accent mb-3 text-xs font-medium uppercase italic tracking-[0.2em] text-[var(--color-cherry)]">
              Мероприятия
            </p>
            <h2
              className="mx-auto mb-4 max-w-2xl text-balance text-[var(--text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                letterSpacing: "-0.02em",
                fontWeight: 400,
                lineHeight: 1.1,
              }}
            >
              Нужен декор не только для свадьбы?
            </h2>
            <p className="font-accent mx-auto mb-8 max-w-md text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
              Корпоративы, дни рождения и другие события — на странице мероприятий отдельный сценарий заявки.
            </p>
            <Link href="/events" className="btn-secondary">
              Перейти к мероприятиям
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
