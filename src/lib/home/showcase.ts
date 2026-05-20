import type { MockProduct } from "@/data/mockProducts";
import type { PrdProduct } from "@/types/prd";
import { prdCatalogSeed } from "@/data/prdCatalogSeed";

const PRD_CAT_TO_MOCK: Record<string, MockProduct["category"]> = {
  bukety: "bestsellers",
  kompozicii: "compositions",
  mono: "mono",
  "online-vitrina": "bestsellers",
  "vazy-i-podarki": "vases",
  "coffee-desserts": "coffee",
  "wedding-bouquets": "wedding",
  "event-decor": "events",
  "gift-cards": "certificates",
  "gift-baskets": "vases",
  "indoor-plants": "seasonal",
  "dried-flowers": "seasonal",
  premium: "compositions",
  corporate: "events",
  seasonal: "seasonal",
};

export function prdProductToMockProduct(p: PrdProduct): MockProduct {
  const cat = PRD_CAT_TO_MOCK[p.category] ?? "bestsellers";
  const sizeLabel = p.size?.toString() ?? "M";
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    catalogCategorySlug: p.category,
    category: cat,
    price: p.price,
    sizes: [
      { size: "S", price: Math.round(p.price * 0.65) },
      { size: sizeLabel, price: p.price },
      { size: "L", price: Math.round(p.price * 1.35) },
    ],
    composition: p.composition ?? p.description.slice(0, 120),
    origin: "Премиум-срез",
    description: p.description,
    images: p.images.length ? p.images : ["/images/placeholders/product-3x4.svg"],
    inStock: p.isAvailable,
    isBestseller: p.isBestseller ?? false,
    isSeasonal: p.isSeasonal ?? false,
    relatedProductIds: [],
    upsellProductIds: [],
  };
}

/** До полной синхронизации с БД — витрина главной из PRD-seed. */
export function getHomeShowcaseProducts(): MockProduct[] {
  const flagged = prdCatalogSeed.filter((p) => p.isOnlineShowcase).map(prdProductToMockProduct);
  if (flagged.length >= 8) return flagged.slice(0, 8);
  const rest = prdCatalogSeed
    .filter((p) => !p.isOnlineShowcase && p.isAvailable)
    .map(prdProductToMockProduct);
  const merged = [...flagged];
  for (const m of rest) {
    if (merged.length >= 8) break;
    if (!merged.some((x) => x.id === m.id)) merged.push(m);
  }
  return merged.slice(0, 8);
}
