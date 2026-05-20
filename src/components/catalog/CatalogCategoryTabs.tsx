"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function CatalogCategoryTabs({
  categoryOptions,
}: {
  categoryOptions: Array<{ value: string; label: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const pathSegment =
    pathname.startsWith("/catalog/") && pathname !== "/catalog"
      ? pathname.slice("/catalog/".length).split("/")[0] || ""
      : "";

  const currentCategory =
    pathSegment || (searchParams.get("category") || "").trim();

  const pushWithCategory = useCallback(
    (categoryValue: string) => {
      const qs = new URLSearchParams(searchParams.toString());
      qs.delete("category");
      const tail = qs.toString();
      const base = categoryValue ? `/catalog/${categoryValue}` : "/catalog";
      router.push(tail ? `${base}?${tail}` : base, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="catalog-category-tabs" role="tablist" aria-label="Категории каталога">
      {categoryOptions.map((cat) => {
        const active = currentCategory === cat.value;
        return (
          <button
            key={cat.value || "__all__"}
            type="button"
            role="tab"
            aria-selected={active}
            className={`catalog-category-tab${active ? " catalog-category-tab--active" : ""}`}
            onClick={() => pushWithCategory(cat.value)}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
