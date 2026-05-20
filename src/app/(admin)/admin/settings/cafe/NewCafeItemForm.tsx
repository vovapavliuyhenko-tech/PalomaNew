"use client";

import { useActionState } from "react";

import type { CoffeeCatalogPickRow } from "@/lib/catalog/fetchCoffeeCategoryProductsForPicker";

import { createCafeItem } from "./actions";
import CatalogProductPickSelect from "./CatalogProductPickSelect";

const inputCls =
  "min-h-[40px] w-full rounded-md border border-[var(--color-border-token)] bg-white px-3 py-2 text-sm text-[var(--color-text-token)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]";

export default function NewCafeItemForm({ catalogOptions }: { catalogOptions: CoffeeCatalogPickRow[] }) {
  const [state, formAction, pending] = useActionState(createCafeItem, null);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-[var(--color-border-token)] bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold tracking-tight">Новая позиция</h2>
      <p className="text-[11px] leading-relaxed text-[var(--color-text-secondary-token)]">
        Витрина <span className="font-mono">/coffee</span> показывает <strong>товары каталога</strong> в категориях «Кофе» и «Выпечка». Записи
        здесь пригодятся для внутреннего меню или POS; правки цен для сайта делайте в разделе «Товары».
      </p>
      {state?.error ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{state.error}</div> : null}
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
          Связать с товаром каталога
        </label>
        <CatalogProductPickSelect options={catalogOptions} name="product_id" />
        <p className="mt-1 text-[10px] text-[var(--color-text-secondary-token)]">
          Необязательно: кофе и выпечка из тех же категорий, что и на странице <span className="font-mono">/coffee</span>.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">Название *</label>
          <input name="name" required className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
            Категория (slug) *
          </label>
          <input name="category" required className={`${inputCls} font-mono text-xs`} placeholder="coffee" defaultValue="coffee" />
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">Порядок</label>
          <input name="display_order" type="number" defaultValue={0} className={inputCls} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">Цена, ₽ *</label>
          <input name="price" type="number" step="0.01" min="0" required className={inputCls} />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--color-text-secondary-token)]">
            <input type="checkbox" name="is_available" defaultChecked className="size-4 rounded border-[var(--color-border-token)]" />
            в меню
          </label>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">Описание</label>
        <textarea name="description" rows={2} className={`${inputCls} min-h-[72px]`} />
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">URL изображения</label>
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
