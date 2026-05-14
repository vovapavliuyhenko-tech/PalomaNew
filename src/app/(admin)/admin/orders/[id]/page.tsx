import Link from "next/link";
import { notFound } from "next/navigation";

import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { formatDate, formatPrice } from "@/lib/utils";

function svc() {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = svc();
  if (!client) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Заказ</h1>
        <p className="text-sm text-[var(--color-text-secondary-token)]">
          Нужен SUPABASE_SERVICE_ROLE_KEY для просмотра заказа.
        </p>
      </div>
    );
  }

  const { data: order, error } = await client.from("orders").select("*").eq("id", id).maybeSingle();

  if (error || !order) notFound();

  const { data: lines } = await client
    .from("order_items")
    .select("id, quantity, price_at_purchase, product_id, products(name, slug)")
    .eq("order_id", id);

  type LineRow = {
    id: string;
    quantity: number;
    price_at_purchase: string | number | null;
    product_id: string;
    products: { name: string; slug: string } | { name: string; slug: string }[] | null;
  };

  const typedLines = ((lines ?? []) as unknown as LineRow[]).map((row) => {
    const p = row.products;
    const product = Array.isArray(p) ? p[0] ?? null : p;
    return {
      id: row.id,
      quantity: row.quantity,
      price_at_purchase: row.price_at_purchase,
      product_id: row.product_id,
      products: product,
    };
  });

  const total = Number(order.total ?? 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/orders" className="text-xs text-[var(--color-text-secondary-token)] hover:underline">
            ← Все заказы
          </Link>
          <h1 className="mt-3 text-xl font-semibold tracking-tight">
            Заказ{" "}
            <span className="font-mono text-[var(--color-accent-primary)]">{String(order.order_number)}</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary-token)]">{formatDate(String(order.created_at))}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[var(--color-border-token)] px-3 py-1 text-xs">
            Заказ: {String(order.order_status)}
          </span>
          <span className="rounded-full border border-[var(--color-border-token)] px-3 py-1 text-xs">
            Оплата: {String(order.payment_status)}
          </span>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border-token)] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary-token)]">
            Клиент
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-[var(--color-text-secondary-token)]">Имя</dt>
              <dd className="font-medium">{String(order.customer_name)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-secondary-token)]">Телефон</dt>
              <dd>{String(order.customer_phone)}</dd>
            </div>
            {order.customer_email ? (
              <div>
                <dt className="text-[var(--color-text-secondary-token)]">Email</dt>
                <dd>{String(order.customer_email)}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--color-border-token)] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary-token)]">
            Доставка
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-[var(--color-text-secondary-token)]">Тип</dt>
              <dd>{order.delivery_type === "pickup" ? "Самовывоз" : "Доставка"}</dd>
            </div>
            {order.delivery_city ? (
              <div>
                <dt className="text-[var(--color-text-secondary-token)]">Город</dt>
                <dd>{String(order.delivery_city)}</dd>
              </div>
            ) : null}
            {order.delivery_address ? (
              <div>
                <dt className="text-[var(--color-text-secondary-token)]">Адрес</dt>
                <dd className="whitespace-pre-wrap">{String(order.delivery_address)}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-[var(--color-text-secondary-token)]">Дата · интервал</dt>
              <dd>
                {order.delivery_date != null ? String(order.delivery_date) : "—"} ·{" "}
                {order.delivery_interval != null ? String(order.delivery_interval) : "—"}
              </dd>
            </div>
            {order.card_text ? (
              <div>
                <dt className="text-[var(--color-text-secondary-token)]">Открытка</dt>
                <dd className="whitespace-pre-wrap">{String(order.card_text)}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </section>

      {order.comment ? (
        <section className="rounded-[var(--radius-md)] border border-[var(--color-border-token)] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary-token)]">
            Комментарий
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm">{String(order.comment)}</p>
        </section>
      ) : null}

      <section className="rounded-[var(--radius-md)] border border-[var(--color-border-token)] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary-token)]">
          Позиции
        </h2>
        {typedLines.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-text-secondary-token)]">Строк каталога нет.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--color-border-token)] text-sm">
            {typedLines.map((row) => {
              const unit = Number(row.price_at_purchase ?? 0);
              const lineTotal = unit * row.quantity;
              const label = row.products?.name ?? `product ${row.product_id.slice(0, 8)}`;
              return (
                <li key={row.id} className="flex flex-wrap justify-between gap-2 py-3">
                  <div>
                    <p className="font-medium">{label}</p>
                    {row.products?.slug ? (
                      <p className="font-mono text-xs text-[var(--color-text-secondary-token)]">{row.products.slug}</p>
                    ) : null}
                  </div>
                  <div className="text-right tabular-nums">
                    ×{row.quantity} · {formatPrice(unit)}{" "}
                    <span className="text-[var(--color-text-secondary-token)]">
                      ({formatPrice(Number.isFinite(lineTotal) ? lineTotal : 0)})
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-6 space-y-1 border-t border-[var(--color-border-token)] pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary-token)]">Товары</span>
            <span className="tabular-nums">{formatPrice(Number(order.subtotal ?? 0))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary-token)]">Доставка</span>
            <span className="tabular-nums">{formatPrice(Number(order.delivery_cost ?? 0))}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Итого</span>
            <span className="tabular-nums">{formatPrice(Number.isFinite(total) ? total : 0)}</span>
          </div>
          {order.stripe_payment_id ? (
            <p className="pt-3 font-mono text-xs text-[var(--color-text-secondary-token)]">
              Платёж: {String(order.stripe_payment_id)}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
