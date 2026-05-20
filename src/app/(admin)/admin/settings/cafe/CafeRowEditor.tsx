"use client";

import { useActionState } from "react";

import type { CoffeeCatalogPickRow } from "@/lib/catalog/fetchCoffeeCategoryProductsForPicker";

import CatalogProductPickSelect from "./CatalogProductPickSelect";
import { updateCafeItem } from "./actions";
import { formatPrice } from "@/lib/utils";

const inputCls =
  "min-h-[40px] w-full rounded-md border border-[var(--color-border-token)] bg-white px-3 py-2 text-sm text-[var(--color-text-token)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]";

type Row = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: string | number;
  image_url: string | null;
  display_order: number;
  is_available: boolean;
  product_id: string | null;
};

export default function CafeRowEditor({
  row,
  catalogOptions,
}: {
  row: Row;
  catalogOptions: CoffeeCatalogPickRow[];
}) {
  const [state, formAction, pending] = useActionState(updateCafeItem, null);

  const priceStr =
    typeof row.price === "string" ? row.price.replace(/,/g, ".") : String(row.price ?? "0");

  return (
    <tr className="border-t border-[var(--color-border-token)] align-top">
      <td className="p-3" colSpan={6}>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="id" value={row.id} />
          {state?.error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{state.error}</div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-[var(--color-text-secondary-token)]">
            <span className="font-mono">{row.category}</span>
            <span>· было {formatPrice(Number.parseFloat(priceStr))}</span>
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
              Товар каталога
            </label>
            <CatalogProductPickSelect
              options={catalogOptions}
              name="product_id"
              defaultValue={row.product_id}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">Название *</label>
              <input name="name" required defaultValue={row.name} className={inputCls} />
            </div>
            <div className="lg:col-span-2">
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">Категория</label>
              <input name="category" required defaultValue={row.category} className={`${inputCls} font-mono text-xs`} />
            </div>
            <div className="lg:col-span-2">
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">Цена *</label>
              <input name="price" type="number" step="0.01" min="0" required defaultValue={priceStr} className={`${inputCls} tabular-nums`} />
            </div>
            <div className="lg:col-span-1">
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">№</label>
              <input name="display_order" type="number" defaultValue={row.display_order} className={`${inputCls} tabular-nums`} />
            </div>
            <div className="flex flex-col justify-end lg:col-span-1">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--color-text-secondary-token)]">
                <input
                  type="checkbox"
                  name="is_available"
                  defaultChecked={row.is_available}
                  className="size-4 rounded border-[var(--color-border-token)]"
                />
                вкл.
              </label>
            </div>
            <div className="flex items-end lg:col-span-2">
              <button
                type="submit"
                disabled={pending}
                className="w-full whitespace-nowrap rounded-md border border-[var(--color-border-token)] bg-[var(--color-bg-secondary-token)] px-3 py-2 text-xs font-medium hover:bg-black/5 disabled:opacity-60"
              >
                {pending ? "…" : "Сохранить"}
              </button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">Описание</label>
              <textarea name="description" rows={2} defaultValue={row.description ?? ""} className={`${inputCls} min-h-[72px]`} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">Изображение URL</label>
              <input name="image_url" type="url" defaultValue={row.image_url ?? ""} className={`${inputCls} font-mono text-xs`} />
            </div>
          </div>
        </form>
      </td>
    </tr>
  );
}
