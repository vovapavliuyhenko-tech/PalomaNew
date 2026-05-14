"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { analytics } from "@/lib/analytics";
import type { MockProduct } from "@/data/mockProducts";
import type { CatalogFilterMode } from "@/lib/catalog/getCatalogBootstrap";
import { productMatchesCategorySegment } from "@/lib/catalog/prdCategoryFilter";
import CatalogCategoryTabs from "@/components/catalog/CatalogCategoryTabs";
import ProductFilters from "@/components/catalog/ProductFilters";
import ProductGrid from "@/components/catalog/ProductGrid";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface Props {
  initialProducts: MockProduct[];
  categoryOptions: Array<{ value: string; label: string }>;
  filterMode: CatalogFilterMode;
  showSizeFilter: boolean;
  /** Сегмент `/catalog/[slug]` когда страница — раздел каталога */
  pathCategorySlug?: string;
}

export default function CatalogContent({
  initialProducts,
  categoryOptions,
  filterMode,
  showSizeFilter,
  pathCategorySlug = "",
}: Props) {
  const searchParams = useSearchParams();
  useEffect(() => {
    analytics.viewCatalog();
  }, []);

  const category = (pathCategorySlug || searchParams.get("category") || "").trim();
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const sizes = searchParams.getAll("size");
  const maxPrice = Number(searchParams.get("max") || 30000);

  const filtered = initialProducts.filter((p) => {
    if (!p.inStock) return false;
    if (category) {
      if (!productMatchesCategorySegment(p, category, filterMode)) return false;
    }
    if (q) {
      const hay = `${p.title} ${p.description} ${p.composition}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (showSizeFilter && sizes.length > 0) {
      const productSizes = p.sizes.map((s) => s.size);
      if (!sizes.some((s) => productSizes.includes(s))) return false;
    }
    if (p.price > maxPrice) return false;
    return true;
  });

  return (
    <ScrollReveal>
    <div className="container mx-auto w-full max-w-[var(--container-max)] py-[var(--space-md)] md:py-[var(--space-lg)] md:pb-[var(--space-xl)]">
      <CatalogCategoryTabs categoryOptions={categoryOptions} />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <ProductFilters categoryOptions={categoryOptions} showSizeFilter={showSizeFilter} />
        <div className="min-w-0 flex-1">
          <p
            className="font-accent mb-6 text-xs uppercase tracking-[var(--ls-wider)] text-[var(--text-secondary)]"
          >
            {filtered.length === 0
              ? "Нет позиций по выбранным фильтрам"
              : `Показано: ${filtered.length}`}
          </p>
          <ProductGrid products={filtered} />
        </div>
      </div>
    </div>
    </ScrollReveal>
  );
}
