import Link from "next/link";

import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function svc() {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

export default async function AdminWeddingPiggybankPage() {
  const client = svc();
  if (!client) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Заявки · свадебная копилка</h1>
        <p className="text-sm text-[var(--color-text-secondary-token)]">
          Задайте SUPABASE_SERVICE_ROLE_KEY на сервере.
        </p>
      </div>
    );
  }

  const { data, error } = await client
    .from("wedding_piggybank_requests")
    .select(
      "id, created_at, couple_name, wedding_date, phone, telegram, status, telegram_notified"
    )
    .order("created_at", { ascending: false })
    .limit(150);

  if (error?.message?.includes("relation") || error?.code === "42P01") {
    return (
      <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <h1 className="text-xl font-semibold tracking-tight">Заявки · свадебная копилка</h1>
        <p>
          В проекте нет таблицы <span className="font-mono">wedding_piggybank_requests</span>. Примените миграцию: файл{" "}
          <span className="font-mono">database/wedding-piggybank-requests.sql</span> в Supabase SQL Editor (или переустановите{" "}
          <span className="font-mono">database/schema.sql</span> для новых проектов).
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Заявки · свадебная копилка</h1>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Заявки · свадебная копилка</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary-token)]">
          Форма на <Link href="/wedding-piggybank" className="underline-offset-4 hover:underline">/wedding-piggybank</Link>{" "}
          сохраняет заявку в БД и дублирует в Telegram.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary-token)]">Пока пусто.</p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border-token)] bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border-token)] bg-[var(--color-bg-secondary-token)] text-xs uppercase tracking-wider text-[var(--color-text-secondary-token)]">
              <tr>
                <th className="px-4 py-3 font-medium">Пара · дата свадьбы</th>
                <th className="px-4 py-3 font-medium">Контакты</th>
                <th className="px-4 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: Record<string, unknown>) => {
                const telegram = typeof r.telegram === "string" && r.telegram.trim() ? r.telegram.trim() : null;
                return (
                  <tr key={String(r.id)} className="border-t border-[var(--color-border-token)] align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium">{String(r.couple_name)}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-secondary-token)]">
                        📅 {r.wedding_date != null ? String(r.wedding_date) : "—"}
                      </div>
                      <div className="mt-2 text-[10px] text-[var(--color-text-secondary-token)]">
                        поступило {formatDate(String(r.created_at))}
                      </div>
                    </td>
                    <td className="max-w-[220px] px-4 py-3">
                      <div className="font-mono text-xs">
                        <Link href={`tel:${String(r.phone).replace(/\s/g, "")}`} className="hover:underline">
                          {String(r.phone)}
                        </Link>
                      </div>
                      {telegram ? (
                        <div className="mt-1 text-xs">
                          @{telegram.replace(/^@/, "")}{" "}
                          <Link
                            href={`https://t.me/${telegram.replace(/^@/, "")}`}
                            className="text-[var(--color-accent-primary)] underline-offset-4 hover:underline"
                          >
                            t.me
                          </Link>
                        </div>
                      ) : (
                        <div className="mt-1 text-xs text-[var(--color-text-secondary-token)]">—</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">
                      <span className="rounded bg-black/5 px-2 py-0.5">{String(r.status)}</span>
                      <span
                        title="Отметка после попытки уведомить Telegram"
                        className="ml-1 rounded bg-black/5 px-2 py-0.5 text-[var(--color-text-secondary-token)]"
                      >
                        tg: {r.telegram_notified ? "да" : "нет"}
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
