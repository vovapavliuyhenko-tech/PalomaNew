"use client";

import { motion } from "framer-motion";
import { fadeUpVariant, staggerContainer } from "@/lib/animations";

const reasons = [
  {
    n: "01",
    title: "Букеты готовы сегодня",
    text: "В онлайн-витрине — букеты, которые уже собраны и доступны к заказу.",
  },
  {
    n: "02",
    title: "Фото перед отправкой",
    text: "Вы увидите готовый букет до доставки и будете уверены в результате.",
  },
  {
    n: "03",
    title: "Свежие и редкие цветы",
    text: "Работаем с сезонными цветами и редкими поставками.",
  },
  {
    n: "04",
    title: "Упаковка с водой",
    text: "Букет едет бережно и сохраняет свежесть в дороге.",
  },
  {
    n: "05",
    title: "Помощь с выбором",
    text: "Подскажем, какой букет выбрать под повод, бюджет и настроение.",
  },
  {
    n: "06",
    title: "Доставка рядом",
    text: "Доставляем по Новороссийску, Геленджику, Анапе и ближайшим городам.",
  },
] as const;

export default function WhyPaloma() {
  return (
    <section className="py-14 lg:py-[var(--section-spacing-tablet)] bg-[var(--color-bg-shell)] border-y border-[var(--border)]">
      <div className="container mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-2xl mb-12 lg:mb-16"
        >
          <motion.h2
            variants={fadeUpVariant}
            className="text-[var(--text-primary)] mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Почему PALOMA
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="text-[var(--text-secondary)] text-sm leading-relaxed">
            Мы делаем заказ цветов понятным, красивым и спокойным — от выбора букета до момента
            вручения.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5"
        >
          {reasons.map((item) => (
            <motion.article
              key={item.n}
              variants={fadeUpVariant}
              className="border border-[var(--border)] bg-[var(--bg-card)] rounded-[var(--radius-medium)] p-6 lg:p-8 flex flex-col gap-3"
            >
              <span
                className="text-4xl lg:text-5xl text-[var(--color-cherry)]/35 font-light leading-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.n}
              </span>
              <h3
                className="text-lg text-[var(--text-primary)] leading-snug"
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
