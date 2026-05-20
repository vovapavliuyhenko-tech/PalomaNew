import type { Metadata } from "next";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PageHero from "@/components/layout/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { definePageMeta } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = definePageMeta({
  title: "Оформление заказа",
  description: `Оформите заказ на доставку цветов — ${siteConfig.legalName}.`,
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Оформление заказа", path: "/checkout" },
        ]}
      />
      <PageHero
        crumbs={[{ name: "Главная", href: "/" }, { name: "Оформление заказа" }]}
        eyebrow={`${siteConfig.legalName} · доставка`}
        title="Оформление заказа"
        lead="Два шага — контакты и доставка. Оплата онлайн после подтверждения состава заказа."
      />

      <ScrollReveal>
        <div className="container mx-auto py-[var(--space-lg)] md:py-[var(--space-xl)] md:pb-[var(--space-xxl)]">
          <CheckoutForm />
        </div>
      </ScrollReveal>
    </div>
  );
}
