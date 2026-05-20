import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import EventQuizClient from "./EventQuizClient";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/seo/FaqPageJsonLd";
import { siteConfig } from "@/lib/siteConfig";
import { definePageMeta } from "@/lib/seo";
import {
  EVENT_GALLERY,
  EVENT_PAGE_FAQ,
  EVENT_PROCESS_STEPS,
  EVENT_SERVICES,
} from "@/data/events-content";

const EVENT_HERO =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=85";

export const metadata: Metadata = definePageMeta({
  title: `Оформление мероприятий — ${siteConfig.legalName}`,
  description: `Флористика для корпоративов, дней рождения и событий в ${siteConfig.city}. Зал, фотозона, сцена, монтаж. Заявка онлайн — Paloma Flowers.`,
  path: "/events",
});

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <FaqPageJsonLd items={EVENT_PAGE_FAQ} />
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Мероприятия", path: "/events" },
        ]}
      />

      <div className="relative flex min-h-[400px] h-[60vh] items-end pb-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${EVENT_HERO}')` }}
        />
        <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--paloma-coal)_48%,transparent)]" />
        <div
          className="absolute inset-0 bg-[linear-gradient(115deg,color-mix(in_srgb,var(--paloma-orange)_42%,transparent)_0%,transparent_55%,color-mix(in_srgb,var(--paloma-orange)_18%,transparent)_100%)]"
          aria-hidden
        />
        <div className="relative z-10 container mx-auto">
          <nav
            className="mb-6 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-[color-mix(in_srgb,var(--paloma-white)_72%,transparent)]"
            aria-label="Хлебные крошки"
          >
            <Link
              href="/"
              className="transition-colors hover:text-[var(--paloma-orange)]"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Главная
            </Link>
            <span className="text-[color-mix(in_srgb,var(--paloma-white)_38%,transparent)]" aria-hidden>
              /
            </span>
            <span className="text-[var(--paloma-white)]" style={{ fontFamily: "var(--font-accent)" }}>
              Мероприятия
            </span>
          </nav>
          <p className="font-accent mb-3 text-xs font-medium uppercase italic tracking-[0.22em] text-[var(--paloma-orange)]">
            События · Paloma
          </p>
          <div className="mb-6 h-px w-14 bg-[var(--paloma-orange)]" aria-hidden />
          <h1
            className="max-w-3xl text-balance text-[var(--text-on-dark)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.25rem, 4.8vw, 3.75rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              fontWeight: 400,
            }}
          >
            Оформление мероприятий
          </h1>
          <p className="font-accent mt-6 max-w-2xl text-balance text-base leading-relaxed text-[color-mix(in_srgb,var(--paloma-white)_88%,transparent)] md:text-lg">
            Корпоративы, частные праздники и камерные форматы — тёплый оранжевый акцент Paloma вместо «типового» банкетного декора.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#quiz" className="btn-primary scroll-smooth">
              Рассчитать оформление
            </Link>
            <Link
              href="/wedding"
              className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-pill)] border-2 border-[color-mix(in_srgb,var(--paloma-white)_55%,transparent)] bg-transparent px-6 text-sm text-[var(--paloma-white)] transition-colors hover:border-[var(--paloma-orange)] hover:text-[var(--paloma-orange)]"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Свадьбы отдельно →
            </Link>
          </div>
        </div>
      </div>

      <ScrollReveal>
        <section className="border-t border-[color-mix(in_srgb,var(--paloma-orange)_22%,var(--border))] bg-[color-mix(in_srgb,var(--paloma-orange)_05%,var(--paloma-white))] py-[var(--space-xl)] md:py-[var(--space-xxl)]">
          <div className="container mx-auto">
            <p className="font-accent mb-3 text-center text-xs font-medium uppercase italic tracking-[0.2em] text-[var(--paloma-orange)]">
              Направления
            </p>
            <h2
              className="mb-10 text-center text-balance text-[var(--text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                letterSpacing: "-0.02em",
                fontWeight: 400,
                lineHeight: 1.1,
              }}
            >
              Под задачу площадки и сценария
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {EVENT_SERVICES.map((s, i) => (
                <div
                  key={s.title}
                  className="border border-[var(--border)] border-l-[3px] border-l-[var(--paloma-orange)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)] md:p-7"
                >
                  <span className="font-accent mb-3 block text-[10px] uppercase tracking-[var(--ls-widest)] text-[var(--paloma-orange)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mb-2 text-lg text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                    {s.title}
                  </p>
                  <p className="font-accent text-sm leading-relaxed text-[var(--text-secondary)]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="container mx-auto py-[var(--space-xl)] md:py-[var(--space-xxl)]">
          <p className="font-accent mb-3 text-center text-xs font-medium uppercase italic tracking-[0.2em] text-[var(--paloma-orange)]">
            Процесс
          </p>
          <h2
            className="mb-12 text-center text-balance text-[var(--text-primary)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              letterSpacing: "-0.02em",
              fontWeight: 400,
              lineHeight: 1.1,
            }}
          >
            Четыре шага до монтажа
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {EVENT_PROCESS_STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] px-5 py-7 text-center shadow-[var(--shadow-soft)]"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--paloma-orange)_14%,var(--paloma-white))]">
                  <span
                    className="text-[var(--paloma-orange)]"
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
            <p className="font-accent mb-3 text-center text-xs font-medium uppercase italic tracking-[0.2em] text-[var(--paloma-orange)]">
              Референсы настроения
            </p>
            <h2
              className="mb-10 text-center text-balance text-[var(--text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                letterSpacing: "-0.02em",
                fontWeight: 400,
                lineHeight: 1.1,
              }}
            >
              Атмосфера событий
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {EVENT_GALLERY.map((g) => (
                <div
                  key={g.src}
                  className="relative aspect-square overflow-hidden rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--paloma-orange)_18%,var(--border))] shadow-[var(--shadow-soft)]"
                >
                  <Image
                    src={g.src}
                    alt={g.alt}
                    fill
                    className="object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-soft)] hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <div
          id="quiz"
          className="scroll-mt-[calc(var(--header-h-mobile)+12px)] border-t border-[color-mix(in_srgb,var(--paloma-orange)_25%,var(--border))] bg-[color-mix(in_srgb,var(--paloma-orange)_07%,var(--paloma-white))] py-[var(--space-xl)] lg:scroll-mt-[calc(var(--header-h-desktop)+12px)] md:py-[var(--space-xxl)]"
        >
          <div className="container mx-auto">
            <div className="mx-auto w-full max-w-3xl">
              <p className="font-accent mb-3 text-center text-xs font-medium uppercase italic tracking-[0.2em] text-[var(--paloma-orange)]">
                Заявка
              </p>
              <h2
                className="mb-3 text-center text-[var(--text-primary)]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.65rem, 3vw, 2.25rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                }}
              >
                Рассчитайте оформление
              </h2>
              <p className="mb-10 text-center text-sm text-[var(--text-secondary)]">
                Несколько шагов — и менеджер подготовит предложение под ваш формат
              </p>
              <EventQuizClient />
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <section className="border-t border-[var(--color-line)] bg-[var(--bg-card)] py-[var(--space-xl)] md:py-[var(--space-xxl)]">
          <div className="container mx-auto max-w-3xl">
            <p className="font-accent mb-3 text-center text-xs font-medium uppercase italic tracking-[0.2em] text-[var(--paloma-orange)]">
              Вопросы
            </p>
            <h2
              className="mb-10 text-center text-balance text-[var(--text-primary)]"
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
              {EVENT_PAGE_FAQ.map((item) => (
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
        <section className="border-t border-[var(--color-line)] bg-[color-mix(in_srgb,var(--paloma-orange)_05%,var(--paloma-white))] py-[var(--space-xl)] md:py-[var(--space-xxl)]">
          <div className="container mx-auto max-w-2xl text-center">
            <p className="font-accent mb-3 text-xs font-medium uppercase italic tracking-[0.2em] text-[var(--paloma-orange)]">
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
    </div>
  );
}
