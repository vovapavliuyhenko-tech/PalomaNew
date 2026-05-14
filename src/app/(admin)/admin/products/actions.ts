"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { requireAdminOrRedirect } from "@/lib/admin/requireAdminOrRedirect";

function svc() {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

export type FormState = { error?: string } | null;

export async function updateProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdminOrRedirect();
  const sb = svc();
  if (!sb) return { error: "Нет SUPABASE_SERVICE_ROLE_KEY на сервере." };

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const price = Number.parseFloat(String(formData.get("price") ?? ""));
  const description = String(formData.get("description") ?? "").trim() || null;
  const composition = String(formData.get("composition") ?? "").trim() || null;
  const categoryIdRaw = String(formData.get("category_id") ?? "").trim();
  const category_id = categoryIdRaw === "" ? null : categoryIdRaw;
  const display_order = Number.parseInt(String(formData.get("display_order") ?? "0"), 10);
  const is_available = formData.get("is_available") === "on";
  const is_ready_today = formData.get("is_ready_today") === "on";

  if (!id) return { error: "Не указан id товара." };
  if (!name || name.length < 2) return { error: "Введите название." };
  if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) return { error: "Slug: только латиница, цифры и дефис." };
  if (!Number.isFinite(price) || price <= 0) return { error: "Укажите корректную цену." };
  const orderNum = Number.isFinite(display_order) ? display_order : 0;

  const { error } = await sb
    .from("products")
    .update({
      name,
      slug,
      price,
      description,
      composition,
      category_id,
      display_order: orderNum,
      is_available,
      is_ready_today,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message.includes("unique") ? "Такой slug уже занят." : error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath("/catalog");
  revalidatePath(`/product/${slug}`);
  revalidatePath(`/catalog/${slug}`);
  revalidatePath("/coffee");
  return null;
}

export async function createProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdminOrRedirect();
  const sb = svc();
  if (!sb) return { error: "Нет SUPABASE_SERVICE_ROLE_KEY на сервере." };

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const price = Number.parseFloat(String(formData.get("price") ?? ""));
  const description = String(formData.get("description") ?? "").trim() || null;
  const composition = String(formData.get("composition") ?? "").trim() || null;
  const categoryIdRaw = String(formData.get("category_id") ?? "").trim();
  const category_id = categoryIdRaw === "" ? null : categoryIdRaw;

  if (!name || name.length < 2) return { error: "Введите название." };
  if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) return { error: "Slug: только латиница, цифры и дефис." };
  if (!Number.isFinite(price) || price <= 0) return { error: "Укажите корректную цену." };

  const { data, error } = await sb
    .from("products")
    .insert({
      name,
      slug,
      price,
      description,
      composition,
      category_id,
      is_available: true,
      is_ready_today: false,
      display_order: 999,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    return { error: error?.message.includes("unique") ? "Такой slug уже занят." : error?.message ?? "Не удалось создать." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/coffee");
  redirect(`/admin/products/${data.id}/edit`);
}
