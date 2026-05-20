"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";

import { Logo } from "@/components/layout/Logo";
import MobileMenu from "@/components/layout/MobileMenu";
import { useCartStore } from "@/lib/store/cartStore";
import { useUIStore } from "@/lib/store/uiStore";
import { siteConfig } from "@/lib/siteConfig";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/catalog", label: "Каталог" },
  { href: "/coffee", label: "Кофейня" },
  { href: "/wedding", label: "Свадьбы" },
  { href: "/events", label: "Мероприятия" },
  { href: "/delivery", label: "Доставка" },
  { href: "/contacts", label: "Контакты" },
] as const;

function linkActive(pathname: string, href: string) {
  if (href === "/catalog")
    return (
      pathname === "/catalog" ||
      pathname.startsWith("/catalog/") ||
      pathname.startsWith("/product/")
    );
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { count, toggleCart } = useCartStore();
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();
  const cartCount = mounted ? count() : 0;

  const onHero = pathname === "/" && !isScrolled;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solidBar = isScrolled || pathname !== "/";

  const barTint = solidBar
    ? "border-b border-[color-mix(in_srgb,var(--color-ink)_8%,transparent)] bg-[color-mix(in_srgb,var(--color-cream)_88%,transparent)] shadow-[0_1px_0_color-mix(in_srgb,var(--color-ink)_6%,transparent)] backdrop-blur-[10px]"
    : "border-b border-transparent bg-transparent";

  const ink = "text-[var(--color-ink)]";
  const cream = "text-[var(--color-cream)]";
  const navTone = onHero && !isScrolled ? cream : ink;
  const ringTone = onHero && !isScrolled ? "focus-visible:outline-[var(--color-cream)]" : "focus-visible:outline-[var(--color-ink)]";

  return (
    <>
      <header
        className={cn("fixed left-0 right-0 top-0 z-[var(--z-header)]", barTint)}
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          minHeight: "calc(var(--header-h-mobile) + env(safe-area-inset-top, 0px))",
        }}
      >
        <div
          className="mx-auto flex w-full max-w-[var(--container-max)] min-h-[var(--header-h-mobile)] items-center gap-2 px-[var(--container-gutter)] lg:hidden"
        >
          <button
            type="button"
            onClick={toggleMobileMenu}
            className={cn(
              "flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] transition-opacity hover:opacity-70",
              navTone,
              ringTone,
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            )}
            aria-label="Меню"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="size-6" strokeWidth={1.5} /> : <Menu className="size-6" strokeWidth={1.5} />}
          </button>

          <div className="flex min-w-0 flex-1 justify-center">
            <Logo size="sm" tone={onHero && !isScrolled ? "cream" : "ink"} />
          </div>

          <button
            type="button"
            onClick={toggleCart}
            className={cn(
              "relative flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] transition-opacity hover:opacity-70",
              navTone,
              ringTone,
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            )}
            aria-label="Корзина"
          >
            <ShoppingBag className="size-6" strokeWidth={1.5} />
            {mounted && cartCount > 0 ? (
              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center bg-[var(--color-bordeaux)] px-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-cream)]">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            ) : null}
          </button>
        </div>

        <div
          className="mx-auto hidden min-h-[var(--header-h-desktop)] w-full max-w-[var(--container-max)] grid-cols-[auto_1fr_auto] items-center gap-8 px-[var(--container-gutter)] lg:grid"
        >
          <Logo size="sm" tone={onHero && !isScrolled ? "cream" : "ink"} />

          <nav
            aria-label="Основная навигация"
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2"
          >
            {NAV_LINKS.map(({ href, label }) => {
              const active = linkActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  data-active={active ? "true" : "false"}
                  className={cn(
                    "nav-ds-link font-[family-name:var(--font-body),sans-serif] text-[11px] font-medium uppercase tracking-[0.08em]",
                    navTone,
                    active && "nav-ds-link--active"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-end gap-4">
            <a
              href={`tel:${siteConfig.phoneTel}`}
              className={cn(
                "font-[family-name:var(--font-body),sans-serif] text-sm tracking-wide",
                navTone,
                "hover:opacity-80",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                ringTone
              )}
            >
              {siteConfig.phone}
            </a>
            <button
              type="button"
              onClick={toggleCart}
              className={cn(
                "relative flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] transition-opacity hover:opacity-70",
                navTone,
                ringTone,
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              )}
              aria-label="Корзина"
            >
              <ShoppingBag className="size-6" strokeWidth={1.5} />
              {mounted && cartCount > 0 ? (
                <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center bg-[var(--color-bordeaux)] px-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-cream)]">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu />
    </>
  );
}
