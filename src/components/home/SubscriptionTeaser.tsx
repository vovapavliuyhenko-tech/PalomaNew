"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpVariant, staggerContainer } from "@/lib/animations";
import { Check } from "lucide-react";

const perks = [
  "Всегда свежие сезонные цветы — подписка держит дом в ритме цвета",
  "Акваваза и подкормка в комплекте там, где это уместно",
  "Фото перед отправкой — по желанию для спокойствия",
  "Доставка по согласованию в удобный интервал по городу и побережью",
  "Пауза или смена параметров — обсуждаем человечески, без давления",
];

export default function SubscriptionTeaser() {
  return (
    <section className="py-24 bg-[var(--color-coal)] text-[var(--text-on-dark)]">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.p
              variants={fadeUpVariant}
              className="text-[var(--color-cherry)] text-xs uppercase tracking-[var(--ls-widest)] mb-3"
            >
              Цветочная подписка
            </motion.p>
            <motion.h2
              variants={fadeUpVariant}
              className="text-[var(--text-on-dark)] mb-6"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Всегда свежие цветы в вашем доме
            </motion.h2>
            <motion.p
              variants={fadeUpVariant}
              className="text-white/65 text-sm leading-relaxed mb-8"
            >
              Оформление регулярных поставок: вы выбираете ритм и настроение букета — мы подбираем сезон и заботу PALOMA.
            </motion.p>

            <motion.ul variants={staggerContainer} className="space-y-3 mb-8">
              {perks.map((perk) => (
                <motion.li
                  key={perk}
                  variants={fadeUpVariant}
                  className="flex items-start gap-3 text-sm text-white/80"
                >
                  <Check size={15} className="text-[var(--color-cherry)] flex-shrink-0 mt-0.5" />
                  {perk}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div variants={fadeUpVariant}>
              <Link href="/subscription" className="btn-primary">
                Подробнее о подписке
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { name: "Мини", price: "от 2 900 ₽", freq: "раз в неделю" },
              { name: "Стандарт", price: "от 4 500 ₽", freq: "раз в неделю", popular: true },
              { name: "Премиум", price: "от 7 500 ₽", freq: "раз в неделю" },
              { name: "Bi-weekly", price: "от 6 500 ₽", freq: "2 раза в месяц" },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[var(--radius-small)] p-5 ${
                  plan.popular
                    ? "bg-[var(--color-cherry)] text-[var(--text-on-dark)]"
                    : "bg-white/5 text-[var(--text-on-dark)] border border-white/10"
                }`}
              >
                {plan.popular && (
                  <span className="text-[10px] uppercase tracking-[var(--ls-widest)] text-white/70 block mb-2">
                    Популярный
                  </span>
                )}
                <p
                  className="text-lg mb-1"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {plan.name}
                </p>
                <p className="text-xl font-medium mb-1">{plan.price}</p>
                <p className="text-xs opacity-70">{plan.freq}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
