import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";

import { Logo } from "@/components/layout/Logo";
import { Caption } from "@/components/ui/typography";
import { IconInstagram, IconTelegram, IconWhatsapp } from "@/components/ui/icons/social";
import { TrackOutboundAnchor } from "@/components/analytics/TrackOutboundAnchor";
import { ADDRESS } from "@/lib/constants";
import { siteConfig } from "@/lib/siteConfig";

export default function Footer() {
  const y = new Date().getFullYear();

  return (
    <footer className="border-t border-[color-mix(in_srgb,var(--color-cream)_12%,transparent)] bg-[var(--color-ink)] text-[var(--color-cream)]">
      <div className="container mx-auto py-[var(--section-py-compact)] lg:py-[var(--section-py-desktop)]">
        <div className="grid grid-cols-1 gap-y-12 gap-x-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo size="md" tone="cream" className="mb-4" />
            <p className="mb-6 max-w-xs font-[family-name:var(--font-body),sans-serif] text-sm leading-relaxed text-[var(--color-cream)]/75">
              Цветочный бутик и кофейня в Новороссийске
            </p>
            <div className="flex gap-2">
              <TrackOutboundAnchor
                href={siteConfig.telegram}
                kind="telegram"
                source="footer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-cream)]/20 text-[var(--color-cream)] transition-colors hover:border-[var(--color-orange)] hover:text-[var(--color-orange)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-cream)]"
                aria-label="Telegram"
              >
                <IconTelegram className="size-4" />
              </TrackOutboundAnchor>
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-cream)]/20 text-[var(--color-cream)] transition-colors hover:border-[var(--color-orange)] hover:text-[var(--color-orange)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-cream)]"
                aria-label="Instagram"
              >
                <IconInstagram className="size-4" />
              </a>
              <TrackOutboundAnchor
                href={siteConfig.whatsapp}
                kind="whatsapp"
                source="footer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-cream)]/20 text-[var(--color-cream)] transition-colors hover:border-[var(--color-orange)] hover:text-[var(--color-orange)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-cream)]"
                aria-label="WhatsApp"
              >
                <IconWhatsapp className="size-4" />
              </TrackOutboundAnchor>
            </div>
          </div>

          <div>
            <Caption className="mb-5 block text-[var(--color-cream)]/50">Каталог</Caption>
            <ul className="space-y-2.5">
              {[
                ["Букеты", "/catalog/bukety"],
                ["Онлайн-витрина", "/catalog/online-vitrina"],
                ["Композиции", "/catalog/kompozicii"],
                ["Монобукеты", "/catalog/mono"],
                ["Вазы и подарки", "/gifts"],
                ["Кофейня", "/coffee"],
                ["Свадьбы", "/wedding"],
                ["Мероприятия", "/events"],
              ].map(([label, href]) => (
                <li key={href + label}>
                  <Link
                    href={href}
                    className="text-sm text-[var(--color-cream)]/70 transition-colors hover:text-[var(--color-orange)]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Caption className="mb-5 block text-[var(--color-cream)]/50">Клиентам</Caption>
            <ul className="space-y-2.5">
              {[
                ["Доставка", "/delivery"],
                ["Оплата", "/payment"],
                ["Уход за букетом", "/care"],
                ["Вопрос–ответ", "/faq"],
                ["Контакты", "/contacts"],
                ["Подарочные сертификаты", "/gifts"],
                ["Подписка", "/subscription"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-[var(--color-cream)]/70 transition-colors hover:text-[var(--color-orange)]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Caption className="mb-5 block text-[var(--color-cream)]/50">Контакты</Caption>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-[var(--color-cream)]/75">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[var(--color-orange)]" aria-hidden />
                {ADDRESS}
              </li>
              <li className="flex items-center gap-2.5 text-sm text-[var(--color-cream)]/75">
                <Clock className="size-4 shrink-0 text-[var(--color-orange)]" aria-hidden />
                {siteConfig.workingHours}
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.phoneTel}`}
                  className="inline-flex items-center gap-2.5 text-sm text-[var(--color-cream)]/80 transition-colors hover:text-[var(--color-orange)]"
                >
                  <Phone className="size-4 shrink-0 text-[var(--color-orange)]" aria-hidden />
                  {siteConfig.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-cream)]/15">
        <div className="container mx-auto flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--color-cream)]/45">
            © {y} Paloma Flowers. Все права защищены.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Caption className="text-[var(--color-cream)]/40">Оплата</Caption>
            <span className="border border-[var(--color-cream)]/25 px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--color-cream)]/60">
              Карта
            </span>
            <span className="border border-[var(--color-cream)]/25 px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--color-cream)]/60">
              СБП
            </span>
            <span className="border border-[var(--color-cream)]/25 px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--color-cream)]/60">
              Наличные
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 sm:justify-end">
            {[
              ["Политика конфиденциальности", "/privacy"],
              ["Оферта", "/offer"],
              ["Согласие", "/consent"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-[var(--color-cream)]/45 transition-colors hover:text-[var(--color-orange)]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
