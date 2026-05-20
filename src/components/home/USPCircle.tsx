"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Globe, Camera, Truck, Coffee, Gift } from "lucide-react";
import { fadeUpVariant, staggerContainer } from "@/lib/animations";
import { siteConfig } from "@/lib/siteConfig";
import { formatPrice } from "@/lib/utils";

const usps = [
  {
    icon: Globe,
    title: "Цветы из разных стран",
    desc: "Нидерланды, Эквадор, Колумбия, Израиль",
  },
  {
    icon: Camera,
    title: "Фото перед отправкой",
    desc: "Всегда согласуем букет до доставки",
  },
  {
    icon: Truck,
    title: "Доставка день-в-день",
    desc: "По Новороссийску, Геленджику и Анапе",
  },
  {
    icon: Coffee,
    title: "Букет + кофе + подарок",
    desc: "Всё в одном заказе с доставкой",
  },
  {
    icon: Gift,
    title: "Бесплатная доставка",
    desc: "",
  },
];

function descriptionFor(usp: (typeof usps)[number]): string {
  if (usp.title === "Бесплатная доставка") {
    return `При заказе от ${formatPrice(siteConfig.minOrderFreeDelivery)}`;
  }
  return usp.desc;
}

export default function USPCircle() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

  return (
    <section
      ref={sectionRef}
      className="py-24 overflow-hidden bg-[var(--bg-secondary)]"
    >
      <div className="container mx-auto">
        <div className="hidden lg:block relative h-[560px]">
          <motion.div
            style={{ rotate }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="absolute rounded-full border border-dashed border-[var(--color-cherry)]/40"
              style={{ width: 520, height: 520 }}
            />
          </motion.div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-[var(--color-cherry)]/10 flex items-center justify-center border border-[var(--color-cherry)]/30">
              <span
                className="text-3xl italic text-[var(--color-cherry)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                P
              </span>
            </div>
          </div>

          {usps.map((usp, i) => {
            const angle = (i / usps.length) * 2 * Math.PI - Math.PI / 2;
            const r = 240;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;

            return (
              <motion.div
                key={usp.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="absolute w-40 text-center"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                <div className="w-12 h-12 rounded-full bg-[var(--bg-card)] shadow-sm flex items-center justify-center mx-auto mb-3">
                  <usp.icon size={20} className="text-[var(--color-cherry)]" />
                </div>
                <p
                  className="text-sm font-medium text-[var(--text-primary)] leading-tight mb-1"
                  style={{ fontFamily: "var(--font-serif)", fontSize: "1rem" }}
                >
                  {usp.title}
                </p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {descriptionFor(usp)}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="lg:hidden space-y-6"
        >
          <motion.div variants={fadeUpVariant} className="text-center mb-8">
            <h2
              className="mb-2 text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Почему Paloma
            </h2>
          </motion.div>

          {usps.map((usp) => (
            <motion.div
              key={usp.title}
              variants={fadeUpVariant}
              className="flex items-start gap-4 bg-[var(--bg-card)] rounded-lg p-5 shadow-sm border border-[var(--border)]"
            >
              <div className="w-11 h-11 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                <usp.icon size={20} className="text-[var(--color-cherry)]" />
              </div>
              <div>
                <p
                  className="font-medium text-[var(--text-primary)] mb-1"
                  style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem" }}
                >
                  {usp.title}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">{descriptionFor(usp)}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
