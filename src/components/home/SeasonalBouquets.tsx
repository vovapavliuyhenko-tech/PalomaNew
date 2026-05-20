"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpVariant, staggerContainer } from "@/lib/animations";
import { getSeasonalProducts } from "@/data/mockProducts";
import ProductCard from "@/components/catalog/ProductCard";

export default function SeasonalBouquets() {
  const products = getSeasonalProducts().slice(0, 4);

  return (
    <section className="py-20 bg-[var(--bg-card)]">
      <div className="container mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-12"
        >
          <motion.p
            variants={fadeUpVariant}
            className="text-[var(--color-cherry)] text-xs uppercase tracking-[var(--ls-widest)] mb-3"
          >
            Сейчас в сезоне
          </motion.p>
          <motion.h2
            variants={fadeUpVariant}
            className="text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Самый сезон
          </motion.h2>
          <motion.p
            variants={fadeUpVariant}
            className="text-[var(--text-secondary)] mt-4 max-w-lg mx-auto text-sm"
          >
            Свежие цветы, которые сейчас в наличии. Обновляем ассортимент каждую неделю.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="catalog-product-grid"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={fadeUpVariant} className="flex min-h-0 min-w-0">
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/catalog/seasonal" className="btn-secondary">
            Смотреть все сезонные букеты
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
