"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpVariant, staggerContainer } from "@/lib/animations";

const items = [
  ["Онлайн-витрина", "/catalog/online-vitrina"],
  ["Бестселлеры", "/catalog/bukety"],
  ["Цветочные композиции", "/catalog/kompozicii"],
  ["Моно и дуобукеты", "/catalog/mono"],
  ["Пионы", "/catalog/piony"],
  ["Свадебные", "/catalog/wedding-bouquets"],
  ["Вазы и подарки", "/catalog/vazy-i-podarki"],
  ["Самый сезон", "/catalog/seasonal"],
] as const;

export default function QuickCategories() {
  return (
    <section
      className="py-12 lg:py-16 bg-[var(--color-bg-shell)] border-y border-[var(--border)]"
      id="quick-categories"
    >
      <div className="container mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-8 lg:mb-10"
        >
          <motion.h2
            variants={fadeUpVariant}
            className="text-[var(--text-primary)] text-center lg:text-left"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Выберите повод или настроение
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="lg:hidden -mx-[var(--container-padding-desktop)] max-[1200px]:-mx-[var(--container-padding-tablet)] max-[768px]:-mx-[var(--container-padding-mobile)] flex gap-3 overflow-x-auto px-[var(--container-padding-desktop)] max-[1200px]:px-[var(--container-padding-tablet)] max-[768px]:px-[var(--container-padding-mobile)] snap-x snap-mandatory pb-2 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map(([label, href]) => (
            <motion.div key={href + label} variants={fadeUpVariant} className="snap-start flex-shrink-0">
              <Link
                href={href}
                className="flex min-w-[220px] min-h-[140px] flex-col justify-end border border-[var(--border)] bg-[var(--bg-card)] px-5 py-5 transition-colors hover:border-[var(--color-cherry)]/40 hover:bg-[var(--bg-secondary)]"
              >
                <span
                  className="text-[10px] uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)] mb-2"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  Каталог
                </span>
                <span
                  className="text-lg text-[var(--text-primary)] leading-snug"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {label}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="hidden lg:grid lg:grid-cols-4 gap-px bg-[var(--border)] border border-[var(--border)] overflow-hidden rounded-[var(--radius-medium)]"
        >
          {items.map(([label, href]) => (
            <motion.div key={href + label} variants={fadeUpVariant} className="bg-[var(--bg-card)]">
              <Link
                href={href}
                className="group flex min-h-[180px] flex-col justify-end px-6 py-6 transition-colors hover:bg-[var(--bg-secondary)]"
              >
                <span
                  className="text-[10px] uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)] mb-3 group-hover:text-[var(--color-cherry)]"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  Перейти
                </span>
                <span
                  className="text-xl text-[var(--text-primary)] leading-tight group-hover:text-[var(--color-burgundy)] transition-colors"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {label}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
