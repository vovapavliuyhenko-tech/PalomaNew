"use client";

import { motion } from "framer-motion";
import { fadeUpVariant, staggerContainer } from "@/lib/animations";

const items = [
  {
    title: "Фото перед отправкой",
    text: "Перед доставкой клиент видит готовый букет.",
  },
  {
    title: "Коробка с водой",
    text: "Букет едет бережно и дольше остаётся свежим.",
  },
  {
    title: "Доставка день-в-день",
    text: "Для готовых букетов из витрины — быстро и аккуратно.",
  },
  {
    title: "Инструкция по уходу",
    text: "Получатель знает, как продлить жизнь цветам.",
  },
] as const;

export default function ServiceHighLevel() {
  return (
    <section className="py-14 lg:py-20 bg-[var(--bg-card)]">
      <div className="container mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-2xl mb-12"
        >
          <motion.h2
            variants={fadeUpVariant}
            className="text-[var(--text-primary)] mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Цветы должны приехать красиво
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
        >
          {items.map((item) => (
            <motion.article
              key={item.title}
              variants={fadeUpVariant}
              className="border border-[var(--border)] rounded-[var(--radius-medium)] p-6 bg-[var(--color-bg-shell)]/40"
            >
              <h3
                className="text-base text-[var(--text-primary)] mb-2"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {item.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.text}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
