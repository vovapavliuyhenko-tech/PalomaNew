import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { DELIVERY_INTERVALS } from "@/lib/constants";
import { computeOrderPricing } from "@/lib/orders/computeOrderPricing";
import { insertCheckoutOrder } from "@/lib/orders/insertCheckoutOrder";
import type { IncomingLineItem } from "@/lib/orders/validateCheckoutLines";
import { getPaymentProvider } from "@/lib/payment";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { sendOrderToTelegram } from "@/lib/telegram";
import { generateOrderId } from "@/lib/utils";

const checkoutIntervalIds = DELIVERY_INTERVALS.map((i) => i.id) as [
  (typeof DELIVERY_INTERVALS)[number]["id"],
  ...(typeof DELIVERY_INTERVALS)[number]["id"][],
];
const checkoutIntervalSchema = z.enum(checkoutIntervalIds);
function safeSupabaseService() {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

const orderSchema = z
  .object({
    customerName: z.string().min(1),
    customerPhone: z.string().min(1),
    customerEmail: z.union([z.literal(""), z.string().email()]).optional(),
    customerTelegram: z.string().optional(),
    contactMethod: z.enum(["phone", "telegram", "whatsapp", "email"]),
    recipientName: z.string().min(1),
    recipientPhone: z.string().min(1),
    iAmRecipient: z.boolean(),
    isAnonymous: z.boolean(),
    addressFromRecipient: z.boolean().optional(),
    deliveryType: z.enum(["delivery", "pickup"]),
    address: z.string().optional(),
    courierComment: z.string().optional(),
    deliveryDate: z.string().min(1),
    deliveryInterval: checkoutIntervalSchema,
    deliveryUrgency: z.boolean().optional(),
    deliveryExactTime: z.boolean().optional(),
    cardText: z.string().max(200).optional(),
    paymentMethod: z.enum(["card", "sbp", "pending"]),
    items: z.array(
      z.object({
        slug: z.string().min(1),
        productId: z.string().min(1),
        title: z.string(),
        unitPrice: z.number(),
        qty: z.number().int().positive(),
        size: z.string(),
      })
    ),
    total: z.number().optional(),
    promoCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryType !== "delivery") return;
    const addr = data.address?.trim() ?? "";
    if (addr.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Укажите город и адрес доставки",
        path: ["address"],
      });
    }
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order: rawOrder } = body;

    const parsed = orderSchema.safeParse(rawOrder);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const order = parsed.data;

    const incomingLines: IncomingLineItem[] = order.items.map((i) => ({
      slug: i.slug,
      productId: i.productId,
      title: i.title,
      unitPrice: i.unitPrice,
      qty: i.qty,
      size: i.size,
    }));

    const supabase = safeSupabaseService();

    const pricingResult = await computeOrderPricing(supabase, {
      deliveryType: order.deliveryType,
      deliveryAddress: order.address,
      incomingLines,
      promoCode: order.promoCode?.trim() || null,
      deliveryUrgency: Boolean(order.deliveryUrgency),
      deliveryExactTime: Boolean(order.deliveryExactTime),
    });

    if (!pricingResult.ok) {
      return NextResponse.json({ success: false, errors: pricingResult.errors }, { status: 422 });
    }

    const {
      subtotal: subtotalFromServer,
      discountAmount,
      promoCode: pricingPromoCode,
      deliveryCost,
      total: totalFromServer,
      deliveryCity: cityForOrder,
      validatedLines,
      telegramLines,
    } = pricingResult;

    const contactMethodLabel: Record<string, string> = {
      phone: "телефон",
      telegram: "Telegram",
      whatsapp: "WhatsApp",
      email: "email",
    };

    const intervalLabel =
      DELIVERY_INTERVALS.find((i) => i.id === order.deliveryInterval)?.label ?? order.deliveryInterval;

    const commentPieces: string[] = [];
    if (discountAmount > 0 && pricingPromoCode) {
      commentPieces.push(`Промокод ${pricingPromoCode}: скидка ${discountAmount} ₽`);
    }
    if (order.customerEmail?.trim()) {
      commentPieces.push(`Email: ${order.customerEmail.trim()}`);
    }
    commentPieces.push(`Связь: ${contactMethodLabel[order.contactMethod] ?? order.contactMethod}`);
    if (order.iAmRecipient) commentPieces.push("Заказчик является получателем");
    if (order.addressFromRecipient && order.deliveryType === "delivery") {
      commentPieces.push("Адрес уточняем у получателя");
    }
    if (order.deliveryUrgency) commentPieces.push("Срочная доставка (+500 ₽ к тарифу)");
    if (order.deliveryExactTime) commentPieces.push("Точное время (+1000 ₽ к тарифу)");
    commentPieces.push(
      ["Получатель", `${order.recipientName}, ${order.recipientPhone}`, order.isAnonymous ? "(анонимная доставка)" : ""]
        .filter(Boolean)
        .join(" ")
    );
    if (order.customerTelegram?.trim())
      commentPieces.push(`Telegram заказчика: ${order.customerTelegram.trim()}`);
    if (order.courierComment?.trim()) commentPieces.push(`Комментарий курьеру:\n${order.courierComment.trim()}`);
    if (deliveryCost > 0)
      commentPieces.push(`Доставка: ${cityForOrder ?? ""} (${deliveryCost} ₽, интервал ${intervalLabel})`.trim());
    else if (order.deliveryType === "delivery")
      commentPieces.push(`Доставка: ${cityForOrder ?? "—"} · интервал ${intervalLabel}`);

    const orderId = generateOrderId();
    let persistedOrderPk: string | null = null;

    if (supabase && validatedLines) {
      const preferredContact =
        order.contactMethod === "telegram" && order.customerTelegram?.trim()
          ? `telegram:${order.customerTelegram.trim()}`
          : order.contactMethod;

      const ins = await insertCheckoutOrder(supabase, {
        orderNumber: orderId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail?.trim() || null,
        contactMethod: preferredContact,
        deliveryType: order.deliveryType,
        deliveryCity: order.deliveryType === "delivery" ? cityForOrder : null,
        deliveryAddress: order.deliveryType === "delivery" ? (order.address?.trim() || null) : null,
        deliveryDate: order.deliveryDate,
        deliveryInterval: order.deliveryInterval,
        cardText: order.cardText ?? null,
        sendPhotoBefore: true,
        comment: commentPieces.join("\n\n"),
        subtotal: subtotalFromServer,
        deliveryCost,
        total: totalFromServer,
        paymentMethod: order.paymentMethod,
        lines: validatedLines,
      });

      if (!ins.ok) {
        console.error("Supabase insert order:", ins.message);
        return NextResponse.json(
          { success: false, error: "Не удалось сохранить заказ. Попробуйте позже." },
          { status: 500 }
        );
      }
      persistedOrderPk = ins.id;
    }

    await sendOrderToTelegram({
      id: orderId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail?.trim() || undefined,
      customerTelegram: order.customerTelegram,
      contactMethod: order.contactMethod,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      iAmRecipient: order.iAmRecipient,
      addressFromRecipient: order.addressFromRecipient,
      isAnonymous: order.isAnonymous,
      deliveryType: order.deliveryType,
      address: order.address,
      courierComment: order.courierComment,
      deliveryDate: order.deliveryDate,
      deliveryInterval: order.deliveryInterval,
      deliveryUrgency: Boolean(order.deliveryUrgency),
      deliveryExactTime: Boolean(order.deliveryExactTime),
      cardText: order.cardText,
      paymentMethod: order.paymentMethod,
      items: telegramLines,
      total: totalFromServer,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      promoCode: discountAmount > 0 ? pricingPromoCode : undefined,
    });

    let paymentId = "";
    let confirmationUrl: string | undefined;

    if (order.paymentMethod !== "pending") {
      const paymentProvider = getPaymentProvider();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

      const payment = await paymentProvider.createPayment({
        orderId,
        amount: totalFromServer,
        description: `Заказ #${orderId} — Paloma Flowers`,
        returnUrl: `${siteUrl}/checkout/thank-you?orderId=${orderId}`,
      });

      paymentId = payment.paymentId;
      confirmationUrl = payment.confirmationUrl;

      if (supabase && persistedOrderPk && payment.paymentId) {
        const { error: payErr } = await supabase
          .from("orders")
          .update({ stripe_payment_id: payment.paymentId })
          .eq("id", persistedOrderPk);
        if (payErr) console.error("Не удалось привязать платёж к заказу:", payErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      total: totalFromServer,
      persisted: Boolean(persistedOrderPk),
      paymentId: paymentId || undefined,
      confirmationUrl,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка при создании заказа" },
      { status: 500 }
    );
  }
}
