"use client";

import { useActionState } from "react";
import Link from "next/link";

import type { FormState } from "./actions";
import { updateProduct } from "./actions";

type CategoryOpt = { id: string; name: string; slug: string };

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  description: string | null;
  composition: string | null;
  category_id: string | null;
  display_order: number;
  is_available: boolean;
  is_ready_today: boolean;
};

const inputCls =
  "w-full rounded-md border border-[var(--color-border-token)] bg-white px-3 py-2 text-sm text-[var(--color-text-token)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]";

export default function ProductEditForm({
  product,
  categories,
}: {
  product: ProductRow;
  categories: CategoryOpt[];
}) {
  const initial: FormState = null;
  const [state, formAction, pending] = useActionState(updateProduct, initial);

  const priceStr =
    typeof product.price === "string" ? product.price : String(product.price ?? "");

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <input type="hidden" name="id" value={product.id} />

      {state?.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</div>
      ) : null}

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-secondary-token)]">
          Название *
        </label>
        <input name="name" required className={inputCls} defaultValue={product.name} />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-secondary-token)]">
          Slug * <span className="normal-case opacity-75">(URL, латиница)</span>
        </label>
        <input name="slug" required className={`${inputCls} font-mono text-xs`} defaultValue={product.slug} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-secondary-token)]">
            Цена, ₽ *
          </label>
          <input name="price" type="number" step="0.01" min="0.01" required className={inputCls} defaultValue={priceStr} />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-secondary-token)]">
            Порядок
          </label>
          <input name="display_order" type="number" className={inputCls} defaultValue={product.display_order} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-secondary-token)]">
          Категория
        </label>
        <select name="category_id" className={inputCls} defaultValue={product.category_id ?? ""}>
          <option value="">Без категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.slug})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-secondary-token)]">
          Описание
        </label>
        <textarea name="description" rows={4} className={inputCls} defaultValue={product.description ?? ""} />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-secondary-token)]">
          Состав
        </label>
        <textarea name="composition" rows={3} className={inputCls} defaultValue={product.composition ?? ""} />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_available" defaultChecked={product.is_available} className="h-4 w-4 accent-[var(--color-accent-primary)]" />
          В наличии
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_ready_today" defaultChecked={product.is_ready_today} className="h-4 w-4 accent-[var(--color-accent-primary)]" />
          Готов сегодня
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Сохранение…" : "Сохранить"}
        </button>
        <Link href="/admin/products" className="rounded-md border border-[var(--color-border-token)] px-4 py-2 text-sm hover:bg-black/5">
          Отмена
        </Link>
      </div>
    </form>
  );
}
