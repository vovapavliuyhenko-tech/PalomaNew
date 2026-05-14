import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Панель</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary-token)]">
          Этап 1 завершён: каркас маршрутов. Этапы 6–7 дадут Supabase CRUD и авторизацию.
        </p>
      </div>
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Создать товар", href: "/admin/products/new" },
          { label: "Заказы", href: "/admin/orders" },
          { label: "Настройки", href: "/admin/settings" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-[var(--radius-md)] border border-[var(--color-border-token)] bg-white px-4 py-5 text-center text-sm transition hover:border-[var(--color-accent-primary)] hover:shadow-md"
          >
            {a.label}
          </Link>
        ))}
      </section>
    </div>
  );
}
