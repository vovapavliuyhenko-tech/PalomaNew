import Link from "next/link";

import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { formatDate, formatPrice } from "@/lib/utils";

function svc() {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

type OrderRow = {
  id: string;
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  total: number | string | null;
  order_status: string;
  payment_status: string;
  delivery_date: string | null;
};

export default async function AdminOrdersPage() {
  const client = svc();
  if (!client) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Заказы</h1>
        <p className="text-sm text-[var(--color-text-secondary-token)]">
          Задайте{" "}
          <code className="rounded bg-black/5 px-1 font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code> для загрузки
          заказов из базы (только серверная переменная, не попадает в клиент).
        </p>
      </div>
    );
  }

  const { data, error } = await client
    .from("orders")
    .select(
      "id, order_number, created_at, customer_name, customer_phone, total, order_status, payment_status, delivery_date"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Заказы</h1>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  const orders = (data ?? []) as OrderRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Заказы</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary-token)]">
          Последние сохранённые заказы из Supabase. Доступ к /admin на продакшене ограничьте middleware или Supabase Auth.
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary-token)]">Заказов пока нет.</p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border-token)] bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border-token)] bg-[var(--color-bg-secondary-token)] text-xs uppercase tracking-wider text-[var(--color-text-secondary-token)]">
              <tr>
                <th className="px-4 py-3 font-medium">№</th>
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Клиент</th>
                <th className="px-4 py-3 font-medium">Доставка</th>
                <th className="px-4 py-3 font-medium text-right">Сумма</th>
                <th className="px-4 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const totalNum = typeof o.total === "string" ? Number.parseFloat(o.total) : Number(o.total ?? 0);
                return (
                  <tr key={o.id} className="border-t border-[var(--color-border-token)]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-mono text-xs text-[var(--color-accent-primary)] hover:underline"
                      >
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[var(--color-text-secondary-token)]">
                      {formatDate(o.created_at)}
                    </td>
                    <td className="max-w-[200px] px-4 py-3">
                      <div className="truncate font-medium text-[var(--color-text-token)]">{o.customer_name}</div>
                      <div className="truncate text-xs text-[var(--color-text-secondary-token)]">{o.customer_phone}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[var(--color-text-secondary-token)]">
                      {o.delivery_date ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {formatPrice(Number.isFinite(totalNum) ? totalNum : 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-black/5 px-2 py-0.5 text-xs">{o.order_status}</span>{" "}
                      <span className="rounded bg-black/5 px-2 py-0.5 text-xs text-[var(--color-text-secondary-token)]">
                        {o.payment_status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
