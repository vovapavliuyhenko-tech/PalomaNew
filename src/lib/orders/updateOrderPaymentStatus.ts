import { createSupabaseServiceClient } from "@/lib/supabase/admin";

export type OrderPaymentStatusDb = "pending" | "paid" | "canceled" | "failed";

function mapProviderStatus(
  status: "pending" | "succeeded" | "canceled" | string
): OrderPaymentStatusDb {
  if (status === "succeeded") return "paid";
  if (status === "canceled") return "canceled";
  return "pending";
}

/**
 * Обновляет заказ по внешнему id платежа (колонка `stripe_payment_id`, фактически YooKassa / dev).
 */
export async function updateOrderPaymentByExternalId(
  externalPaymentId: string,
  providerStatus: "pending" | "succeeded" | "canceled" | string
): Promise<{ ok: boolean; updated: number }> {
  let supabase;
  try {
    supabase = createSupabaseServiceClient();
  } catch {
    return { ok: false, updated: 0 };
  }

  const payment_status = mapProviderStatus(providerStatus);

  const { data, error } = await supabase
    .from("orders")
    .update({ payment_status })
    .eq("stripe_payment_id", externalPaymentId)
    .select("id");

  if (error) {
    console.error("updateOrderPaymentByExternalId:", error.message);
    return { ok: false, updated: 0 };
  }

  return { ok: true, updated: data?.length ?? 0 };
}
