"use client";

import { useActionState } from "react";

import type { FormState } from "./actions";
import { updateCategory } from "./actions";

const inputCls =
  "min-h-[40px] w-full rounded-md border border-[var(--color-border-token)] bg-white px-3 py-2 text-sm text-[var(--color-text-token)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]";

type Row = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  description: string | null;
  image_url: string | null;
};

export default function CategoryRowEditor({ row }: { row: Row }) {
  const [state, formAction, pending] = useActionState(updateCategory, null);

  return (
    <tr className="border-t border-[var(--color-border-token)] align-top">
      <td className="p-3" colSpan={5}>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="id" value={row.id} />
          {state?.error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{state.error}</div>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-2">
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
                Порядок
              </label>
              <input
                name="display_order"
                type="number"
                defaultValue={row.display_order}
                className={inputCls}
              />
            </div>
            <div className="lg:col-span-3">
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
                Название *
              </label>
              <input name="name" required defaultValue={row.name} className={inputCls} />
            </div>
            <div className="lg:col-span-3">
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
                Slug *
              </label>
              <input
                name="slug"
                required
                defaultValue={row.slug}
                className={`${inputCls} font-mono text-xs`}
              />
            </div>
            <div className="flex flex-col justify-end lg:col-span-2">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--color-text-secondary-token)]">
                <input type="checkbox" name="is_active" defaultChecked={row.is_active} className="size-4 rounded border-[var(--color-border-token)]" />
                активна
              </label>
            </div>
            <div className="flex items-end lg:col-span-2">
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-md border border-[var(--color-border-token)] bg-[var(--color-bg-secondary-token)] px-3 py-2 text-xs font-medium hover:bg-black/5 disabled:opacity-60"
              >
                {pending ? "…" : "Сохранить"}
              </button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
                Описание
              </label>
              <textarea name="description" rows={2} defaultValue={row.description ?? ""} className={`${inputCls} min-h-[72px]`} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
                URL изображения
              </label>
              <input
                name="image_url"
                type="url"
                defaultValue={row.image_url ?? ""}
                className={`${inputCls} font-mono text-xs`}
              />
            </div>
          </div>
        </form>
      </td>
    </tr>
  );
}
