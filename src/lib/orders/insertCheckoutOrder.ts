import type { SupabaseClient } from "@supabase/supabase-js";

import type { ValidatedLine } from "@/lib/orders/validateCheckoutLines";

export type OrderInsertPayload = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  contactMethod?: string | null;
  deliveryType: "delivery" | "pickup";
  deliveryCity?: string | null;
  deliveryAddress?: string | null;
  deliveryDate: string;
  deliveryInterval: string;
  cardText?: string | null;
  sendPhotoBefore?: boolean;
  comment?: string | null;
  subtotal: number;
  deliveryCost: number;
  total: number;
  paymentMethod: string;
  paymentStatus?: string;
  paymentExternalId?: string | null;
  lines: ValidatedLine[];
};

export async function insertCheckoutOrder(
  supabase: SupabaseClient,
  payload: OrderInsertPayload
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const commentParts: string[] = [];
  if (payload.comment) commentParts.push(payload.comment.trim());

  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .insert({
      order_number: payload.orderNumber,
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      customer_email: payload.customerEmail ?? null,
      contact_method: payload.contactMethod ?? null,
      delivery_type: payload.deliveryType,
      delivery_city: payload.deliveryCity ?? null,
      delivery_address: payload.deliveryAddress ?? null,
      delivery_date: payload.deliveryDate,
      delivery_interval: payload.deliveryInterval,
      card_text: payload.cardText ?? null,
      send_photo_before: payload.sendPhotoBefore ?? true,
      comment: commentParts.filter(Boolean).join("\n\n") || null,
      subtotal: payload.subtotal,
      delivery_cost: payload.deliveryCost,
      total: payload.total,
      payment_method: payload.paymentMethod,
      payment_status: payload.paymentStatus ?? "pending",
      stripe_payment_id: payload.paymentExternalId ?? null,
      order_status: "new",
    })
    .select("id")
    .single();

  if (orderErr || !orderRow?.id) {
    return { ok: false, message: orderErr?.message ?? "Ошибка записи заказа" };
  }

  const inserts = payload.lines.map((ln) => ({
    order_id: orderRow.id,
    product_id: ln.productId,
    quantity: ln.quantity,
    price_at_purchase: ln.unitPrice,
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(inserts);

  if (itemsErr) {
    return { ok: false, message: itemsErr.message };
  }

  return { ok: true, id: orderRow.id };
}
