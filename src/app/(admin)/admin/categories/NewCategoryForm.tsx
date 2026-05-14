"use client";

import { useActionState } from "react";

import { createCategory } from "./actions";

const inputCls =
  "min-h-[40px] w-full rounded-md border border-[var(--color-border-token)] bg-white px-3 py-2 text-sm text-[var(--color-text-token)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]";

export default function NewCategoryForm() {
  const [state, formAction, pending] = useActionState(createCategory, null);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-[var(--color-border-token)] bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold tracking-tight">Новая категория</h2>
      {state?.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{state.error}</div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
            Название *
          </label>
          <input name="name" required className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
            Slug *
          </label>
          <input name="slug" required className={`${inputCls} font-mono text-xs`} placeholder="torty" />
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
            Порядок
          </label>
          <input name="display_order" type="number" defaultValue={0} className={inputCls} />
        </div>
        <div className="flex items-end gap-2 pb-1">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--color-text-secondary-token)]">
            <input type="checkbox" name="is_active" defaultChecked className="size-4 rounded border-[var(--color-border-token)]" />
            активна
          </label>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
          Описание
        </label>
        <textarea name="description" rows={2} className={`${inputCls} min-h-[72px]`} />
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
          URL изображения
        </label>
        <input name="image_url" type="url" className={`${inputCls} font-mono text-xs`} placeholder="https://" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--color-accent-primary)] px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {pending ? "Сохранение…" : "Добавить"}
      </button>
    </form>
  );
}
