"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Flower2, ShoppingBag, MessageCircle, type LucideIcon } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { siteConfig } from "@/lib/siteConfig";
import { TrackOutboundAnchor } from "@/components/analytics/TrackOutboundAnchor";

type NavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  external?: boolean;
};

const navItems: NavItem[] = [
  { icon: Home, label: "Главная", href: "/" },
  { icon: Flower2, label: "Каталог", href: "/catalog" },
  { icon: ShoppingBag, label: "Корзина", href: "/cart" },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    href: siteConfig.whatsapp,
    external: true,
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { count } = useCartStore();
  const cartCount = mounted ? count() : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-card)_92%,transparent)] shadow-[0_-6px_32px_color-mix(in_srgb,var(--paloma-coal)_06%,transparent)] backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Мобильная навигация"
    >
      <div className="flex min-h-[60px] touch-manipulation">
        {navItems.map((item) => {
          const isActive =
            !item.external &&
            (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));

          if (item.external) {
            return (
              <TrackOutboundAnchor
                key={item.label}
                href={item.href}
                kind="whatsapp"
                source="mobile_nav"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 py-1 active:opacity-80"
              >
                <item.icon size={22} className="text-[var(--text-primary)]" strokeWidth={1.5} />
                <span className="text-[10px] text-[var(--text-primary)]">{item.label}</span>
              </TrackOutboundAnchor>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 py-1 active:opacity-80"
            >
              <div className="relative inline-flex">
                <item.icon
                  size={22}
                  className={isActive ? "text-[var(--color-cherry)]" : "text-[var(--text-primary)]"}
                  strokeWidth={1.5}
                />
                {item.href === "/cart" && mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-4 h-4 px-0.5 bg-[var(--color-cherry)] text-[var(--text-on-dark)] text-[10px] rounded-full flex items-center justify-center font-medium">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] ${isActive ? "text-[var(--color-cherry)]" : "text-[var(--text-primary)]"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
