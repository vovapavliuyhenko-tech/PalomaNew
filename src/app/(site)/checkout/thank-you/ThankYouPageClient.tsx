"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Flower2 } from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { ThankYouAnalytics } from "./ThankYouAnalytics";

export default function ThankYouPageClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? undefined;
  const lead = orderId
    ? `Номер заказа: ${orderId}. Мы приняли ваш заказ и скоро свяжемся с вами для подтверждения. Фото букета пришлём перед отправкой.`
    : "Мы приняли ваш заказ и скоро свяжемся с вами для подтверждения. Фото букета пришлём перед отправкой.";

  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <ThankYouAnalytics orderId={orderId} />
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Оформление заказа", path: "/checkout" },
          { name: "Спасибо за заказ", path: "/checkout/thank-you" },
        ]}
      />
      <PageHero
        align="center"
        maxWidthClass="max-w-2xl"
        crumbs={[
          { name: "Главная", href: "/" },
          { name: "Оформление заказа", href: "/checkout" },
          { name: "Спасибо" },
        ]}
        eyebrow="Заказ создан"
        title="Спасибо за заказ!"
        lead={lead}
      >
        <div className="flex justify-center text-[var(--color-cherry)]" aria-hidden>
          <Flower2 size={38} strokeWidth={1.25} className="opacity-95" />
        </div>
      </PageHero>
      <ScrollReveal>
        <div className="container mx-auto max-w-xl py-[var(--space-lg)] md:pb-[var(--space-xxl)]">
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-primary)] px-6 py-8 shadow-[var(--shadow-soft)] md:p-10">
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <Link href="/" className="btn-primary justify-center sm:min-w-[200px]">
                На главную
              </Link>
              <Link href="/catalog" className="btn-secondary justify-center sm:min-w-[200px]">
                Продолжить покупки
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
