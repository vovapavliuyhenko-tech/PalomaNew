import type { SupabaseClient } from "@supabase/supabase-js";

import { siteConfig } from "@/lib/siteConfig";

/** Базовые тарифы доставки (когда нет строк в БД), PRD §9. */
const PRD_BASE_DELIVERY: Record<string, number> = {
  Новороссийск: 500,
  Кабардинка: 800,
  Геленджик: 1000,
  Анапа: 1500,
  Краснодар: 1500,
};

function prdFallbackDeliveryCost(city: string, subtotal: number): number {
  const threshold = siteConfig.minOrderFreeDelivery;
  if (city === "Новороссийск") {
    return subtotal >= threshold ? 0 : (PRD_BASE_DELIVERY["Новороссийск"] ?? 500);
  }
  return PRD_BASE_DELIVERY[city] ?? 500;
}

export function inferDeliveryCityFromAddress(address: string): string {
  const raw = address.trim();
  if (!raw) return siteConfig.city;
  const first = raw.split(",")[0]?.trim().toLowerCase() ?? "";
  if (first.includes("новоросс")) return "Новороссийск";
  if (first.includes("кабардин")) return "Кабардинка";
  if (first.includes("гелендж")) return "Геленджик";
  if (first.includes("анап")) return "Анапа";
  if (first.includes("краснодар")) return "Краснодар";
  const full = raw.toLowerCase();
  if (full.includes("гелендж")) return "Геленджик";
  if (full.includes("кабардин")) return "Кабардинка";
  if (full.includes("анап")) return "Анапа";
  if (full.includes("краснодар")) return "Краснодар";
  return siteConfig.city;
}

export async function quoteDelivery(params: {
  supabase?: SupabaseClient;
  deliveryType: "delivery" | "pickup";
  deliveryAddress?: string | null | undefined;
  subtotal: number;
}): Promise<{ city: string | null; deliveryCost: number }> {
  if (params.deliveryType === "pickup") {
    return { city: null, deliveryCost: 0 };
  }

  const address = (params.deliveryAddress ?? "").trim();
  const city = address ? inferDeliveryCityFromAddress(address) : siteConfig.city;

  if (params.supabase) {
    const { data } = await params.supabase
      .from("delivery_settings")
      .select("free_delivery_threshold, paid_delivery_cost")
      .eq("city", city)
      .eq("is_active", true)
      .maybeSingle();

    if (data) {
      const threshold = Number(data.free_delivery_threshold);
      const paid = data.paid_delivery_cost != null ? Number(data.paid_delivery_cost) : 0;
      return {
        city,
        deliveryCost:
          Number.isFinite(params.subtotal) && params.subtotal >= threshold ? 0 : paid,
      };
    }
  }

  return {
    city,
    deliveryCost: prdFallbackDeliveryCost(city, params.subtotal),
  };
}
