import { NextRequest, NextResponse } from "next/server";

import { updateOrderPaymentByExternalId } from "@/lib/orders/updateOrderPaymentStatus";

/**
 * URL для webhook в личном кабинете YooKassa: `https://<домен>/api/webhooks/yookassa`.
 * При заданном `YOOKASSA_WEBHOOK_SECRET` требуйте заголовок `x-yookassa-webhook-secret`.
 */
type YooNotification = {
  type?: string;
  event?: string;
  object?: { id?: string; status?: string; metadata?: { orderId?: string } };
};

export async function POST(request: NextRequest) {
  const expected = process.env.YOOKASSA_WEBHOOK_SECRET?.trim();
  if (expected) {
    const got = request.headers.get("x-yookassa-webhook-secret") ?? "";
    if (got !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: YooNotification;
  try {
    body = (await request.json()) as YooNotification;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.type !== "notification" || !body.object?.id) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const paymentId = body.object.id;
  const status = body.object.status ?? "pending";

  if (status === "succeeded") {
    await updateOrderPaymentByExternalId(paymentId, "succeeded");
  } else if (status === "canceled") {
    await updateOrderPaymentByExternalId(paymentId, "canceled");
  } else {
    await updateOrderPaymentByExternalId(paymentId, "pending");
  }

  return NextResponse.json({ ok: true });
}
