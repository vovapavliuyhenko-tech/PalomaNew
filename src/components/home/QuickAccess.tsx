"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flower2, Heart, Flower, PartyPopper, Coffee, Gift } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { fadeUpVariant, staggerContainer } from "@/lib/animations";

const cards: readonly { title: string; href: string; hint: string; Icon: LucideIcon }[] = [
  { title: "Букеты", href: "/catalog", hint: "Онлайн-витрина", Icon: Flower2 },
  { title: "Цветочная подписка", href: "/subscription", hint: "Свежие цветы регулярно", Icon: Heart },
  { title: "Свадебная флористика", href: "/wedding", hint: "Под ключ", Icon: Flower },
  { title: "Мероприятия", href: "/events", hint: "Корпоративы и праздники", Icon: PartyPopper },
  { title: "PALOMA café", href: "/coffee", hint: "Кофе и выпечка", Icon: Coffee },
  { title: "Вазы и подарки", href: "/gifts", hint: "К букету и отдельно", Icon: Gift },
] as const;

export default function QuickAccess() {
  return (
    <section id="quick-access" className="border-y border-[var(--border)] bg-[var(--color-bg-shell)] py-12 lg:py-16">
      <div className="container mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-10 max-w-xl"
        >
          <motion.p
            variants={fadeUpVariant}
            className="mb-3 text-[10px] uppercase tracking-[var(--ls-widest)] text-[var(--color-accent-primary)]"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Быстрый вход
          </motion.p>
          <motion.h2
            variants={fadeUpVariant}
            className="text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Куда дальше
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            PALOMA flowers coffee you — цветы, кофе и забота в одном месте.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-2 gap-3 md:gap-px md:bg-[var(--border)] lg:grid-cols-6"
        >
          {cards.map(({ title, href, hint, Icon }) => (
            <motion.div key={href} variants={fadeUpVariant} className="md:bg-[var(--bg-card)]">
              <Link
                href={href}
                className="group flex min-h-[150px] flex-col justify-between border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-colors hover:border-[var(--color-accent-primary)]/35 hover:bg-[var(--bg-secondary)] md:border-0 lg:min-h-[180px]"
              >
                <Icon className="h-8 w-8 text-[var(--color-accent-primary)] opacity-85" strokeWidth={1.25} aria-hidden />
                <div>
                  <span
                    className="mb-2 block text-[10px] uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)] transition-colors group-hover:text-[var(--paloma-orange)]"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    {hint}
                  </span>
                  <span className="text-base leading-snug text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
                    {title}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
