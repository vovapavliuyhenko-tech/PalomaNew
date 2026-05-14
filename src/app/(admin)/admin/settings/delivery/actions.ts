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

/** Пустая строка → undefined; некорректное число → undefined. */
function parseMoney(raw: string): number | undefined {
  const t = raw.trim().replace(",", ".");
  if (!t) return undefined;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : undefined;
}

export async function updateDeliveryZone(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdminOrRedirect();
  const sb = svc();
  if (!sb) return { error: "Нет SUPABASE_SERVICE_ROLE_KEY на сервере." };

  const id = String(formData.get("id") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const freeRaw = String(formData.get("free_delivery_threshold") ?? "");
  const paidRaw = String(formData.get("paid_delivery_cost") ?? "").trim();
  const is_active = formData.get("is_active") === "on";

  if (!id) return { error: "Не указан id зоны." };
  if (!city || city.length < 2) return { error: "Укажите город." };

  const free_delivery_threshold = parseMoney(freeRaw);
  if (free_delivery_threshold === undefined || free_delivery_threshold < 0) {
    return { error: "Некорректный порог бесплатной доставки." };
  }

  let paid_delivery_cost: number | null = null;
  if (paidRaw !== "") {
    const paid = parseMoney(paidRaw);
    if (paid === undefined || paid < 0) {
      return { error: "Некорректная стоимость платной доставки (или оставьте поле пустым)." };
    }
    paid_delivery_cost = paid;
  }

  const { error } = await sb
    .from("delivery_settings")
    .update({
      city,
      free_delivery_threshold,
      paid_delivery_cost,
      is_active,
    })
    .eq("id", id);

  if (error) {
    return {
      error: error.message.includes("unique") ? "Зона с таким городом уже есть." : error.message,
    };
  }

  revalidatePath("/admin/settings/delivery");
  return null;
}

export async function createDeliveryZone(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdminOrRedirect();
  const sb = svc();
  if (!sb) return { error: "Нет SUPABASE_SERVICE_ROLE_KEY на сервере." };

  const city = String(formData.get("city") ?? "").trim();
  const freeRaw = String(formData.get("free_delivery_threshold") ?? "5000");
  const paidRaw = String(formData.get("paid_delivery_cost") ?? "").trim();
  const is_active = formData.get("is_active") === "on";

  if (!city || city.length < 2) return { error: "Укажите город." };

  const free_delivery_threshold = parseMoney(freeRaw);
  if (free_delivery_threshold === undefined || free_delivery_threshold < 0) {
    return { error: "Некорректный порог бесплатной доставки." };
  }

  let paid_delivery_cost: number | null = null;
  if (paidRaw !== "") {
    const paid = parseMoney(paidRaw);
    if (paid === undefined || paid < 0) {
      return { error: "Некорректная стоимость платной доставки." };
    }
    paid_delivery_cost = paid;
  }

  const { error } = await sb.from("delivery_settings").insert({
    city,
    free_delivery_threshold,
    paid_delivery_cost,
    is_active,
  });

  if (error) {
    return {
      error: error.message.includes("unique") ? "Зона с таким городом уже есть." : error.message,
    };
  }

  revalidatePath("/admin/settings/delivery");
  return null;
}
