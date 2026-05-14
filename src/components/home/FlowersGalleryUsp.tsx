"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1455659410655-02201060ba1f?w=1200&q=85",
    alt: "Композиция Paloma — placeholder (TODO zamena)",
    key: "1",
  },
  {
    src: "https://images.unsplash.com/photo-1508610040649-e63918520fca?w=1200&q=85",
    alt: "Цветочная палитра — placeholder (TODO zamena)",
    key: "2",
  },
  {
    src: "https://images.unsplash.com/photo-1548587468-971f7f6222bf?w=1200&q=85",
    alt: "Оформление события — placeholder (TODO zamena)",
    key: "3",
  },
] as const;

const USP = [
  {
    headline: "Авторские букеты под повод, интерьер и настроение",
    body:
      "Каждый заказ можно собрать под интерьер, свет и палитру вечера — без шаблонов и ощущения «как у всех».",
  },
  {
    headline: "Цветы для подарка, свидания, события и красивого обычного дня",
    body: "Подбираем сочетание сортов, текстур и упаковки так, чтобы букет ощущался завершённой историей.",
  },
  {
    headline: "Оформление свадеб, камерных ужинов и мероприятий",
    body:
      "Свадебная линейка от букета невесты до зала президиума и welcome-зоны — единым визуальным языком Paloma.",
  },
  {
    headline: "Кофе и десерты внутри цветочного пространства",
    body:
      "Соберите утро из кофейни и букета: один ритм, одна палитра — меньше суеты, больше настроения.",
  },
];

/** Замена слайдов — бренд; слева cross-fade галерея, справа sticky-тексты по ТЗ */
export default function FlowersGalleryUsp() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let id: number | undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const start = () => {
      id = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 4600);
    };

    if (!mq.matches) start();

    const onMedia = () => {
      if (id !== undefined) window.clearInterval(id);
      id = undefined;
      if (!mq.matches) start();
    };

    mq.addEventListener("change", onMedia);
    return () => {
      if (id !== undefined) window.clearInterval(id);
      mq.removeEventListener("change", onMedia);
    };
  }, []);

  return (
    <section className="relative border-t border-[var(--border)] bg-[var(--paloma-white)] py-[var(--space-xxl)] md:py-[var(--space-xxxl)]">
      <div className="container mx-auto">
        <div className="grid gap-[var(--space-xl)] lg:grid-cols-2 lg:items-start lg:gap-[var(--space-xxl)]">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-card)] md:aspect-[16/11]">
            {SLIDES.map((s, i) => (
              <div
                key={s.key}
                className={`absolute inset-0 transition-opacity duration-[1.08s] ease-[var(--ease-soft)] motion-reduce:transition-none ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
              >
                <Image src={s.src} alt={s.alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 46vw" />
              </div>
            ))}
            <div className="pointer-events-none absolute bottom-6 left-6 flex gap-2" aria-hidden>
              {SLIDES.map((s, i) => (
                <span
                  key={s.key}
                  className={`h-2 w-8 rounded-full transition-colors duration-[var(--dur-base)] ${i === index ? "bg-[var(--paloma-orange)]" : "bg-[color-mix(in_srgb,var(--paloma-coal)_22%,transparent)]"}`}
                />
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-[calc(var(--header-h-desktop)+var(--space-md))] lg:self-start lg:max-w-xl xl:top-[calc(var(--header-h-desktop)+var(--space-lg))]">
            <p className="typo-caption font-medium uppercase tracking-[var(--ls-widest)] text-[color-mix(in_srgb,var(--paloma-coal)_55%,transparent)]">
              Коллекции &amp; УТП
            </p>
            <div className="space-y-[var(--space-xxl)] pt-[var(--space-lg)]">
              {USP.map((item) => (
                <article key={item.headline} className="space-y-[var(--space-md)]">
                  <h3 className="section-title !text-[clamp(1.6rem,4vw,4rem)] text-[var(--text-primary)]">
                    {item.headline}
                  </h3>
                  <p className="body-text text-[var(--text-secondary)]">{item.body}</p>
                </article>
              ))}
            </div>
            <Link
              href="/events"
              className="btn-primary mb-[var(--space-lg)] mt-[var(--space-xl)] inline-flex w-full min-h-[44px] justify-center md:w-auto lg:mt-[var(--space-xxl)]"
            >
              Оформить событие
            </Link>

            <ul className="typo-caption space-y-2 border-t border-[var(--border)] pt-[var(--space-lg)] text-[var(--text-secondary)]">
              <li>Цветочная подписка для дома, офиса и бизнеса</li>
              <li>Готовые композиции и индивидуальная сборка</li>
              <li>Эстетичная упаковка и внимание к деталям</li>
              <li>Доставка и самовывоз</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
