"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUpVariant } from "@/lib/animations";
import { MockProduct } from "@/data/mockProducts";
import ProductCard from "./ProductCard";
import Link from "next/link";

interface ProductGridProps {
  products: MockProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <div
          className="font-accent mb-6 h-px w-14 bg-[color-mix(in_srgb,var(--paloma-orange)_32%,transparent)]"
          aria-hidden
        />
        <h3 className="mb-3 text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          Ничего не найдено
        </h3>
        <p className="font-accent mb-8 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
          Попробуйте изменить или сбросить фильтры
        </p>
        <Link href="/catalog" className="btn-secondary text-sm">
          Сбросить фильтры
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="catalog-product-grid flex-1"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={fadeUpVariant} className="flex min-h-0 h-full min-w-0">
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
