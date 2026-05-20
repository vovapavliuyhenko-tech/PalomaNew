"use client";

import { useEffect, useState } from "react";
import type { DbProduct } from "@/types/db";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/config";

function normalizeRow(row: {
  price: unknown;
  product_images?: DbProduct["product_images"];
}): DbProduct["price"] {
  return typeof row.price === "number" ? row.price : Number.parseFloat(String(row.price ?? 0)) || 0;
}

/**
 * Загрузка доступных по RLS товаров для Client Components (когда настроены env Supabase).
 * Без ключей вернёт пустой список без ошибки.
 */
export function useProducts(categorySlug?: string, readyToday?: boolean) {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(Boolean(hasSupabaseEnv()));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!hasSupabaseEnv()) {
        setProducts([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        const supabase = createSupabaseBrowserClient();

        let catId: string | undefined;

        if (categorySlug) {
          const { data: cat, error: cErr } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", categorySlug)
            .maybeSingle();
          if (cErr) throw cErr;
          if (!cat) {
            if (!cancelled) {
              setProducts([]);
              setError(null);
              setLoading(false);
            }
            return;
          }
          catId = cat.id;
        }

        let q = supabase
          .from("products")
          .select("*, product_images(*), categories(slug)")
          .eq("is_available", true)
          .order("display_order");

        if (catId) q = q.eq("category_id", catId);

        if (readyToday) q = q.eq("is_ready_today", true);

        const { data, error: fetchError } = await q;
        if (fetchError) throw fetchError;
        const rows =
          ((data ?? []) as Array<Omit<DbProduct, "price"> & { price: unknown; product_images?: DbProduct["product_images"] }>).map((r) => ({
            ...r,
            price: normalizeRow(r),
          })) ?? [];

        const sorted = rows.map((p) =>
          !p.product_images
            ? p
            : {
                ...p,
                product_images: [...p.product_images].sort((a, b) => a.display_order - b.display_order),
              }
        );

        if (!cancelled) {
          setProducts(sorted as DbProduct[]);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Не удалось загрузить каталог");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [categorySlug, readyToday]);

  return { products, loading, error };
}
