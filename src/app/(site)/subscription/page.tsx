import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/seo/FaqPageJsonLd";
import SubscriptionLeadForm from "./SubscriptionLeadForm";
import { siteConfig } from "@/lib/siteConfig";
import { formatPrice } from "@/lib/utils";
import { definePageMeta } from "@/lib/seo";
import { SUBSCRIPTION_PAGE_FAQ, SUBSCRIPTION_PLANS } from "@/data/subscription-content";

export const metadata: Metadata = definePageMeta({
  title: `Цветочная подписка — свежие цветы каждую неделю | ${siteConfig.legalName}`,
  description: `Регулярная доставка свежих букетов от ${siteConfig.legalName}. Сезон, акваваза и забота флориста — условия согласуем персонально.`,
  path: "/subscription",
});

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <FaqPageJsonLd items={SUBSCRIPTION_PAGE_FAQ} />
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Подписка", path: "/subscription" },
        ]}
      />
      <PageHero
        align="center"
        maxWidthClass="max-w-3xl"
        crumbs={[{ name: "Главная", href: "/" }, { name: "Подписка" }]}
        eyebrow="Цветочная подписка"
        title={`Цветы на регулярной основе — в ритме ${siteConfig.name}`}
        lead="Выберите тариф и оставьте заявку: мы согласуем старт, доставку и пожелания по палитре."
      />

      <ScrollReveal>
      <div className="container mx-auto max-w-6xl py-[var(--space-xl)] md:py-[var(--space-xxl)]">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-[var(--space-lg)]">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`rounded-[var(--radius-md)] p-6 relative transition-shadow duration-[var(--dur-slow)] ease-[var(--ease-soft)] ${
                plan.popular
                  ? "bg-[var(--color-coal)] text-[var(--text-on-dark)] shadow-[var(--shadow-card)] border border-[color-mix(in_srgb,var(--text-on-dark)_12%,transparent)]"
                  : "border border-[var(--color-line)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)]"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-cherry)] text-[var(--text-on-dark)] text-xs px-3 py-1 rounded-full">
                  Популярный
                </span>
              )}
              <h3
                className={`text-2xl mb-1 ${plan.popular ? "text-[var(--text-on-dark)]" : "text-[var(--text-primary)]"}`}
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {plan.name}
              </h3>
              <p
                className={`text-xs mb-4 ${
                  plan.popular
                    ? "text-[color-mix(in_srgb,var(--text-on-dark)_68%,transparent)]"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                {plan.description}
              </p>
              <div className="mb-5">
                <span
                  className={`text-3xl font-light ${plan.popular ? "text-[var(--text-on-dark)]" : "text-[var(--text-primary)]"}`}
                >
                  {formatPrice(plan.price)}
                </span>
                <span
                  className={`text-xs ml-1 ${
                    plan.popular
                      ? "text-[color-mix(in_srgb,var(--text-on-dark)_58%,transparent)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  / {plan.freq}
                </span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs">
                    <Check size={13} className="text-[var(--color-cherry)] flex-shrink-0" />
                    <span
                      className={
                        plan.popular
                          ? "text-[color-mix(in_srgb,var(--text-on-dark)_82%,transparent)]"
                          : "text-[var(--text-secondary)]"
                      }
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="#subscription-lead"
                className={`block text-center py-2.5 text-sm uppercase tracking-[var(--ls-wider)] border transition-colors rounded-[var(--radius-md)] ${
                  plan.popular
                    ? "border-[var(--color-cherry)] text-[var(--color-cherry)] hover:bg-[var(--color-cherry)] hover:text-[var(--text-on-dark)]"
                    : "border-[var(--text-primary)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--text-on-dark)]"
                }`}
              >
                Оформить
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 mx-auto max-w-xl">
          <SubscriptionLeadForm />
        </div>
      </div>
      </ScrollReveal>

      <ScrollReveal>
      <div className="container mx-auto max-w-3xl py-[var(--space-xl)] md:py-[var(--space-xxl)]">
        <h2 className="text-center mb-8 text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
          Вопросы и ответы
        </h2>
        <div className="space-y-4">
          {SUBSCRIPTION_PAGE_FAQ.map((item) => (
            <div
              key={item.question}
              className="bg-[var(--bg-secondary)] border border-[var(--color-line)] rounded-[var(--radius-md)] p-5 shadow-[var(--shadow-soft)]"
            >
              <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{item.question}</p>
              <p className="text-sm text-[var(--text-secondary)]">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
      </ScrollReveal>
    </div>
  );
}
