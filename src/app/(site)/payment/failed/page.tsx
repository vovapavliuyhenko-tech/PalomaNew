import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PageHero from "@/components/layout/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { definePageMeta } from "@/lib/seo";

export const metadata: Metadata = definePageMeta({
  title: "Оплата не прошла",
  description: "Попробуйте другой способ оплаты или свяжитесь с PALOMA — мы поможем завершить заказ.",
  path: "/payment/failed",
  noIndex: true,
});

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Оплата", path: "/payment" },
          { name: "Ошибка оплаты", path: "/payment/failed" },
        ]}
      />
      <PageHero
        crumbs={[
          { name: "Главная", href: "/" },
          { name: "Оплата", href: "/payment" },
          { name: "Ошибка оплаты" },
        ]}
        title="Не получилось списать оплату"
        lead="Это технический сбой платёжного провайдера или банка. Попробуйте снова или выберите другой способ — вернитесь к оформлению заказа, позиции в корзине сохранены."
      />
      <ScrollReveal>
        <div className="container mx-auto max-w-xl py-[var(--space-lg)] md:pb-[var(--space-xxl)]">
          <div className="flex flex-col items-center gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-primary)] px-6 py-8 shadow-[var(--shadow-soft)] md:p-10">
            <Link href="/checkout" className="btn-primary inline-flex w-full justify-center sm:w-auto sm:min-w-[260px]">
              Вернуться к оформлению
            </Link>
            <Link
              href="/contacts"
              className="font-accent text-sm text-[var(--color-cherry)] underline underline-offset-[3px] transition-colors hover:text-[var(--paloma-burgundy)]"
            >
              Связаться с нами
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
