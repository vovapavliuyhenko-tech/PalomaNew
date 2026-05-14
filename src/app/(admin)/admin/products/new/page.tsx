import Link from "next/link";

import NewProductForm from "../NewProductForm";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function svc() {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

export default async function AdminProductsNewPage() {
  const client = svc();

  if (!client) {
    return (
      <div className="space-y-4">
        <Link href="/admin/products" className="text-xs text-[var(--color-accent-primary)] hover:underline">
          ← все товары
        </Link>
        <p className="text-sm text-[var(--color-text-secondary-token)]">Нет SUPABASE_SERVICE_ROLE_KEY.</p>
      </div>
    );
  }

  const { data: categories } = await client
    .from("categories")
    .select("id,name,slug")
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="text-xs text-[var(--color-accent-primary)] hover:underline">
        ← все товары
      </Link>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Новый товар</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary-token)]">
          После создания откроется карточка редактирования. Изображения пока добавляются в Supabase вручную или скриптом.
        </p>
      </div>
      <NewProductForm categories={(categories ?? []) as { id: string; name: string; slug: string }[]} />
    </div>
  );
}
