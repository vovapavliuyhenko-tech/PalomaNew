import { createSupabaseServiceClient } from "@/lib/supabase/admin";

import CategoryRowEditor from "./CategoryRowEditor";
import NewCategoryForm from "./NewCategoryForm";

function svc() {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

export default async function AdminCategoriesPage() {
  const client = svc();

  if (!client) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Категории</h1>
        <p className="text-sm text-[var(--color-text-secondary-token)]">Нужен SUPABASE_SERVICE_ROLE_KEY.</p>
      </div>
    );
  }

  const { data, error } = await client
    .from("categories")
    .select("id,name,slug,display_order,is_active,description,image_url")
    .order("display_order", { ascending: true });

  if (error) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Категории</h1>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Категории</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary-token)]">
          Slug влияет на фильтр витрины в URL вида{" "}
          <span className="font-mono">/catalog/[slug]</span> (разделы каталога). Карточки товаров на{" "}
          <span className="font-mono">/product/[slug]</span>. После правок сохраните строку через «Сохранить» для
          каждой категории.
        </p>
      </div>

      <NewCategoryForm />

      <div className="overflow-x-auto rounded-lg border border-[var(--color-border-token)] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--color-border-token)] bg-[var(--color-bg-secondary-token)] text-xs uppercase tracking-wider text-[var(--color-text-secondary-token)]">
            <tr>
              <th className="p-3 font-medium">Запись</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="p-6 text-[var(--color-text-secondary-token)]">Категорий пока нет — добавьте первую.</td>
              </tr>
            ) : (
              rows.map((r: Record<string, unknown>) => (
                <CategoryRowEditor
                  key={String(r.id)}
                  row={{
                    id: String(r.id),
                    name: String(r.name ?? ""),
                    slug: String(r.slug ?? ""),
                    display_order: typeof r.display_order === "number" ? r.display_order : Number(r.display_order ?? 0),
                    is_active: Boolean(r.is_active),
                    description: r.description !== undefined && r.description !== null ? String(r.description) : null,
                    image_url: r.image_url !== undefined && r.image_url !== null ? String(r.image_url) : null,
                  }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
