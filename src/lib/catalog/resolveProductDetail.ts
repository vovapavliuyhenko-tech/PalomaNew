import type { DbProduct } from "@/types/db";
import type { MockProduct } from "@/data/mockProducts";
import { getProductBySlug, getRelatedProducts, getUpsellProducts } from "@/data/mockProducts";
import { dbProductToMock } from "@/lib/catalog/mapDbToMock";
import { fetchDbProductBySlug, fetchDbProducts } from "@/lib/supabase/catalog";
import { hasSupabaseEnv } from "@/lib/supabase/config";

async function relatedFromDb(current: DbProduct): Promise<MockProduct[]> {
  const cat = current.category_slug;
  let pool = (await fetchDbProducts(cat ? { categorySlug: cat } : undefined)).data ?? [];

  let others = pool.filter((p) => p.id !== current.id);
  if (!others.length) {
    pool = (await fetchDbProducts()).data ?? [];
    others = pool.filter((p) => p.id !== current.id);
  }

  const seen = new Set<string>();
  const out: DbProduct[] = [];
  for (const p of others) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length >= 8) break;
  }
  return out.slice(0, 4).map(dbProductToMock);
}

async function upsellFromDb(productId: string): Promise<MockProduct[]> {
  const vases = (await fetchDbProducts({ categorySlug: "vazy" })).data ?? [];
  const drinks = (await fetchDbProducts({ categorySlug: "kofe" })).data ?? [];
  const mixed = [...vases, ...drinks].filter((p) => p.id !== productId);
  const seen = new Set<string>();
  const unique: DbProduct[] = [];
  for (const p of mixed) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    unique.push(p);
    if (unique.length >= 6) break;
  }
  return unique.slice(0, 4).map(dbProductToMock);
}

export async function resolveProductDetail(
  slug: string
): Promise<{ product: MockProduct; related: MockProduct[]; upsell: MockProduct[] } | null> {
  const mockFallback = (): { product: MockProduct; related: MockProduct[]; upsell: MockProduct[] } | null => {
    const product = getProductBySlug(slug);
    if (!product || !product.inStock) return null;
    return {
      product,
      related: getRelatedProducts(product.id),
      upsell: getUpsellProducts(product.id),
    };
  };

  if (!hasSupabaseEnv()) return mockFallback();

  try {
    const { data: db, error } = await fetchDbProductBySlug(slug);
    if (!error && db) {
      return {
        product: dbProductToMock(db),
        related: await relatedFromDb(db),
        upsell: await upsellFromDb(db.id),
      };
    }
  } catch {
    /* fall through */
  }

  return mockFallback();
}
