import { createSupabaseServiceClient } from "@/lib/supabase/admin";

import DeliveryRowEditor from "./DeliveryRowEditor";
import NewDeliveryZoneForm from "./NewDeliveryZoneForm";

export const dynamic = "force-dynamic";

function svc() {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

export default async function AdminSettingsDeliveryPage() {
  const client = svc();

  if (!client) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold tracking-tight">Зоны и тарифы</h1>
        <p className="text-sm text-[var(--color-text-secondary-token)]">Нужен SUPABASE_SERVICE_ROLE_KEY.</p>
      </div>
    );
  }

  const { data, error } = await client
    .from("delivery_settings")
    .select("id,city,free_delivery_threshold,paid_delivery_cost,is_active")
    .order("city", { ascending: true });

  if (error) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Зоны и тарифы</h1>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Зоны и тарифы</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary-token)]">
          Используются в оформлении заказа при расчёте доставки. Платная стоимость может быть пустой (нет фиксированной суммы или уточняется отдельно).
        </p>
      </div>

      <NewDeliveryZoneForm />

      <div className="overflow-x-auto rounded-lg border border-[var(--color-border-token)] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--color-border-token)] bg-[var(--color-bg-secondary-token)] text-xs uppercase tracking-wider text-[var(--color-text-secondary-token)]">
            <tr>
              <th className="p-3 font-medium">Зона</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="p-6 text-[var(--color-text-secondary-token)]">Зон нет — добавьте первую.</td>
              </tr>
            ) : (
              rows.map((r: Record<string, unknown>) => {
                const free = r.free_delivery_threshold;
                const paid = r.paid_delivery_cost;
                return (
                <DeliveryRowEditor
                  key={String(r.id)}
                  row={{
                    id: String(r.id),
                    city: String(r.city ?? ""),
                    free_delivery_threshold:
                      typeof free === "string" || typeof free === "number" ? free : 0,
                    paid_delivery_cost:
                      paid === undefined || paid === null
                        ? null
                        : typeof paid === "string" || typeof paid === "number"
                          ? paid
                          : null,
                    is_active: Boolean(r.is_active),
                  }}
                />
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
