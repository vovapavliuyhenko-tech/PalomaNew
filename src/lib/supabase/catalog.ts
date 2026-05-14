import type { DbCategory, DbProduct, DbProductImage } from "@/types/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function parsePrice(raw: unknown): number {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

type ProductRow = {
  id: string;
  category_id: string | null;
  categories?: { slug: string } | null;
  name: string;
  slug: string;
  description: string | null;
  price: unknown;
  composition: string | null;
  care_instructions: string | null;
  delivery_info: string | null;
  is_available: boolean;
  is_ready_today: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  product_images?: DbProductImage[] | null;
};

function mapProduct(row: ProductRow): DbProduct {
  const images = row.product_images
    ? [...row.product_images].sort((a, b) => a.display_order - b.display_order || a.created_at.localeCompare(b.created_at))
    : [];

  return {
    id: row.id,
    category_id: row.category_id,
    category_slug: row.categories?.slug ?? null,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: parsePrice(row.price),
    composition: row.composition,
    care_instructions: row.care_instructions,
    delivery_info: row.delivery_info,
    is_available: row.is_available,
    is_ready_today: row.is_ready_today,
    display_order: row.display_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
    product_images: images,
  };
}

export async function fetchDbProducts(filters?: {
  categorySlug?: string;
  readyToday?: boolean;
}): Promise<{ data: DbProduct[]; error: string | null }> {
  const supabase = await createSupabaseServerClient();

  let catId: string | null | undefined;

  if (filters?.categorySlug) {
    const { data: cat, error } = await supabase.from("categories").select("id").eq("slug", filters.categorySlug).maybeSingle();
    if (error) return { data: [], error: error.message };
    if (!cat) return { data: [], error: null };
    catId = cat.id;
  }

  let q = supabase
    .from("products")
    .select("*, product_images(*), categories(slug)")
    .eq("is_available", true)
    .order("display_order");

  if (catId !== undefined && catId !== null) q = q.eq("category_id", catId);

  if (filters?.readyToday) q = q.eq("is_ready_today", true);

  const { data, error } = await q;
  if (error) return { data: [], error: error.message };
  const mapped = ((data ?? []) as ProductRow[]).map(mapProduct);
  return { data: mapped, error: null };
}

export async function fetchDbCategories(): Promise<{ data: DbCategory[]; error: string | null }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as DbCategory[], error: null };
}

export async function fetchDbProductBySlug(slug: string): Promise<{ data: DbProduct | null; error: string | null }> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*), categories(slug)")
    .eq("slug", slug)
    .eq("is_available", true)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: null };

  return { data: mapProduct(data as ProductRow), error: null };
}
