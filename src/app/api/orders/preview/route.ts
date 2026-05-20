import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { computeOrderPricing } from "@/lib/orders/computeOrderPricing";
import type { IncomingLineItem } from "@/lib/orders/validateCheckoutLines";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";

function safeSupabaseService() {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

const bodySchema = z.object({
  deliveryType: z.enum(["delivery", "pickup"]),
  address: z.string().optional(),
  deliveryUrgency: z.boolean().optional(),
  deliveryExactTime: z.boolean().optional(),
  promoCode: z.string().optional(),
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        productId: z.string().min(1),
        title: z.string(),
        unitPrice: z.number(),
        qty: z.number().int().positive(),
        size: z.string(),
      })
    )
    .min(1),
});

/** Превью итога до оплаты: совпадает с POST /api/orders для корзины и параметров доставки. */
export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const { deliveryType, address, deliveryUrgency, deliveryExactTime, items, promoCode } = parsed.data;
    const incomingLines: IncomingLineItem[] = items.map((i) => ({
      slug: i.slug,
      productId: i.productId,
      title: i.title,
      unitPrice: i.unitPrice,
      qty: i.qty,
      size: i.size,
    }));

    const supabase = safeSupabaseService();
    const pricing = await computeOrderPricing(supabase, {
      deliveryType,
      deliveryAddress: address,
      incomingLines,
      promoCode: promoCode?.trim() || null,
      deliveryUrgency: Boolean(deliveryUrgency),
      deliveryExactTime: Boolean(deliveryExactTime),
    });

    if (!pricing.ok) {
      return NextResponse.json({ success: false, errors: pricing.errors }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      subtotal: pricing.subtotal,
      discountAmount: pricing.discountAmount,
      promoCode: pricing.promoCode,
      deliveryCost: pricing.deliveryCost,
      total: pricing.total,
      deliveryCity: pricing.deliveryCity,
    });
  } catch (e) {
    console.error("POST /api/orders/preview:", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
