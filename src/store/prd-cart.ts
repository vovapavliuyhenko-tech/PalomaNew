"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { PrdCartItem } from "@/types/prd";

type PromoState = { code: string; discountPercent?: number; discountRub?: number } | null;

type PrdCartState = {
  items: PrdCartItem[];
  promo: PromoState;
  addItem: (item: PrdCartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  applyPromo: (promo: NonNullable<PromoState>) => void;
  removePromo: () => void;
};

/**
 * Целевая корзина PRD (productId + addOns). Промокоды и основная витрина — в `useCartStore`.
 */
export const usePrdCartStore = create<PrdCartState>()(
    persist(
    (set) => ({
      items: [],
      promo: null,

      addItem: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === item.productId
                  ? {
                      ...i,
                      quantity: i.quantity + item.quantity,
                      addOns: item.addOns ?? i.addOns,
                    }
                  : i
              ),
            };
          }
          return { items: [...s.items, { ...item }] };
        }),

      removeItem: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),

      updateQuantity: (productId, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.productId !== productId)
              : s.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i
                ),
        })),

      clear: () => set({ items: [], promo: null }),

      applyPromo: (promo) => set({ promo }),

      removePromo: () => set({ promo: null }),
    }),
    { name: "paloma-prd-cart" }
  )
);

export function prdCartSubtotal(
  items: PrdCartItem[],
  priceByProductId: Record<string, number>
): number {
  return items.reduce((sum, line) => {
    const unit = priceByProductId[line.productId] ?? 0;
    return sum + unit * line.quantity;
  }, 0);
}

export function prdCartCount(items: PrdCartItem[]): number {
  return items.reduce((n, i) => n + i.quantity, 0);
}
