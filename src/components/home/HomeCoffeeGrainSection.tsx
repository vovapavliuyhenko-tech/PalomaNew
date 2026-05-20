"use client";

import Link from "next/link";
import ScrollCoffeeGrain from "./ScrollCoffeeGrain";

/** Светлый блок кофейни на главной: зерно + текст по ТЗ */
export default function HomeCoffeeGrainSection() {
  return (
    <section className="relative border-t border-[var(--border)] bg-[var(--paloma-white)] py-[var(--space-xxl)] md:py-[var(--space-xxxl)]">
      <div className="container mx-auto grid gap-[var(--space-xl)] lg:grid-cols-2 lg:items-center lg:gap-[calc(var(--space-xl)+var(--space-md))]">
        <ScrollCoffeeGrain />
        <div className="flex flex-col justify-center space-y-[var(--space-lg)]">
          <p className="typo-caption font-medium uppercase tracking-[var(--ls-widest)] text-[color-mix(in_srgb,var(--paloma-coal)_55%,transparent)]">
            Café
          </p>
          <h2 className="section-title text-[var(--text-primary)]">Paloma Coffee</h2>
          <p className="body-large max-w-xl font-light text-[var(--text-secondary)]">
            Paloma Coffee — это продолжение нашей цветочной эстетики в формате ежедневного ритуала. Здесь
            можно взять кофе, выбрать десерт, собрать букет, дождаться заказ или просто остановиться на
            несколько минут среди цветов, света и спокойствия.
          </p>
          <div>
            <Link href="/coffee" className="btn-primary mt-[var(--space-sm)] inline-flex">
              Зайти в кофейню
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
