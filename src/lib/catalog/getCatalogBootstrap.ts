import type { MockProduct } from "@/data/mockProducts";
import { mockProducts } from "@/data/mockProducts";
import { dbProductToMock } from "@/lib/catalog/mapDbToMock";
import { PRD_CATALOG_CATEGORY_OPTIONS } from "@/lib/catalog/catalogFilterOptions";
import { fetchDbCategories, fetchDbProducts } from "@/lib/supabase/catalog";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export type CatalogFilterMode = "legacy" | "slug";

export type CatalogBootstrap = {
  products: MockProduct[];
  categoryOptions: Array<{ value: string; label: string }>;
  filterMode: CatalogFilterMode;
  showSizeFilter: boolean;
};

function legacyFallback(): CatalogBootstrap {
  return {
    products: mockProducts.filter((p) => p.inStock),
    categoryOptions: [...PRD_CATALOG_CATEGORY_OPTIONS],
    filterMode: "legacy",
    showSizeFilter: true,
  };
}

/** Список для каталога: Supabase при наличии env и успешном ответе, иначе mock. */
export async function getCatalogBootstrap(): Promise<CatalogBootstrap> {
  if (!hasSupabaseEnv()) return legacyFallback();

  try {
    const [{ data: prods, error: pErr }, { data: cats, error: cErr }] = await Promise.all([
      fetchDbProducts(),
      fetchDbCategories(),
    ]);

    if (pErr || !prods?.length) return legacyFallback();
    const categoryOptions =
      !cErr && cats?.length
        ? [{ value: "", label: "Все" }, ...cats.map((c) => ({ value: c.slug, label: c.name }))]
        : [{ value: "", label: "Все" }];

    return {
      products: prods.map(dbProductToMock),
      categoryOptions,
      filterMode: "slug",
      showSizeFilter: false,
    };
  } catch {
    return legacyFallback();
  }
}

/** Пути для `generateStaticParams` — при рабочей БД только её slug’и, иначе mock. */
export async function getCatalogStaticSlugParams(): Promise<{ slug: string }[]> {
  const inStockMock = mockProducts.filter((p) => p.inStock);
  if (!hasSupabaseEnv()) return inStockMock.map((p) => ({ slug: p.slug }));

  try {
    const { data, error } = await fetchDbProducts();
    if (error || !data?.length) return inStockMock.map((p) => ({ slug: p.slug }));
    return data.map((p) => ({ slug: p.slug }));
  } catch {
    return inStockMock.map((p) => ({ slug: p.slug }));
  }
}
