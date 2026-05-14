"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { fadeUpVariant, staggerContainer } from "@/lib/animations";

const weddingSlides = [
  { src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=85", alt: "Свадьба PALOMA" },
];
const eventsSlides = [
  { src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=85", alt: "Украшение мероприятий" },
];

function Half({
  eyebrow,
  title,
  text,
  href,
  ctaLabel,
  images,
}: {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  ctaLabel: string;
  images: { src: string; alt: string }[];
}) {
  return (
    <motion.div variants={fadeUpVariant} className="grid md:grid-cols-5 gap-6 md:gap-8 items-start">
      <div className="md:col-span-2 pt-3">
        <p className="text-[var(--color-cherry)] text-xs uppercase tracking-[var(--ls-widest)] mb-3">{eyebrow}</p>
        <h3 className="text-[var(--text-primary)] mb-4 font-serif-display text-3xl">{title}</h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{text}</p>
        <Link href={href} className="btn-outline">
          {ctaLabel}
        </Link>
      </div>

      <div className="md:col-span-3 relative rounded-[var(--radius-lg)] shadow-[var(--elev-lift)] bg-[color-mix(in_srgb,var(--color-sand)_35%,transparent)] outline outline-1 outline-[var(--line-subtle)] p-6">
        <div className="grid grid-cols-1 gap-3">
          {images.map((slide) => (
            <div key={slide.src} className="aspect-[16/10] rounded-[var(--radius-md)] outline outline-[var(--line-subtle)] overflow-hidden relative shadow-[var(--elev-lift-soft)] bg-[color-mix(in_srgb,var(--color-sand)_45%,transparent)]">
              <Image src={slide.src} alt={slide.alt} fill className="object-cover" sizes="(min-width: 768px) 45vw, 100vw" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function WeddingGallery() {
  return (
    <section className="relative py-[var(--section-y)] gradient-glow">
      <div className="container mx-auto relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-14"
        >
          <motion.p variants={fadeUpVariant} className="text-[var(--color-cherry)] text-xs uppercase tracking-[var(--ls-widest)] mb-3">
            Пространство и торжества
          </motion.p>
          <motion.h2 variants={fadeUpVariant} className="text-[var(--text-primary)] mb-4 font-serif-display text-[var(--fluid-h2)]">
            Свадьбы · События
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="text-[var(--text-secondary)] max-w-xl text-sm md:text-[var(--fluid-body)] leading-relaxed">
            Две отдельные линии: сопровождение свадебной эстетики и украшение мероприятий любого масштаба.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col gap-20 md:gap-24"
        >
          <Half
            eyebrow="Свадьбы в PALOMA"
            title="Свадебное оформление"
            text="Стиль торжества, цветочные арки, букеты для пары и гостей — от концепта до сборки на площадке."
            href="/weddings"
            ctaLabel="Обсудить свадебную концепцию"
            images={weddingSlides}
          />
          <Half
            eyebrow="События"
            title="Декорации мероприятий"
            text="Йога-ретриты, вечерние мероприятия у моря или в горах — оформляем живыми материалами и светом сезона."
            href="/decor"
            ctaLabel="Обсудить событие"
            images={eventsSlides}
          />
        </motion.div>
      </div>
    </section>
  );
}
