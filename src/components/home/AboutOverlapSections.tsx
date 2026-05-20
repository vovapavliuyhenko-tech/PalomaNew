"use client";

import Image from "next/image";
import Link from "next/link";

/** TODO(zamena): фото палома — заменить на бренд */
const IMG_A =
  "https://images.unsplash.com/photo-1563241527-3004b7be0258?w=1200&q=85";
const IMG_B =
  "https://images.unsplash.com/photo-1455659410655-02201060ba1f?w=1200&q=85";

/** Две секции по 100svh со sticky/stacking после hero */
export default function AboutOverlapSections() {
  return (
    <div className="relative bg-[var(--paloma-white)]">
      <section className="sticky top-0 z-[41] flex min-h-[100svh] items-center bg-[var(--paloma-white)] py-[var(--space-lg)] lg:py-0">
        <div className="container mx-auto grid gap-[var(--space-lg)] lg:grid-cols-2 lg:items-center lg:gap-[var(--space-xl)]">
          <div className="relative order-2 aspect-[4/5] min-h-[220px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-soft)] lg:order-1">
            <Image
              src={IMG_A}
              alt="Интерьер салона цветов — замените на бренд (TODO zamena)"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
          </div>
          <div className="order-1 space-y-[var(--space-lg)] lg:order-2">
            <p className="typo-caption font-medium uppercase tracking-[var(--ls-widest)] text-[color-mix(in_srgb,var(--paloma-coal)_55%,transparent)]">
              Философия
            </p>
            <h2 className="section-title text-[var(--text-primary)]">
              О пространстве
            </h2>
            <p className="body-large font-light text-[var(--text-secondary)]">
              Paloma — это цветы, кофе и пространство для красивых повседневных ритуалов. Мы собираем
              букеты так, чтобы они не просто украшали интерьер, а создавали настроение, запоминались и
              становились частью момента.
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-[42] flex min-h-[100svh] items-center border-t border-[var(--border)] bg-[var(--paloma-white)] py-[var(--space-lg)] shadow-[var(--shadow-soft)] lg:py-0">
        <div className="container mx-auto grid gap-[var(--space-lg)] lg:grid-cols-2 lg:items-center lg:gap-[var(--space-xl)]">
          <div className="space-y-[var(--space-lg)] lg:max-w-xl">
            <p className="typo-caption font-medium uppercase tracking-[var(--ls-widest)] text-[color-mix(in_srgb,var(--paloma-coal)_55%,transparent)]">
              Что мы делаем
            </p>
            <h2 className="section-title text-[var(--text-primary)]">
              Комплексно и бережно
            </h2>
            <p className="body-large font-light text-[var(--text-secondary)]">
              Мы соединяем флористику, эстетику кофейни и внимание к деталям. У нас можно выбрать букет,
              заказать оформление события, взять кофе с собой и найти подарок, который говорит вместо тысячи
              слов.
            </p>
            <Link
              href="/catalog"
              className="btn-primary mt-[var(--space-md)] inline-flex"
            >
              Смотреть букеты
            </Link>
          </div>
          <div className="relative aspect-[4/5] min-h-[220px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-soft)]">
            <Image
              src={IMG_B}
              alt="Композиция букета — замените на бренд (TODO zamena)"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
