import Link from "next/link";

import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

function svc() {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

export default async function AdminEventRequestsPage() {
  const client = svc();
  if (!client) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Заявки · мероприятия</h1>
        <p className="text-sm text-[var(--color-text-secondary-token)]">
          Задайте SUPABASE_SERVICE_ROLE_KEY на сервере.
        </p>
      </div>
    );
  }

  const { data, error } = await client
    .from("event_requests")
    .select(
      "id, created_at, event_type, name, phone, event_date, budget, status, telegram_notified"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Заявки · мероприятия</h1>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Заявки · мероприятия</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary-token)]">
          Квиз «События» на сайте пишет сюда и дублирует в Telegram.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary-token)]">Пока пусто.</p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border-token)] bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border-token)] bg-[var(--color-bg-secondary-token)] text-xs uppercase tracking-wider text-[var(--color-text-secondary-token)]">
              <tr>
                <th className="px-4 py-3 font-medium">Тип · дата</th>
                <th className="px-4 py-3 font-medium">Клиент</th>
                <th className="px-4 py-3 font-medium">Бюджет</th>
                <th className="px-4 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: Record<string, unknown>) => (
                <tr key={String(r.id)} className="border-t border-[var(--color-border-token)] align-top">
                  <td className="px-4 py-3">
                    <div className="font-medium">{String(r.event_type)}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-secondary-token)]">
                      {r.event_date != null ? String(r.event_date) : "—"}
                    </div>
                    <div className="mt-2 text-[10px] text-[var(--color-text-secondary-token)]">
                      {formatDate(String(r.created_at))}
                    </div>
                  </td>
                  <td className="max-w-[200px] px-4 py-3">
                    <div className="truncate font-medium">{String(r.name)}</div>
                    <div className="truncate font-mono text-xs text-[var(--color-text-secondary-token)]">
                      <Link href={`tel:${String(r.phone).replace(/\s/g, "")}`} className="hover:underline">
                        {String(r.phone)}
                      </Link>
                    </div>
                  </td>
                  <td className="whitespace-pre-wrap px-4 py-3 text-[var(--color-text-secondary-token)]">
                    {String(r.budget ?? "")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">
                    <span className="rounded bg-black/5 px-2 py-0.5">{String(r.status)}</span>
                    {r.telegram_notified ? (
                      <span className="ml-1 text-[var(--color-text-secondary-token)]">· TG ✓</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
