"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { MockProduct } from "@/data/mockProducts";
import { analytics } from "@/lib/analytics";

interface AddToCartButtonProps {
  product: MockProduct;
  selectedSize: string;
  selectedPrice: number;
}

export default function AddToCartButton({
  product,
  selectedSize,
  selectedPrice,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const { addItem, openCart } = useCartStore();

  const handleAdd = () => {
    const type =
      product.category === "coffee"
        ? "coffee"
        : product.category === "vases"
          ? "vase"
          : "flower";

    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: selectedPrice,
      size: selectedSize,
      quantity: 1,
      image: product.images[0],
      type,
    });

    if (type === "coffee") analytics.addCoffeeToCart(product.id);
    else analytics.addToCart(product.id, selectedPrice);

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 800);
  };

  if (!product.inStock) {
    return (
      <button
        type="button"
        disabled
        className="w-full bg-[var(--color-gray)] text-[var(--text-secondary)] py-4 text-sm uppercase tracking-[var(--ls-wider)] cursor-not-allowed rounded-[var(--radius-small)]"
      >
        Нет в наличии
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`w-full py-4 text-sm uppercase tracking-[var(--ls-wider)] transition-all duration-300 flex items-center justify-center gap-2 rounded-[var(--radius-small)] ${
        added
          ? "bg-[var(--color-cherry)] text-[var(--text-on-dark)]"
          : "btn-primary justify-center w-full"
      }`}
    >
      {added ? (
        <>
          <Check size={16} strokeWidth={2} />
          Добавлено в корзину
        </>
      ) : (
        <>
          <ShoppingBag size={16} strokeWidth={1.75} />
          В корзину
        </>
      )}
    </button>
  );
}
