import type { MockProduct } from "@/data/mockProducts";
import { getFlowerShopProducts } from "@/data/mockProducts";
import { dbProductToMock } from "@/lib/catalog/mapDbToMock";
import { fetchDbProducts } from "@/lib/supabase/catalog";
import { hasSupabaseEnv } from "@/lib/supabase/config";

function fallbackReadyProducts(): MockProduct[] {
  const pool = getFlowerShopProducts().filter((p) => p.inStock);
  const byBestseller = [...pool].sort((a, b) =>
    a.isBestseller === b.isBestseller ? 0 : a.isBestseller ? -1 : 1
  );
  return byBestseller.slice(0, 6);
}

/** Товары с флагом is_ready_today из Supabase или fallback на mock. */
export async function getReadyTodayProductsForHome(): Promise<MockProduct[]> {
  if (!hasSupabaseEnv()) return fallbackReadyProducts();
  try {
    const { data, error } = await fetchDbProducts({ readyToday: true });
    if (error || !data?.length) return fallbackReadyProducts();
    return data.slice(0, 6).map(dbProductToMock);
  } catch {
    return fallbackReadyProducts();
  }
}
