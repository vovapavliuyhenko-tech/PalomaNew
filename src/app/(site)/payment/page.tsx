import type { Metadata } from "next";
import PageHero from "@/components/layout/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { CreditCard, Smartphone, Clock, ShieldCheck } from "lucide-react";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { siteConfig } from "@/lib/siteConfig";
import { definePageMeta } from "@/lib/seo";

export const metadata: Metadata = definePageMeta({
  title: `Оплата — ${siteConfig.legalName}`,
  description: `Способы оплаты в ${siteConfig.city}: банковская карта, СБП, оплата после подтверждения менеджером. Безопасный платёжный шлюз.`,
  path: "/payment",
});

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Оплата", path: "/payment" },
        ]}
      />
      <PageHero
        crumbs={[{ name: "Главная", href: "/" }, { name: "Оплата" }]}
        eyebrow={siteConfig.legalName}
        title="Оплата"
        lead="Онлайн-оплата картой или через СБП, либо оплата после согласования заказа с менеджером — как на странице оформления."
      />

      <ScrollReveal>
        <div className="container mx-auto max-w-4xl py-[var(--space-xl)] md:py-[var(--space-xxl)]">
          <div className="mb-12 grid gap-6 md:grid-cols-3 md:gap-[var(--space-lg)]">
            {[
              {
                icon: CreditCard,
                title: "Банковская карта",
                desc: "Visa, Mastercard, МИР — через защищённый платёжный шлюз при оформлении заказа.",
              },
              {
                icon: Smartphone,
                title: "СБП",
                desc: "Система быстрых платежей без ввода реквизитов карты, если доступно в вашем банке.",
              },
              {
                icon: Clock,
                title: "После подтверждения",
                desc: "Оплатите после звонка менеджера — удобно для крупных или нестандартных заказов.",
              },
            ].map((method) => (
              <div
                key={method.title}
                className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-primary)] p-6 text-center shadow-[var(--shadow-soft)] transition-shadow duration-[var(--dur-base)] hover:shadow-[var(--shadow-card)]"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-secondary)]">
                  <method.icon size={20} className="text-[var(--color-cherry)]" strokeWidth={1.5} />
                </div>
                <p className="mb-2 font-medium text-[var(--text-primary)]">{method.title}</p>
                <p className="text-sm text-[var(--text-secondary)]">{method.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-[var(--shadow-soft)] md:p-8">
            <ShieldCheck className="mt-0.5 flex-shrink-0 text-[var(--color-cherry)]" size={22} strokeWidth={1.5} />
            <div>
              <p className="mb-1 font-medium text-[var(--text-primary)]">Безопасная оплата</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Платежи по карте и СБП обрабатываются платёжным провайдером; данные карты на наших серверах не хранятся.
                При необходимости подключена дополнительная авторизация (например, 3-D Secure).
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
