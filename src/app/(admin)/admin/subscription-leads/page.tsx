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

export default async function AdminSubscriptionLeadsPage() {
  const client = svc();
  if (!client) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Заявки · подписка</h1>
        <p className="text-sm text-[var(--color-text-secondary-token)]">
          Задайте SUPABASE_SERVICE_ROLE_KEY на сервере.
        </p>
      </div>
    );
  }

  const { data, error } = await client
    .from("subscription_orders")
    .select(
      "id, created_at, customer_name, customer_phone, size, frequency, price, status, payment_status, add_vase, add_secateur"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Заявки · подписка</h1>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Заявки · подписка</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary-token)]">
          Форма на странице /subscription сохраняет лид здесь и дублирует менеджеру в Telegram.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary-token)]">Пока пусто.</p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border-token)] bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border-token)] bg-[var(--color-bg-secondary-token)] text-xs uppercase tracking-wider text-[var(--color-text-secondary-token)]">
              <tr>
                <th className="px-4 py-3 font-medium">Клиент · тариф</th>
                <th className="px-4 py-3 font-medium">Ритм</th>
                <th className="px-4 py-3 font-medium text-right">Сумма</th>
                <th className="px-4 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: Record<string, unknown>) => {
                const price = typeof r.price === "string" ? Number.parseFloat(r.price) : Number(r.price ?? 0);
                return (
                  <tr key={String(r.id)} className="border-t border-[var(--color-border-token)] align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium">{String(r.customer_name)}</div>
                      <div className="font-mono text-xs text-[var(--color-text-secondary-token)]">
                        <Link href={`tel:${String(r.customer_phone).replace(/\s/g, "")}`} className="hover:underline">
                          {String(r.customer_phone)}
                        </Link>
                      </div>
                      <div className="mt-1 text-xs font-medium text-[var(--paloma-deep-cherry)]">{String(r.size)}</div>
                      <div className="mt-2 text-[10px] text-[var(--color-text-secondary-token)]">
                        {formatDate(String(r.created_at))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary-token)]">
                      {Number(r.frequency) === 2 ? "раз в 2 недели" : "еженедельно"}
                      {r.add_vase ? " · ваза" : ""}
                      {r.add_secateur ? " · секатор" : ""}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {formatPrice(Number.isFinite(price) ? price : 0)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">
                      <span className="rounded bg-black/5 px-2 py-0.5">{String(r.status)}</span>
                      <span className="ml-1 rounded bg-black/5 px-2 py-0.5 text-[var(--color-text-secondary-token)]">
                        {String(r.payment_status)}
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
