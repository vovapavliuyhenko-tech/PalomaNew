import Link from "next/link";

import { fetchCoffeeCategoryProductsForPicker } from "@/lib/catalog/fetchCoffeeCategoryProductsForPicker";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";

import CafeRowEditor from "./CafeRowEditor";
import NewCafeItemForm from "./NewCafeItemForm";

function svc() {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

export default async function AdminSettingsCafePage() {
  const client = svc();

  if (!client) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold tracking-tight">Меню café</h1>
        <p className="text-sm text-[var(--color-text-secondary-token)]">Нужен SUPABASE_SERVICE_ROLE_KEY.</p>
      </div>
    );
  }

  const [cafRes, catalogOptions] = await Promise.all([
    client
      .from("cafe_items")
      .select("id,name,category,description,price,image_url,display_order,is_available,product_id")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true }),
    fetchCoffeeCategoryProductsForPicker(client),
  ]);

  const { data, error } = cafRes;

  if (error) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Меню café</h1>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Таблица café_items</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary-token)]">
          Публичная страница <Link href="/coffee" className="underline-offset-4 hover:underline">/coffee</Link> загружает
          позиции из <strong>каталога</strong> (категории «Кофе» и «Выпечка»). Редактируйте их в{" "}
          <Link href="/admin/products" className="text-[var(--color-accent-primary)] underline-offset-4 hover:underline">
            Товары
          </Link>
          . Здесь — отдельные строки таблицы <span className="font-mono">cafe_items</span> для внутренних списков; при необходимости
          укажите связь с тем же товаром в каталоге через поле <span className="font-mono">product_id</span> (выпадающий список в форме).
        </p>
      </div>

      <NewCafeItemForm catalogOptions={catalogOptions} />

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
                <td className="p-6 text-[var(--color-text-secondary-token)]">
                  Строк пока нет — добавьте первую или ориентируйтесь только на каталог.
                </td>
              </tr>
            ) : (
              rows.map((r: Record<string, unknown>) => {
                const price = r.price as string | number;
                const disp = typeof r.display_order === "number" ? r.display_order : Number.parseInt(String(r.display_order ?? 0), 10);
                return (
                  <CafeRowEditor
                    key={String(r.id)}
                    catalogOptions={catalogOptions}
                    row={{
                      id: String(r.id),
                      name: String(r.name ?? ""),
                      category: String(r.category ?? "coffee"),
                      description: r.description != null ? String(r.description) : null,
                      price,
                      image_url: r.image_url != null ? String(r.image_url) : null,
                      display_order: Number.isFinite(disp) ? disp : 0,
                      is_available: Boolean(r.is_available),
                      product_id: r.product_id != null ? String(r.product_id) : null,
                    }}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
