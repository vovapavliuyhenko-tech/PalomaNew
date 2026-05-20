import Link from "next/link";

import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";

function svc() {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

export default async function AdminProductsPage() {
  const client = svc();

  if (!client) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Товары</h1>
        <p className="text-sm text-[var(--color-text-secondary-token)]">
          Укажите <code className="rounded bg-black/5 px-1 font-mono text-[11px]">SUPABASE_SERVICE_ROLE_KEY</code>.
        </p>
      </div>
    );
  }

  const { data, error } = await client
    .from("products")
    .select("id,name,slug,price,is_available,is_ready_today,display_order,categories(name,slug)")
    .order("display_order", { ascending: true });

  if (error) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Товары</h1>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  type Row = {
    id: string;
    name: string;
    slug: string;
    price: string | number;
    is_available: boolean;
    is_ready_today: boolean;
    display_order: number;
    categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
  };

  function catLabel(raw: Row["categories"]): string {
    if (!raw) return "—";
    const c = Array.isArray(raw) ? raw[0] : raw;
    return c ? `${c.name}` : "—";
  }

  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Товары</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary-token)]">
            Каталог из Supabase. Фото добавляются в БД/storage отдельно.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Новый товар
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--color-border-token)] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--color-border-token)] bg-[var(--color-bg-secondary-token)] text-xs uppercase tracking-wider text-[var(--color-text-secondary-token)]">
            <tr>
              <th className="p-3 font-medium">Название</th>
              <th className="hidden p-3 font-medium sm:table-cell">Slug</th>
              <th className="p-3 font-medium">Категория</th>
              <th className="p-3 font-medium text-right">Цена</th>
              <th className="p-3 font-medium">Флаги</th>
              <th className="w-28 p-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const p = typeof r.price === "string" ? Number.parseFloat(r.price) : Number(r.price);
              const priceNum = Number.isFinite(p) ? p : 0;
              return (
                <tr key={r.id} className="border-t border-[var(--color-border-token)]">
                  <td className="p-3">
                    <div className="max-w-[220px] truncate font-medium text-[var(--color-text-token)]">{r.name}</div>
                    <div className="text-[10px] text-[var(--color-text-secondary-token)]">#{r.display_order}</div>
                  </td>
                  <td className="hidden max-w-[140px] truncate p-3 font-mono text-xs text-[var(--color-text-secondary-token)] sm:table-cell">
                    {r.slug}
                  </td>
                  <td className="p-3 text-xs text-[var(--color-text-secondary-token)]">{catLabel(r.categories)}</td>
                  <td className="p-3 text-right tabular-nums">{formatPrice(priceNum)}</td>
                  <td className="p-3 text-xs text-[var(--color-text-secondary-token)]">
                    {r.is_available ? "вкл" : "выкл"}
                    {r.is_ready_today ? " · сегодня" : ""}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/admin/products/${r.id}/edit`}
                      className="text-xs font-medium text-[var(--color-accent-primary)] hover:underline"
                    >
                      Изменить
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
