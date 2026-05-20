import { PRD_CATEGORIES, getPrdCategoryBySlug } from "@/data/categories";
import type { MockProduct } from "@/data/mockProducts";
import type { CatalogFilterMode } from "@/lib/catalog/getCatalogBootstrap";

const MOCK_CATEGORY_VALUES = [
  "seasonal",
  "bestsellers",
  "compositions",
  "mono",
  "wedding",
  "vases",
  "subscription",
  "events",
  "certificates",
  "coffee",
] as const satisfies readonly MockProduct["category"][];

const MOCK_CATEGORY_SET = new Set<string>(MOCK_CATEGORY_VALUES);

/** Легаси значения `?category=` → slug PRD для фильтрации. */
export const LEGACY_QUERY_TO_PRD: Record<string, string> = {
  bestsellers: "bukety",
  seasonal: "seasonal",
  compositions: "kompozicii",
  mono: "mono",
  wedding: "wedding-bouquets",
  vases: "vazy-i-podarki",
  coffee: "coffee-desserts",
};

/** Подстраницы и синонимы из старых URL → slug PRD. */
export const EXTENDED_SEGMENT_TO_PRD: Record<string, string> = {
  segodnya: "online-vitrina",
  monobuket: "mono",
  bukety: "bukety",
  vazy: "vazy-i-podarki",
  kofe: "coffee-desserts",
  vypechka: "coffee-desserts",
  otkritki: "vazy-i-podarki",
  piony: "seasonal",
  rozy: "seasonal",
  sezonnie: "seasonal",
  "v-korobke": "kompozicii",
};

const LEGACY_MOCK_CATEGORY_TO_PRD: Record<MockProduct["category"], string> = {
  seasonal: "seasonal",
  bestsellers: "bukety",
  compositions: "kompozicii",
  mono: "mono",
  wedding: "wedding-bouquets",
  vases: "vazy-i-podarki",
  coffee: "coffee-desserts",
  subscription: "seasonal",
  events: "event-decor",
  certificates: "gift-cards",
};

export type NormalizedCatalogFilter =
  | { kind: "prd"; slug: string }
  | { kind: "mock"; category: MockProduct["category"] };

export function normalizeCatalogSegment(raw: string): NormalizedCatalogFilter | null {
  if (!raw) return null;
  if (raw in LEGACY_QUERY_TO_PRD) return { kind: "prd", slug: LEGACY_QUERY_TO_PRD[raw] };
  if (getPrdCategoryBySlug(raw)) return { kind: "prd", slug: raw };
  if (raw in EXTENDED_SEGMENT_TO_PRD) return { kind: "prd", slug: EXTENDED_SEGMENT_TO_PRD[raw] };
  if (MOCK_CATEGORY_SET.has(raw)) return { kind: "mock", category: raw as MockProduct["category"] };
  return null;
}

export function isCatalogCategorySegment(segment: string): boolean {
  return normalizeCatalogSegment(segment) !== null;
}

function getPrdSlugForProduct(p: MockProduct): string {
  if (p.catalogCategorySlug) return p.catalogCategorySlug;
  return LEGACY_MOCK_CATEGORY_TO_PRD[p.category];
}

export function productMatchesPrdSlug(p: MockProduct, prdSlug: string): boolean {
  if (prdSlug === "online-vitrina") return p.isBestseller === true && p.inStock;
  return getPrdSlugForProduct(p) === prdSlug;
}

export function productMatchesCategorySegment(
  p: MockProduct,
  segment: string,
  filterMode: CatalogFilterMode,
): boolean {
  if (filterMode === "slug" && p.catalogCategorySlug && p.catalogCategorySlug === segment) return true;

  const n = normalizeCatalogSegment(segment);
  if (!n) return false;
  if (n.kind === "mock") return p.category === n.category;
  return productMatchesPrdSlug(p, n.slug);
}

/** Slug’и категорий для `generateStaticParams` (PRD + легаси/синонимы). */
export function getCatalogCategorySegmentsForStatic(): string[] {
  const s = new Set<string>();
  for (const c of PRD_CATEGORIES) s.add(c.slug);
  for (const k of Object.keys(LEGACY_QUERY_TO_PRD)) s.add(k);
  for (const k of Object.keys(EXTENDED_SEGMENT_TO_PRD)) s.add(k);
  for (const k of MOCK_CATEGORY_VALUES) s.add(k);
  return [...s];
}
