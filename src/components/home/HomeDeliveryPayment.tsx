"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Truck, Smartphone, Globe } from "lucide-react";
import { fadeUpVariant, staggerContainer } from "@/lib/animations";
import { siteConfig } from "@/lib/siteConfig";
import { formatPrice } from "@/lib/utils";

const cities = ["Новороссийск", "Геленджик", "Анапа"] as const;

export default function HomeDeliveryPayment() {
  const freeFrom = formatPrice(siteConfig.minOrderFreeDelivery);

  return (
    <section className="border-y border-[var(--border)] bg-[var(--color-bg-muted-block)]/50 py-16 lg:py-20">
      <div className="container mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-12 max-w-2xl"
        >
          <motion.h2 variants={fadeUpVariant} className="text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
            Доставка и оплата
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            Новороссийск, Геленджик, Анапа. Доставка день в день по согласованию. Интервал фиксируем при заказе.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-4 md:grid-cols-3"
        >
          <motion.article variants={fadeUpVariant} className="rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <Truck size={22} strokeWidth={1.4} className="mb-4 text-[var(--color-accent-primary)]" aria-hidden />
            <h3 className="mb-2 text-base text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
              Зоны
            </h3>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              Доставляем по: {cities.join(", ")}. При сумме от {freeFrom} доставку не берём — при меньшей сумме условия по городу на странице «Доставка».
            </p>
          </motion.article>

          <motion.article variants={fadeUpVariant} className="rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <Globe size={22} strokeWidth={1.4} className="mb-4 text-[var(--color-accent-primary)]" aria-hidden />
            <h3 className="mb-2 text-base text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
              Онлайн-оплата
            </h3>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              Оплатить можно картой, через Систему быстрых платежей и Яндекс Pay после оформления заказа.
            </p>
          </motion.article>

          <motion.article variants={fadeUpVariant} className="rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <Smartphone size={22} strokeWidth={1.4} className="mb-4 text-[var(--color-accent-primary)]" aria-hidden />
            <h3 className="mb-2 text-base text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
              Фото перед отправкой
            </h3>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              Можем показать букет перед доставкой — отметьте пожелание при оформлении заказа.
            </p>
          </motion.article>
        </motion.div>

        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-10 flex flex-wrap gap-4">
          <Link href="/delivery" className="btn-secondary text-sm">
            Условия и карта
          </Link>
          <Link
            href="/faq"
            className="inline-flex items-center text-sm uppercase tracking-[var(--ls-wide)] text-[var(--color-cherry)] underline underline-offset-[6px] transition-colors hover:text-[var(--paloma-burgundy)]"
          >
            Все вопросы
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
