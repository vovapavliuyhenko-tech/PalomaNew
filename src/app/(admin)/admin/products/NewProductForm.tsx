"use client";

import { useActionState } from "react";
import Link from "next/link";

import type { FormState } from "./actions";
import { createProduct } from "./actions";

type CategoryOpt = { id: string; name: string; slug: string };

const inputCls =
  "w-full rounded-md border border-[var(--color-border-token)] bg-white px-3 py-2 text-sm text-[var(--color-text-token)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]";

export default function NewProductForm({ categories }: { categories: CategoryOpt[] }) {
  const initial: FormState = null;
  const [state, formAction, pending] = useActionState(createProduct, initial);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {state?.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</div>
      ) : null}

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-secondary-token)]">
          Название *
        </label>
        <input name="name" required className={inputCls} placeholder='Например, Букет «Морской бриз»' />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-secondary-token)]">
          Slug * <span className="normal-case opacity-75">уникальный, латиница</span>
        </label>
        <input name="slug" required className={`${inputCls} font-mono text-xs`} placeholder="novyi-buket-1" />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-secondary-token)]">
          Цена, ₽ *
        </label>
        <input name="price" type="number" step="0.01" min="0.01" required className={inputCls} placeholder="5500" />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-secondary-token)]">
          Категория
        </label>
        <select name="category_id" className={inputCls}>
          <option value="">Без категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-secondary-token)]">
          Описание
        </label>
        <textarea name="description" rows={3} className={inputCls} />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-secondary-token)]">
          Состав
        </label>
        <textarea name="composition" rows={2} className={inputCls} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Создание…" : "Создать и перейти к редактированию"}
        </button>
        <Link href="/admin/products" className="rounded-md border border-[var(--color-border-token)] px-4 py-2 text-sm hover:bg-black/5">
          Отмена
        </Link>
      </div>
    </form>
  );
}
