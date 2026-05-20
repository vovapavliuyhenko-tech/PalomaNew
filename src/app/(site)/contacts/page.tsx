import type { Metadata } from "next";
import PageHero from "@/components/layout/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Phone, Mail, MapPin, Clock, Send, AtSign, MessageCircle } from "lucide-react";
import ContactMap from "@/components/shared/ContactMap";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { siteConfig } from "@/lib/siteConfig";
import PalomaLogo from "@/components/ui/PalomaLogo";
import { TrackOutboundAnchor } from "@/components/analytics/TrackOutboundAnchor";
import { definePageMeta } from "@/lib/seo";
import ContactLeadForm from "./ContactLeadForm";

export const metadata: Metadata = definePageMeta({
  title: `Контакты — ${siteConfig.legalName}, ${siteConfig.city}`,
  description: `Адрес, телефон и часы работы ${siteConfig.legalName} в ${siteConfig.city}. ${siteConfig.address}.`,
  path: "/contacts",
});

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Контакты", path: "/contacts" },
        ]}
      />
      <PageHero
        crumbs={[{ name: "Главная", href: "/" }, { name: "Контакты" }]}
        eyebrow={siteConfig.legalName}
        title="Контакты"
        lead={`${siteConfig.address}. Звоните, пишите в мессенджеры или заглядывайте в салон — подскажем по букету, кофе и доставке.`}
      />

      <ScrollReveal>
      <div className="container mx-auto py-[var(--space-xl)] md:py-[var(--space-xxl)]">
        <div className="grid min-w-0 lg:grid-cols-2 lg:gap-[var(--space-xl)] gap-12">
          <div className="min-w-0">
            <div className="mb-8">
              <PalomaLogo variant="dark" size="lg" showTagline />
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-[var(--color-cherry)]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)] mb-0.5">
                    Адрес
                  </p>
                  <p className="text-sm text-[var(--text-primary)]">{siteConfig.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-[var(--color-cherry)]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)] mb-0.5">
                    Часы работы
                  </p>
                  <p className="text-sm text-[var(--text-primary)]">{siteConfig.workingHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                  <Phone size={16} className="text-[var(--color-cherry)]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)] mb-0.5">
                    Телефон
                  </p>
                  <a
                    href={`tel:${siteConfig.phoneTel}`}
                    className="text-sm text-[var(--text-primary)] transition-colors hover:text-[var(--paloma-burgundy)]"
                  >
                    {siteConfig.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-[var(--color-cherry)]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)] mb-0.5">
                    Email
                  </p>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="text-sm text-[var(--text-primary)] transition-colors hover:text-[var(--paloma-burgundy)]"
                  >
                    {siteConfig.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={16} className="text-[var(--color-cherry)]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)] mb-0.5">
                    WhatsApp
                  </p>
                  <TrackOutboundAnchor
                    href={siteConfig.whatsapp}
                    kind="whatsapp"
                    source="contacts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--text-primary)] transition-colors hover:text-[var(--paloma-burgundy)]"
                  >
                    Написать в WhatsApp
                  </TrackOutboundAnchor>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                  <Send size={16} className="text-[var(--color-cherry)]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)] mb-0.5">
                    Telegram
                  </p>
                  <TrackOutboundAnchor
                    href={siteConfig.telegram}
                    kind="telegram"
                    source="contacts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--text-primary)] transition-colors hover:text-[var(--paloma-burgundy)]"
                  >
                    @palomaflowers
                  </TrackOutboundAnchor>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                  <AtSign size={16} className="text-[var(--color-cherry)]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)] mb-0.5">
                    Instagram
                  </p>
                  <a
                    href={siteConfig.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--text-primary)] transition-colors hover:text-[var(--paloma-burgundy)]"
                  >
                    {siteConfig.instagramHandle}
                  </a>
                </div>
              </div>

              <p className="text-sm text-[var(--text-secondary)] pt-2">
                Карта и маршрут:{" "}
                <a
                  href={siteConfig.maps}
                  className="text-[var(--color-cherry)] underline-offset-2 transition-colors hover:text-[var(--paloma-burgundy)] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  открыть в Яндекс.Картах
                </a>
              </p>

              <div className="mt-10 border-t border-[var(--border)] pt-8">
                <p className="text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)] mb-2">
                  Форма
                </p>
                <h2 className="mb-4 text-lg text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                  Написать нам
                </h2>
                <ContactLeadForm />
              </div>
            </div>
          </div>

          <div className="h-80 min-h-[350px] min-w-0 lg:h-full">
            <ContactMap />
          </div>
        </div>
      </div>
      </ScrollReveal>
    </div>
  );
}
