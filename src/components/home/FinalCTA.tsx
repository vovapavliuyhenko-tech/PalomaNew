"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpVariant, staggerContainer } from "@/lib/animations";
import { MapPin, Clock, Phone, Send, AtSign } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

export default function FinalCTA() {
  return (
    <section className="py-20 md:py-24 bg-[color-mix(in_srgb,var(--color-sand)_55%,var(--bg-page))] border-t border-[var(--line-subtle)]">
      <div className="container mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-10 md:mb-12"
        >
          <motion.p
            variants={fadeUpVariant}
            className="text-[var(--color-cherry)] text-xs uppercase tracking-[var(--ls-widest)] mb-3"
          >
            Контакты
          </motion.p>
          <motion.h2
            variants={fadeUpVariant}
            className="text-[var(--text-primary)] mb-3"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            PALOMA · {siteConfig.city}
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Адрес цветочного пространства и кофейни, часы работы и быстрые каналы связи — всё на странице контактов.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10"
        >
          <motion.a
            variants={fadeUpVariant}
            href={siteConfig.maps}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 rounded-[var(--radius-md)] bg-[var(--bg-card)] p-5 outline outline-1 outline-[var(--line-subtle)] transition-shadow hover:shadow-[var(--elev-lift-soft)]"
          >
            <MapPin className="shrink-0 text-[var(--color-cherry)]" size={22} aria-hidden />
            <div>
              <p className="text-xs uppercase tracking-[var(--ls-wider)] text-[var(--text-secondary)] mb-1">Адрес</p>
              <p className="text-sm text-[var(--text-primary)] leading-snug">{siteConfig.address}</p>
            </div>
          </motion.a>

          <motion.div
            variants={fadeUpVariant}
            className="flex gap-3 rounded-[var(--radius-md)] bg-[var(--bg-card)] p-5 outline outline-1 outline-[var(--line-subtle)]"
          >
            <Clock className="shrink-0 text-[var(--color-cherry)]" size={22} aria-hidden />
            <div>
              <p className="text-xs uppercase tracking-[var(--ls-wider)] text-[var(--text-secondary)] mb-1">Часы</p>
              <p className="text-sm text-[var(--text-primary)] leading-snug">{siteConfig.workingHours}</p>
            </div>
          </motion.div>

          <motion.a
            variants={fadeUpVariant}
            href={`tel:${siteConfig.phoneTel}`}
            className="flex gap-3 rounded-[var(--radius-md)] bg-[var(--bg-card)] p-5 outline outline-1 outline-[var(--line-subtle)] transition-shadow hover:shadow-[var(--elev-lift-soft)] sm:col-span-2 lg:col-span-1"
          >
            <Phone className="shrink-0 text-[var(--color-cherry)]" size={22} aria-hidden />
            <div>
              <p className="text-xs uppercase tracking-[var(--ls-wider)] text-[var(--text-secondary)] mb-1">Телефон</p>
              <p className="text-sm text-[var(--text-primary)]">{siteConfig.phone}</p>
            </div>
          </motion.a>

          <motion.a
            variants={fadeUpVariant}
            href={siteConfig.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 rounded-[var(--radius-md)] bg-[var(--bg-card)] p-5 outline outline-1 outline-[var(--line-subtle)] transition-shadow hover:shadow-[var(--elev-lift-soft)]"
          >
            <Send className="shrink-0 text-[var(--color-cherry)]" size={22} aria-hidden />
            <div>
              <p className="text-xs uppercase tracking-[var(--ls-wider)] text-[var(--text-secondary)] mb-1">Telegram</p>
              <p className="text-sm text-[var(--text-primary)]">Написать в Telegram</p>
            </div>
          </motion.a>

          <motion.a
            variants={fadeUpVariant}
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 rounded-[var(--radius-md)] bg-[var(--bg-card)] p-5 outline outline-1 outline-[var(--line-subtle)] transition-shadow hover:shadow-[var(--elev-lift-soft)] sm:col-span-2 lg:col-span-1"
          >
            <AtSign className="shrink-0 text-[var(--color-cherry)]" size={22} aria-hidden />
            <div>
              <p className="text-xs uppercase tracking-[var(--ls-wider)] text-[var(--text-secondary)] mb-1">Instagram</p>
              <p className="text-sm text-[var(--text-primary)]">{siteConfig.instagramHandle}</p>
            </div>
          </motion.a>
        </motion.div>

        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Link href="/contacts" className="btn-primary inline-flex">
            Полная страница контактов
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
