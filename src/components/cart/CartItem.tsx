"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { CartItem as CartItemType, useCartStore } from "@/lib/store/cartStore";
import { formatPrice } from "@/lib/utils";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-3">
      <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-[var(--radius-medium)] border border-[var(--border)]">
        <Image src={item.image} alt={item.title} fill className="object-cover" sizes="64px" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-light leading-tight text-[var(--text-primary)]">
              {item.title}
            </p>
            <p className="font-accent mt-0.5 text-xs text-[var(--text-secondary)]">Размер: {item.size}</p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.id, item.size)}
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex-shrink-0 transition-colors"
            aria-label="Удалить"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)]">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)]"
              aria-label="Уменьшить"
            >
              <Minus size={12} />
            </button>
            <span className="text-sm w-5 text-center text-[var(--text-primary)]">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)]"
              aria-label="Увеличить"
            >
              <Plus size={12} />
            </button>
          </div>

          <span className="text-sm font-medium text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
