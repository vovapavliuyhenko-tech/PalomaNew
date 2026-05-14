import type { Metadata } from "next";
import { Suspense } from "react";
import { definePageMeta } from "@/lib/seo";
import ThankYouPageClient from "./ThankYouPageClient";

export const metadata: Metadata = definePageMeta({
  title: "Спасибо за заказ",
  description:
    "Заказ в PALOMA принят. Мы подтвердим детали и отправим фото букета перед доставкой по возможности.",
  path: "/checkout/thank-you",
  noIndex: true,
});

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={<div className="min-h-[50vh] bg-[var(--bg-card)]" aria-busy="true" aria-label="Загрузка" />}
    >
      <ThankYouPageClient />
    </Suspense>
  );
}
