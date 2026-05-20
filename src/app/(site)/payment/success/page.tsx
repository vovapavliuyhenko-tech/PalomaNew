import type { Metadata } from "next";
import { Suspense } from "react";
import { definePageMeta } from "@/lib/seo";
import PaymentSuccessClient from "./PaymentSuccessClient";

export const metadata: Metadata = definePageMeta({
  title: "Оплата прошла успешно",
  description: "Заказ PALOMA принят. Мы отправим напоминание и фото букета перед доставкой.",
  path: "/payment/success",
  noIndex: true,
});

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={<div className="min-h-[50vh] bg-[var(--bg-card)]" aria-busy="true" aria-label="Загрузка" />}
    >
      <PaymentSuccessClient />
    </Suspense>
  );
}
