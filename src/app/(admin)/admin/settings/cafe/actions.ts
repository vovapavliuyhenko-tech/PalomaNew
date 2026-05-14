"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

import { requireAdminOrRedirect } from "@/lib/admin/requireAdminOrRedirect";
import { COFFEE_MENU_CATEGORY_SLUGS } from "@/lib/catalog/fetchCoffeeCategoryProductsForPicker";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function svc() {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

export type FormState = { error?: string } | null;

async function resolveOptionalCoffeeProductId(
  sb: SupabaseClient,
  raw: FormDataEntryValue | null,
): Promise<{ ok: true; product_id: string | null } | { ok: false; error: string }> {
  const s = String(raw ?? "").trim();
  if (!s) return { ok: true, product_id: null };
  if (!UUID_RE.test(s)) return { ok: false, error: "Некорректный UUID товара каталога." };
  const product_id = s.toLowerCase();

  const { data: prod, error } = await sb.from("products").select("category_id").eq("id", product_id).maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!prod?.category_id) return { ok: false, error: "Товар каталога не найден." };

  const { data: cat } = await sb.from("categories").select("slug").eq("id", prod.category_id).maybeSingle();
  const slug = String(cat?.slug ?? "");
  if (!(COFFEE_MENU_CATEGORY_SLUGS as readonly string[]).includes(slug)) {
    return {
      ok: false,
      error: "Привязка только к товару из категорий «Кофе» или «Выпечка» (kofe / vypechka).",
    };
  }

  return { ok: true, product_id };
}

export async function updateCafeItem(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdminOrRedirect();
  const sb = svc();
  if (!sb) return { error: "Нет SUPABASE_SERVICE_ROLE_KEY на сервере." };

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim().toLowerCase();
  const description = String(formData.get("description") ?? "").trim() || null;
  const price = Number.parseFloat(String(formData.get("price") ?? ""));
  const image_url = String(formData.get("image_url") ?? "").trim() || null;
  const display_order = Number.parseInt(String(formData.get("display_order") ?? "0"), 10);
  const is_available = formData.get("is_available") === "on";

  const link = await resolveOptionalCoffeeProductId(sb, formData.get("product_id"));
  if (!link.ok) return { error: link.error };

  if (!id) return { error: "Не указан id." };
  if (!name || name.length < 2) return { error: "Укажите название." };
  if (!category || !/^[a-z0-9_-]+$/.test(category)) return { error: "Категория: только латиница, цифры, _ и -." };
  if (!Number.isFinite(price) || price < 0) return { error: "Укажите корректную цену." };
  const orderNum = Number.isFinite(display_order) ? display_order : 0;

  const { error } = await sb
    .from("cafe_items")
    .update({
      name,
      category,
      description,
      price,
      image_url,
      display_order: orderNum,
      is_available,
      product_id: link.product_id,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/settings/cafe");
  return null;
}

export async function createCafeItem(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdminOrRedirect();
  const sb = svc();
  if (!sb) return { error: "Нет SUPABASE_SERVICE_ROLE_KEY на сервере." };

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim().toLowerCase();
  const description = String(formData.get("description") ?? "").trim() || null;
  const price = Number.parseFloat(String(formData.get("price") ?? ""));
  const image_url = String(formData.get("image_url") ?? "").trim() || null;
  const display_order = Number.parseInt(String(formData.get("display_order") ?? "0"), 10);
  const is_available = formData.get("is_available") === "on";

  const link = await resolveOptionalCoffeeProductId(sb, formData.get("product_id"));
  if (!link.ok) return { error: link.error };

  if (!name || name.length < 2) return { error: "Укажите название." };
  if (!category || !/^[a-z0-9_-]+$/.test(category)) return { error: "Категория (латиница), например coffee или pastry." };
  if (!Number.isFinite(price) || price < 0) return { error: "Укажите корректную цену." };
  const orderNum = Number.isFinite(display_order) ? display_order : 0;

  const { error } = await sb.from("cafe_items").insert({
    name,
    category,
    description,
    price,
    image_url,
    display_order: orderNum,
    is_available,
    product_id: link.product_id,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/settings/cafe");
  return null;
}
