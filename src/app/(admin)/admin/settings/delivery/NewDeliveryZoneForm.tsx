"use client";

import { useActionState } from "react";

import { createDeliveryZone } from "./actions";

const inputCls =
  "min-h-[40px] w-full rounded-md border border-[var(--color-border-token)] bg-white px-3 py-2 text-sm tabular-nums text-[var(--color-text-token)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]";

export default function NewDeliveryZoneForm() {
  const [state, formAction, pending] = useActionState(createDeliveryZone, null);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-[var(--color-border-token)] bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold tracking-tight">Новая зона</h2>
      {state?.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{state.error}</div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
            Город *
          </label>
          <input name="city" required className={`${inputCls} font-normal`} />
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
            Бесплатно от (₽) *
          </label>
          <input name="free_delivery_threshold" type="number" step="0.01" min="0" required defaultValue={5000} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
            Платная доставка (₽)
          </label>
          <input name="paid_delivery_cost" type="number" step="0.01" min="0" placeholder="опционально" className={inputCls} />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--color-text-secondary-token)]">
            <input type="checkbox" name="is_active" defaultChecked className="size-4 rounded border-[var(--color-border-token)]" />
            активна
          </label>
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--color-accent-primary)] px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {pending ? "Сохранение…" : "Добавить зону"}
      </button>
    </form>
  );
}
