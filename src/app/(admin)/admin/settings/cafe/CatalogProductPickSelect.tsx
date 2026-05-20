"use client";

import type { CoffeeCatalogPickRow } from "@/lib/catalog/fetchCoffeeCategoryProductsForPicker";
import { formatPrice } from "@/lib/utils";

const selCls =
  "min-h-[40px] w-full rounded-md border border-[var(--color-border-token)] bg-white px-3 py-2 text-sm text-[var(--color-text-token)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]";

function labelFor(p: CoffeeCatalogPickRow): string {
  const cat = p.category_slug === "kofe" ? "кофе" : p.category_slug === "vypechka" ? "выпечка" : (p.category_slug ?? "—");
  return `${p.name} · ${p.slug} · ${cat} · ${formatPrice(p.price)}`;
}

export default function CatalogProductPickSelect({
  options,
  name,
  defaultValue,
  id,
}: {
  options: CoffeeCatalogPickRow[];
  name: string;
  defaultValue?: string | null;
  id?: string;
}) {
  return (
    <select name={name} id={id} defaultValue={defaultValue ?? ""} className={`${selCls} font-mono text-xs`}>
      <option value="">— без привязки к каталогу —</option>
      {options.map((p) => (
        <option key={p.id} value={p.id}>
          {labelFor(p)}
        </option>
      ))}
    </select>
  );
}
