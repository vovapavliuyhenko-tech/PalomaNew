"use client";

import { useEffect, useRef } from "react";
import { analytics } from "@/lib/analytics";

type Pending = { orderId: string; total: number; paymentId?: string };

function consumePending(orderId: string): { total: number; paymentId?: string } {
  if (typeof window === "undefined") return { total: 0 };
  const raw = sessionStorage.getItem("paloma_pending_order");
  if (!raw) return { total: 0 };
  try {
    const o = JSON.parse(raw) as Pending;
    if (String(o.orderId) !== orderId) return { total: 0 };
    sessionStorage.removeItem("paloma_pending_order");
    return { total: Number(o.total) || 0, paymentId: o.paymentId };
  } catch {
    return { total: 0 };
  }
}

export function ThankYouAnalytics({ orderId }: { orderId?: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (!orderId || fired.current) return;
    fired.current = true;

    const { total: amount, paymentId } = consumePending(orderId);
    analytics.paymentSuccess(orderId, amount);

    if (paymentId) {
      void fetch(`/api/payment?paymentId=${encodeURIComponent(paymentId)}`).catch(() => {});
    }
  }, [orderId]);

  return null;
}
