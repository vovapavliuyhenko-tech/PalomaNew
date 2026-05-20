"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { siteConfig } from "@/lib/siteConfig";
import type { PromoRule } from "@/lib/cart/promoCodes";
import { parsePromoCodeInput, promoDiscountAmount } from "@/lib/cart/promoCodes";

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
  type: "flower" | "coffee" | "vase" | "card" | "gift";
}

interface CartStore {
  items: CartItem[];
  promo: PromoRule | null;
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, qty: number) => void;
  clearCart: () => void;
  applyPromo: (raw: string) => { ok: true } | { ok: false; error: string };
  removePromo: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  /** Сумма позиций без скидки */
  total: () => number;
  count: () => number;
  discountAmount: () => number;
  totalAfterDiscount: () => number;
  getDeliveryInfo: () => {
    isFree: boolean;
    remaining: number;
    min: number;
    total: number;
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      promo: null,
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.id === item.id && i.size === item.size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.size === item.size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (id, size) =>
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.size === size)),
        })),

      updateQuantity: (id, size, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => !(i.id === id && i.size === size))
              : state.items.map((i) =>
                  i.id === id && i.size === size ? { ...i, quantity: qty } : i
                ),
        })),

      clearCart: () => set({ items: [], promo: null }),

      applyPromo: (raw) => {
        const rule = parsePromoCodeInput(raw);
        if (!rule) return { ok: false as const, error: "Промокод не найден или недоступен." };
        set({ promo: rule });
        return { ok: true as const };
      },

      removePromo: () => set({ promo: null }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      discountAmount: () =>
        promoDiscountAmount(get().total(), get().promo),

      totalAfterDiscount: () =>
        Math.max(0, get().total() - get().discountAmount()),

      getDeliveryInfo: () => {
        const goods = get().totalAfterDiscount();
        const min = siteConfig.minOrderFreeDelivery;
        return {
          isFree: goods >= min,
          remaining: Math.max(0, min - goods),
          min,
          total: goods,
        };
      },
    }),
    {
      name: "paloma-cart",
      partialize: (state) => ({ items: state.items, promo: state.promo }),
    }
  )
);
