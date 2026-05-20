import Link from "next/link";

const links = [
  { href: "/admin/settings/delivery", label: "Доставка" },
  { href: "/admin/settings/contacts", label: "Контакты" },
  { href: "/admin/settings/cafe", label: "Café" },
  { href: "/admin/settings/gifts", label: "Подарки" },
] as const;

export default function AdminSettingsHubPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Настройки</h1>
      <nav className="grid gap-2 sm:grid-cols-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg border border-[var(--color-border-token)] px-4 py-3 text-sm transition hover:bg-[var(--color-bg-secondary-token)]"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
