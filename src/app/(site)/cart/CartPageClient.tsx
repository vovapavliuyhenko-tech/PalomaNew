"use client";

import Link from "next/link";
import { Flower2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import CartItem from "@/components/cart/CartItem";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { formatPrice, FREE_DELIVERY_FROM, isDeliveryFree } from "@/lib/utils";

export default function CartPageClient() {
  const [mounted, setMounted] = useState(false);
  const { items, total } = useCartStore();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="container mx-auto py-[var(--space-xl)] md:py-[var(--space-xxl)] text-center text-[var(--text-secondary)]">
        Загрузка корзины…
      </div>
    );
  }

  const cartTotal = total();
  const freeDelivery = isDeliveryFree(cartTotal);

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-lg py-[var(--space-lg)] md:py-[var(--space-xl)] md:pb-[var(--space-xxl)]">
        <div className="flex flex-col items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-primary)] px-6 py-10 text-center shadow-[var(--shadow-soft)] md:px-10 md:py-12">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-secondary)]">
            <Flower2 size={32} className="text-[var(--color-cherry)]" strokeWidth={1.25} />
          </div>
          <h2
            className="mb-2 text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 400 }}
          >
            Корзина пуста
          </h2>
          <p className="mb-8 text-sm text-[var(--text-secondary)]">Выберите букет или позицию из меню café</p>
          <Link href="/catalog" className="btn-primary w-full max-w-xs justify-center text-center">
            Выбрать букет
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ScrollReveal>
    <div className="container mx-auto py-[var(--space-lg)] md:py-[var(--space-xl)] lg:pb-[var(--space-xxl)]">
      <div className="grid gap-[var(--space-lg)] lg:grid-cols-[1fr,minmax(280px,360px)] lg:gap-[var(--space-xl)]">
        <section aria-label="Состав заказа" className="space-y-4">
          {items.map((item) => (
            <CartItem key={`${item.id}-${item.size}`} item={item} />
          ))}
        </section>

        <aside className="h-fit rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-primary)] p-6 shadow-[var(--shadow-soft)] md:p-8">
          <h3 className="mb-4 text-sm uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)]">Итого</h3>
          {freeDelivery ? (
            <p className="mb-4 rounded-[var(--radius-small)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]">
              Доставка бесплатная при сумме от {formatPrice(FREE_DELIVERY_FROM)} · условие выполнено
            </p>
          ) : (
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              Для бесплатной доставки осталось {formatPrice(FREE_DELIVERY_FROM - cartTotal)} при пороге{" "}
              {formatPrice(FREE_DELIVERY_FROM)}
            </p>
          )}
          <p className="mb-6 flex items-baseline justify-between gap-4">
            <span className="font-accent text-sm text-[var(--text-secondary)]">К оплате</span>
            <span className="text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
              {formatPrice(cartTotal)}
            </span>
          </p>
          <Link href="/checkout" className="btn-primary inline-flex w-full justify-center">
            Оформить заказ
          </Link>
          <Link
            href="/catalog"
            className="mt-4 block text-center text-sm text-[var(--color-cherry)] underline underline-offset-[3px] transition-colors hover:text-[var(--paloma-burgundy)]"
          >
            Продолжить выбор
          </Link>
        </aside>
      </div>
    </div>
    </ScrollReveal>
  );
}
