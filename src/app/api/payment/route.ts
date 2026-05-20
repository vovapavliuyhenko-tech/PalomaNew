import { NextRequest, NextResponse } from "next/server";

import { getPaymentProvider } from "@/lib/payment";
import { updateOrderPaymentByExternalId } from "@/lib/orders/updateOrderPaymentStatus";

/** Создание платежа (как прежде) и подтверждение статуса с записью в Supabase. */

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, description, returnUrl } = await request.json();

    const provider = getPaymentProvider();
    const payment = await provider.createPayment({
      orderId,
      amount,
      description,
      returnUrl,
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const paymentId = request.nextUrl.searchParams.get("paymentId");

  if (!paymentId) {
    return NextResponse.json({ error: "paymentId required" }, { status: 400 });
  }

  try {
    const provider = getPaymentProvider();
    const result = await provider.confirmPayment(paymentId);

    if (result.status === "succeeded") {
      await updateOrderPaymentByExternalId(paymentId, "succeeded");
    } else if (result.status === "canceled") {
      await updateOrderPaymentByExternalId(paymentId, "canceled");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Payment confirm error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
