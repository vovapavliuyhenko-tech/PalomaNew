import type { Metadata, Viewport } from "next";
import Link from "next/link";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

export const metadata: Metadata = {
  title: { default: "Админ-панель", template: "%s · PALOMA admin" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#fafaf8",
};

export default function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-token)] antialiased font-sans">
      <aside className="fixed left-0 top-0 z-10 hidden h-full w-56 flex-col gap-8 border-r border-[var(--color-border-token)] bg-[var(--color-bg-secondary-token)] px-5 py-8 text-sm lg:flex">
        <Link href="/admin" className="font-semibold tracking-[0.12em] text-[var(--color-accent-primary)]">
          PALOMA admin
        </Link>
        <nav className="flex flex-col gap-2 [&_a]:rounded-md [&_a]:px-3 [&_a]:py-2 [&_a]:text-[var(--color-text-secondary-token)] [&_a]:transition-colors [&_a]:hover:bg-black/5 hover:[&_a]:text-[var(--color-text-token)]">
          <Link href="/admin/products">Товары</Link>
          <Link href="/admin/categories">Категории</Link>
          <Link href="/admin/orders">Заказы</Link>
          <Link href="/admin/event-requests">Мероприятия</Link>
          <Link href="/admin/subscription-leads">Подписки</Link>
          <Link href="/admin/wedding-piggybank">Свадебная копилка</Link>
          <Link href="/admin/settings">Настройки</Link>
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <AdminLogoutButton />
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary-token)] hover:text-[var(--color-accent-primary)]"
          >
            На сайт
          </Link>
        </div>
      </aside>
      <div className="lg:pl-56">
        <header className="flex items-center justify-between border-b border-[var(--color-border-token)] bg-white/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <Link href="/admin" className="font-medium text-[var(--color-accent-primary)]">
            PALOMA admin
          </Link>
          <div className="flex items-center gap-2">
            <AdminLogoutButton />
            <Link href="/" className="text-xs text-[var(--color-text-secondary-token)] underline-offset-4 hover:underline">
              Сайт
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </div>
    </div>
  );
}
