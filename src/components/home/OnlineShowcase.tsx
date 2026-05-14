"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUpVariant, staggerContainer } from "@/lib/animations";
import ProductCard from "@/components/catalog/ProductCard";
import { getFlowerShopProducts, getMinPrice } from "@/data/mockProducts";

type PriceTab = "all" | "to5" | "5to8" | "8to12" | "from12";

const tabs: { id: PriceTab; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "to5", label: "до 5 000 ₽" },
  { id: "5to8", label: "5 000–8 000 ₽" },
  { id: "8to12", label: "8 000–12 000 ₽" },
  { id: "from12", label: "от 12 000 ₽" },
];

function filterByPriceTab(minPrice: number, tab: PriceTab): boolean {
  switch (tab) {
    case "all":
      return true;
    case "to5":
      return minPrice <= 5000;
    case "5to8":
      return minPrice > 5000 && minPrice <= 8000;
    case "8to12":
      return minPrice > 8000 && minPrice <= 12000;
    case "from12":
      return minPrice > 12000;
    default:
      return true;
  }
}

export default function OnlineShowcase() {
  const [tab, setTab] = useState<PriceTab>("all");
  const pool = getFlowerShopProducts();

  const displayed = useMemo(() => {
    const filtered = pool
      .filter((p) => filterByPriceTab(getMinPrice(p), tab))
      .sort((a, b) => {
        if (a.isBestseller !== b.isBestseller) return a.isBestseller ? -1 : 1;
        return getMinPrice(a) - getMinPrice(b);
      });
    return filtered;
  }, [pool, tab]);

  const gridItems = displayed.slice(0, 8);
  const mobileSlice = displayed.slice(0, 6);

  return (
    <section
      className="py-14 lg:py-20 bg-[var(--bg-card)]"
      id="online-showcase"
    >
      <div className="container mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-3xl mb-10"
        >
          <motion.p
            variants={fadeUpVariant}
            className="text-[var(--color-cherry)] text-xs uppercase tracking-[var(--ls-widest)] mb-3"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Онлайн-витрина
          </motion.p>
          <motion.h2
            variants={fadeUpVariant}
            className="text-[var(--text-primary)] mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Букеты, которые уже собраны сегодня
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="text-[var(--text-secondary)] text-sm leading-relaxed mb-2">
            В онлайн-витрине вы видите букеты, которые доступны прямо сейчас. Выберите вариант,
            укажите дату, адрес и оплатите заказ онлайн.
          </motion.p>
        </motion.div>

        <div className="catalog-category-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`catalog-category-tab${tab === t.id ? " catalog-category-tab--active" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {gridItems.length === 0 ? (
          <p className="text-center text-[var(--text-secondary)] py-16 text-sm">
            Ничего не найдено в этом диапазоне. Попробуйте другой фильтр или{" "}
            <Link href="/catalog" className="text-[var(--color-cherry)] underline underline-offset-2">
              сбросьте выбор
            </Link>
            .
          </p>
        ) : (
          <>
            <div className="catalog-product-grid lg:hidden">
              {mobileSlice.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="catalog-product-grid hidden lg:grid">
              {gridItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/catalog"
            className="btn-primary inline-flex"
          >
            Смотреть всю онлайн-витрину
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
