"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, X } from "lucide-react";

import { Logo } from "@/components/layout/Logo";
import { H3 } from "@/components/ui/typography";
import { TrackOutboundAnchor } from "@/components/analytics/TrackOutboundAnchor";
import { IconInstagram } from "@/components/ui/icons/social";
import { IconTelegram, IconWhatsapp } from "@/components/ui/icons/social";
import { ADDRESS } from "@/lib/constants";
import { useUIStore } from "@/lib/store/uiStore";
import { siteConfig } from "@/lib/siteConfig";
import { cn } from "@/lib/utils";

const PRIMARY_LINKS = [
  { href: "/catalog", label: "Каталог" },
  { href: "/coffee", label: "Кофейня" },
  { href: "/wedding", label: "Свадьбы" },
  { href: "/events", label: "Мероприятия" },
  { href: "/delivery", label: "Доставка" },
  { href: "/contacts", label: "Контакты" },
] as const;

const MORE_LINKS = [
  { href: "/gifts", label: "Вазы и подарки" },
  { href: "/subscription", label: "Подписка на цветы" },
  { href: "/faq", label: "Вопрос–ответ" },
  { href: "/about", label: "О нас" },
  { href: "/blog", label: "Блог" },
] as const;

export default function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  return (
    <AnimatePresence>
      {isMobileMenuOpen ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[115] bg-[var(--color-ink)]/25 backdrop-blur-[2px] lg:hidden"
            aria-label="Закрыть меню"
            onClick={closeMobileMenu}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Меню Paloma"
            className="fixed inset-0 z-[116] flex flex-col bg-[var(--color-ink)] text-[var(--color-cream)] lg:hidden"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[var(--color-cream)]/15 px-[var(--container-pad)] py-4"
              style={{ paddingTop: "max(1rem, env(safe-area-inset-top, 0px))" }}
            >
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-cream)]"
              >
                <Logo size="sm" tone="cream" asLink={false} />
              </Link>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-sm text-[var(--color-cream)] transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-cream)]"
                aria-label="Закрыть меню"
              >
                <X className="size-7" strokeWidth={1.25} />
              </button>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto hide-scrollbar px-[var(--container-pad)] py-6">
              <ul className="space-y-1">
                {PRIMARY_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={closeMobileMenu}
                      className={cn(
                        "block py-3 font-[family-name:var(--font-display),serif] text-[clamp(1.35rem,5vw,2rem)] leading-[1.05] tracking-[-0.02em] text-[var(--color-cream)] transition-opacity hover:opacity-75",
                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cream)]"
                      )}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              <ul className="mt-8 space-y-1 border-t border-[var(--color-cream)]/15 pt-6">
                {MORE_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={closeMobileMenu}
                      className="block py-2 font-[family-name:var(--font-body),sans-serif] text-base text-[var(--color-cream)]/85 transition-colors hover:text-[var(--color-cream)]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div
              className="space-y-4 border-t border-[var(--color-cream)]/15 bg-[color-mix(in_srgb,var(--color-ink)_92%,transparent)] px-[var(--container-pad)] py-6"
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))" }}
            >
              <H3 as="p" className="!text-[clamp(1rem,3vw,1.25rem)] text-[var(--color-cream)]">
                {ADDRESS}
              </H3>

              <a
                href={`tel:${siteConfig.phoneTel}`}
                className="inline-flex items-center gap-2 text-lg text-[var(--color-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-cream)]"
              >
                <Phone className="size-5 shrink-0" strokeWidth={1.25} />
                {siteConfig.phone}
              </a>

              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <TrackOutboundAnchor
                  href={siteConfig.whatsapp}
                  kind="whatsapp"
                  source="mobile_menu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[var(--color-cream)]/90 hover:text-[var(--color-cream)]"
                >
                  <IconWhatsapp className="size-5" />
                  WhatsApp
                </TrackOutboundAnchor>
                <TrackOutboundAnchor
                  href={siteConfig.telegram}
                  kind="telegram"
                  source="mobile_menu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[var(--color-cream)]/90 hover:text-[var(--color-cream)]"
                >
                  <IconTelegram className="size-5" />
                  Telegram
                </TrackOutboundAnchor>
                <a
                  href={siteConfig.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[var(--color-cream)]/90 hover:text-[var(--color-cream)]"
                >
                  <IconInstagram className="size-5" />
                  Instagram
                </a>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
