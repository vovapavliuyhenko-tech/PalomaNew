"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PageHero from "@/components/layout/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const orderRef = searchParams.get("order") ?? undefined;

  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Оплата", path: "/payment" },
          { name: "Успешно", path: "/payment/success" },
        ]}
      />
      <PageHero
        crumbs={[
          { name: "Главная", href: "/" },
          { name: "Оплата", href: "/payment" },
          { name: "Успешная оплата" },
        ]}
        title="Спасибо, платёж прошёл"
        lead={
          orderRef
            ? `Номер заказа: ${orderRef}. Мы уже готовим букет и свяжемся при необходимости.`
            : "Заказ зафиксирован. Если нужно — позвоним для уточнения времени или адреса."
        }
      />
      <ScrollReveal>
        <div className="container mx-auto max-w-xl py-[var(--space-lg)] md:pb-[var(--space-xxl)]">
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-primary)] px-6 py-8 text-center shadow-[var(--shadow-soft)] md:p-10">
            <p className="font-accent mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">
              Вы получите подтверждение выбранным способом связи. По запросу — фото перед отправкой.
            </p>
            <Link href="/catalog" className="btn-secondary inline-flex w-full justify-center sm:w-auto sm:min-w-[220px]">
              В каталог
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
