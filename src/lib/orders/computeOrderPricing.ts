import type { SupabaseClient } from "@supabase/supabase-js";

import { quoteDelivery } from "@/lib/orders/deliveryQuote";
import type { IncomingLineItem, ValidatedLine } from "@/lib/orders/validateCheckoutLines";
import { validateCheckoutLines } from "@/lib/orders/validateCheckoutLines";
import { parsePromoCodeInput, promoDiscountAmount } from "@/lib/cart/promoCodes";
import { DELIVERY_SURCHARGE_EXACT_TIME, DELIVERY_SURCHARGE_URGENCY } from "@/lib/constants";

export type OrderPricingTelegramLine = {
  title: string;
  size: string;
  qty: number;
  price: number;
};

export type ComputeOrderPricingResult =
  | {
      ok: true;
      subtotal: number;
      discountAmount: number;
      promoCode: string | null;
      deliveryCost: number;
      total: number;
      deliveryCity: string | null;
      validatedLines: ValidatedLine[] | null;
      telegramLines: OrderPricingTelegramLine[];
    }
  | { ok: false; errors: string[] };

/**
 * Те же суммы и правила доставки, что при POST /api/orders (пересчёт subtotal при наличии service role).
 */
export async function computeOrderPricing(
  supabase: SupabaseClient | null,
  params: {
    deliveryType: "delivery" | "pickup";
    deliveryAddress?: string | null;
    incomingLines: IncomingLineItem[];
    promoCode?: string | null;
    deliveryUrgency?: boolean;
    deliveryExactTime?: boolean;
  }
): Promise<ComputeOrderPricingResult> {
  const { incomingLines, deliveryType, deliveryAddress, promoCode, deliveryUrgency, deliveryExactTime } =
    params;

  if (!incomingLines.length) return { ok: false, errors: ["Пустая корзина"] };

  let subtotalFromServer: number;
  let telegramLines: OrderPricingTelegramLine[];
  let validatedLines: ValidatedLine[] | null = null;

  if (supabase) {
    const validated = await validateCheckoutLines(supabase, incomingLines);
    if (!validated.ok) return { ok: false, errors: validated.errors };
    validatedLines = validated.validated;
    subtotalFromServer = validated.validated.reduce((s, l) => s + l.lineTotal, 0);
    telegramLines = validated.validated.map((l) => ({
      title: l.titleFromClient,
      size: l.sizeLabel,
      qty: l.quantity,
      price: l.lineTotal,
    }));
  } else {
    subtotalFromServer = incomingLines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
    telegramLines = incomingLines.map((i) => ({
      title: i.title,
      size: i.size,
      qty: i.qty,
      price: i.unitPrice * i.qty,
    }));
  }

  const promoRule = promoCode?.trim() ? parsePromoCodeInput(promoCode) : null;
  const discountAmount = promoDiscountAmount(subtotalFromServer, promoRule);
  const goodsAfterDiscount = Math.max(0, subtotalFromServer - discountAmount);

  let { deliveryCost, city } = await quoteDelivery({
    supabase: supabase ?? undefined,
    deliveryType,
    deliveryAddress,
    subtotal: goodsAfterDiscount,
  });

  if (deliveryType === "delivery") {
    if (deliveryUrgency) deliveryCost += DELIVERY_SURCHARGE_URGENCY;
    if (deliveryExactTime) deliveryCost += DELIVERY_SURCHARGE_EXACT_TIME;
  }

  return {
    ok: true,
    subtotal: subtotalFromServer,
    discountAmount,
    promoCode: promoRule?.code ?? null,
    deliveryCost,
    total: goodsAfterDiscount + deliveryCost,
    deliveryCity: deliveryType === "pickup" ? null : city,
    validatedLines,
    telegramLines,
  };
}
