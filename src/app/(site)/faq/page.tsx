import type { Metadata } from "next";
import PageHero from "@/components/layout/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import FAQAccordion from "@/components/shared/FAQAccordion";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/seo/FaqPageJsonLd";
import { SITE_FAQS } from "@/data/faq";
import { siteConfig } from "@/lib/siteConfig";
import { definePageMeta } from "@/lib/seo";
import { TrackOutboundAnchor } from "@/components/analytics/TrackOutboundAnchor";

export const metadata: Metadata = definePageMeta({
  title: `Вопрос-ответ — ${siteConfig.legalName}`,
  description: `Ответы на частые вопросы о заказе цветов, доставке, оплате и подписке ${siteConfig.legalName}.`,
  path: "/faq",
});

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Вопрос-ответ", path: "/faq" },
        ]}
      />
      <FaqPageJsonLd items={SITE_FAQS} />
      <PageHero
        crumbs={[{ name: "Главная", href: "/" }, { name: "Вопрос-ответ" }]}
        eyebrow={siteConfig.legalName}
        title="Вопрос-ответ"
        lead="Доставка по городу и окрестности, оплата, подписка и оформление заказа — коротко и по делу."
      />

      <ScrollReveal>
      <div className="container mx-auto max-w-3xl py-[var(--space-xl)] md:py-[var(--space-xxl)]">
        <FAQAccordion items={SITE_FAQS} />

        <div className="mt-12 text-center bg-[var(--bg-secondary)] border border-[var(--color-line)] rounded-[var(--radius-md)] p-8 shadow-[var(--shadow-soft)]">
          <p className="text-lg mb-3 text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
            Не нашли ответ?
          </p>
          <p className="text-sm text-[var(--text-secondary)] mb-5">
            Напишите нам в Telegram — ответим быстро!
          </p>
          <TrackOutboundAnchor
            href={siteConfig.telegram}
            kind="telegram"
            source="faq"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Написать в Telegram
          </TrackOutboundAnchor>
        </div>
      </div>
      </ScrollReveal>
    </div>
  );
}
