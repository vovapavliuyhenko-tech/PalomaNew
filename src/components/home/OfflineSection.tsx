"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpVariant, staggerContainer } from "@/lib/animations";
import { MapPin, Clock, Coffee } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

export default function OfflineSection() {
  return (
    <section className="py-20 bg-[var(--bg-card)]">
      <div className="container mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          <motion.div variants={fadeUpVariant}>
            <div className="relative aspect-[4/5] rounded-[var(--radius-small)] overflow-hidden mb-8">
              <Image
                src="https://images.unsplash.com/photo-1487530811015-780780169993?w=800&q=80"
                alt="Магазин Paloma Flowers"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-[var(--color-cherry)] text-xs uppercase tracking-[var(--ls-widest)] mb-3">
              Магазин
            </p>
            <h3 className="mb-4 text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
              Приходите выбирать лично
            </h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-5">
              Наш магазин — это не просто цветочный бутик. Здесь каждый букет создаётся
              руками флориста прямо при вас. Вы можете выбрать цветы из нашей свежей
              поставки и заказать индивидуальный букет.
            </p>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <MapPin size={15} className="text-[var(--color-cherry)] flex-shrink-0" />
                {siteConfig.address}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Clock size={15} className="text-[var(--color-cherry)] flex-shrink-0" />
                {siteConfig.workingHours}
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUpVariant}>
            <div className="relative aspect-[4/5] rounded-[var(--radius-small)] overflow-hidden mb-8">
              <Image
                src="https://images.unsplash.com/photo-1534687941688-651ccaafbff8?w=800&q=80"
                alt="Кофейня Paloma"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-[var(--color-cherry)] text-xs uppercase tracking-[var(--ls-widest)] mb-3">
              Кофейня
            </p>
            <h3 className="mb-4 text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
              Кофе среди цветов
            </h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-5">
              В нашей уютной кофейне можно насладиться свежесваренным кофе, авторскими
              напитками и выпечкой. А потом добавить кофе к своему заказу цветов —
              доставим всё вместе.
            </p>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-5">
              <Coffee size={15} className="text-[var(--color-cherry)] flex-shrink-0" />
              Кофе, матча, какао, круассаны, десерты
            </div>
            <Link href="/coffee" className="btn-secondary text-sm">
              Меню кофейни
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
