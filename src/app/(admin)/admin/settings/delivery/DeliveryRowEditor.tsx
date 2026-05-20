"use client";

import { useActionState } from "react";

import { formatPrice } from "@/lib/utils";

import { updateDeliveryZone } from "./actions";

const inputCls =
  "min-h-[40px] w-full rounded-md border border-[var(--color-border-token)] bg-white px-3 py-2 text-sm tabular-nums text-[var(--color-text-token)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]";

type Row = {
  id: string;
  city: string;
  free_delivery_threshold: string | number;
  paid_delivery_cost: string | number | null;
  is_active: boolean;
};

export default function DeliveryRowEditor({ row }: { row: Row }) {
  const [state, formAction, pending] = useActionState(updateDeliveryZone, null);

  const th =
    typeof row.free_delivery_threshold === "string"
      ? Number.parseFloat(row.free_delivery_threshold)
      : Number(row.free_delivery_threshold ?? 0);
  const freeStr = Number.isFinite(th) ? String(th) : "";

  let paidStr = "";
  if (row.paid_delivery_cost !== null && row.paid_delivery_cost !== undefined) {
    const paid =
      typeof row.paid_delivery_cost === "string"
        ? Number.parseFloat(row.paid_delivery_cost)
        : Number(row.paid_delivery_cost);
    paidStr = Number.isFinite(paid) ? String(paid) : "";
  }

  return (
    <tr className="border-t border-[var(--color-border-token)] align-top">
      <td className="p-3" colSpan={5}>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="id" value={row.id} />
          {state?.error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{state.error}</div>
          ) : null}
          <div className="flex flex-wrap items-end gap-3 text-[10px] text-[var(--color-text-secondary-token)]">
            <span>
              текущее: порог{" "}
              <strong className="text-[var(--color-text-token)]">{formatPrice(Number.isFinite(th) ? th : 0)}</strong>
              {paidStr !== "" ? (
                <>
                  {" "}
                  · платно{" "}
                  <strong className="text-[var(--color-text-token)]">
                    {formatPrice(Number.isFinite(Number(paidStr)) ? Number(paidStr) : 0)}
                  </strong>
                </>
              ) : null}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
                Город *
              </label>
              <input name="city" required defaultValue={row.city} className={`${inputCls} font-normal`} />
            </div>
            <div className="lg:col-span-3">
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
                Бесплатно от (₽) *
              </label>
              <input name="free_delivery_threshold" type="number" step="0.01" min="0" required defaultValue={freeStr} className={inputCls} />
            </div>
            <div className="lg:col-span-3">
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
                Платная доставка (₽)
              </label>
              <input name="paid_delivery_cost" type="number" step="0.01" min="0" defaultValue={paidStr || ""} placeholder="пусто = нет" className={inputCls} />
            </div>
            <div className="flex flex-col justify-end lg:col-span-1">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--color-text-secondary-token)]">
                <input type="checkbox" name="is_active" defaultChecked={row.is_active} className="size-4 rounded border-[var(--color-border-token)]" />
                вкл.
              </label>
            </div>
            <div className="flex items-end lg:col-span-1">
              <button
                type="submit"
                disabled={pending}
                className="w-full whitespace-nowrap rounded-md border border-[var(--color-border-token)] bg-[var(--color-bg-secondary-token)] px-3 py-2 text-xs font-medium hover:bg-black/5 disabled:opacity-60"
              >
                {pending ? "…" : "Сохранить"}
              </button>
            </div>
          </div>
        </form>
      </td>
    </tr>
  );
}
