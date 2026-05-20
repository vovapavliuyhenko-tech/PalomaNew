import type { SupabaseClient } from "@supabase/supabase-js";

export const COFFEE_MENU_CATEGORY_SLUGS = ["kofe", "vypechka"] as const;

export type CoffeeCatalogPickRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  category_slug: string | null;
};

function parsePrice(raw: unknown): number {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/** Список товаров кофейного каталога для привязки к `cafe_items` (любые `is_available`). Только сервис-клиент. */
export async function fetchCoffeeCategoryProductsForPicker(sb: SupabaseClient): Promise<CoffeeCatalogPickRow[]> {
  const { data: cats } = await sb.from("categories").select("id, slug").in("slug", [...COFFEE_MENU_CATEGORY_SLUGS]);
  if (!cats?.length) return [];

  const catIds = cats.map((c) => String(c.id));
  const slugByCatId = new Map(cats.map((c) => [String(c.id), String(c.slug)]));

  const { data: products, error } = await sb
    .from("products")
    .select("id,name,slug,price,category_id")
    .in("category_id", catIds)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !products) return [];

  return products.map((p) => ({
    id: String(p.id),
    name: String(p.name ?? ""),
    slug: String(p.slug ?? ""),
    price: parsePrice(p.price),
    category_slug: p.category_id != null ? slugByCatId.get(String(p.category_id)) ?? null : null,
  }));
}
