"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ProductCard from "@/components/catalog/ProductCard";
import type { MockProduct } from "@/data/mockProducts";
import { fadeUpVariant, staggerContainer } from "@/lib/animations";

type Props = { initialProducts: MockProduct[] };

export default function ReadyTodayGrid({ initialProducts }: Props) {
  return (
    <section id="ready-today" className="bg-[var(--bg-card)] py-14 lg:py-20">
      <div className="container mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-10 max-w-3xl"
        >
          <motion.p
            variants={fadeUpVariant}
            className="mb-3 text-[10px] uppercase tracking-[var(--ls-widest)] text-[var(--color-cherry)]"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Сегодня в студии
          </motion.p>
          <motion.h2 variants={fadeUpVariant} className="text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
            Готовые сегодня
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            Свежие сезонные цветы — можно забрать или оформить доставку день в день. Мы покажем букет перед отправкой.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="catalog-product-grid"
        >
          {initialProducts.map((product) => (
            <motion.div key={product.id} variants={fadeUpVariant} className="flex min-h-0 min-w-0">
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-10 flex justify-center">
          <Link href="/catalog" className="btn-secondary">
            Смотреть всё в каталоге
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
