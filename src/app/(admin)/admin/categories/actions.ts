"use server";

import { revalidatePath } from "next/cache";

import { requireAdminOrRedirect } from "@/lib/admin/requireAdminOrRedirect";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";

function svc() {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

export type FormState = { error?: string } | null;

export async function updateCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdminOrRedirect();
  const sb = svc();
  if (!sb) return { error: "Нет SUPABASE_SERVICE_ROLE_KEY на сервере." };

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const description = String(formData.get("description") ?? "").trim() || null;
  const image_url = String(formData.get("image_url") ?? "").trim() || null;
  const display_order = Number.parseInt(String(formData.get("display_order") ?? "0"), 10);
  const is_active = formData.get("is_active") === "on";

  if (!id) return { error: "Не указан id." };
  if (!name || name.length < 2) return { error: "Введите название." };
  if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) return { error: "Slug: только латиница, цифры и дефис." };

  const orderNum = Number.isFinite(display_order) ? display_order : 0;

  const { error } = await sb
    .from("categories")
    .update({
      name,
      slug,
      description,
      image_url,
      display_order: orderNum,
      is_active,
    })
    .eq("id", id);

  if (error) {
    return {
      error: error.message.includes("unique") ? "Такое имя или slug уже заняты." : error.message,
    };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/catalog");
  return null;
}

export async function createCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdminOrRedirect();
  const sb = svc();
  if (!sb) return { error: "Нет SUPABASE_SERVICE_ROLE_KEY на сервере." };

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const description = String(formData.get("description") ?? "").trim() || null;
  const image_url = String(formData.get("image_url") ?? "").trim() || null;
  const display_order = Number.parseInt(String(formData.get("display_order") ?? "0"), 10);
  const is_active = formData.get("is_active") === "on";

  if (!name || name.length < 2) return { error: "Введите название." };
  if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) return { error: "Slug: только латиница, цифры и дефис." };
  const orderNum = Number.isFinite(display_order) ? display_order : 0;

  const { error } = await sb.from("categories").insert({
    name,
    slug,
    description,
    image_url,
    display_order: orderNum,
    is_active,
  });

  if (error) {
    return {
      error: error.message.includes("unique") ? "Такое имя или slug уже заняты." : error.message,
    };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/catalog");
  return null;
}
