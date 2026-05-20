"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { MockProduct } from "@/data/mockProducts";
import { useCartStore } from "@/lib/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { productPath } from "@/lib/constants";
import { useProductQuickView } from "./ProductQuickViewContext";

interface ProductCardProps {
  product: MockProduct;
}

const compositionCls =
  "line-clamp-2 font-[family-name:var(--font-body),sans-serif] text-[15px] leading-[1.58] text-[color-mix(in_srgb,var(--paloma-coal)_58%,transparent)]";

export default function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { addItem, openCart } = useCartStore();
  const quickView = useProductQuickView();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultSize = product.sizes[1] || product.sizes[0];
    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: defaultSize.price,
      size: defaultSize.size,
      quantity: 1,
      image: product.images[0],
      type:
        product.category === "coffee"
          ? "coffee"
          : product.category === "vases"
            ? "vase"
            : "flower",
    });
    openCart();
  };

  const openQuick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    quickView?.openQuickView(product);
  };

  if (!product.inStock) {
    return (
      <article className="product-card-root grid h-full min-h-0 min-w-0 grid-rows-[auto_1fr] overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)]">
        <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-[var(--color-gray)] opacity-70">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover grayscale"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 bg-[var(--bg-card)]/92 px-5 pt-[18px] pb-[22px] backdrop-blur-sm">
            <p className="caption font-accent mb-2 text-[var(--text-secondary)]">{product.title}</p>
            <span className="caption font-accent uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)]">
              Нет в наличии
            </span>
          </div>
        </div>
      </article>
    );
  }

  const metaBadges = (
    <>
      {product.isBestseller && (
        <span className="rounded-[var(--radius-sm)] bg-[var(--color-burgundy)] px-2 py-0.5 font-accent text-[10px] uppercase tracking-[var(--ls-widest)] text-[var(--text-on-dark)]">
          Хит
        </span>
      )}
      {product.isSeasonal && (
        <span className="rounded-[var(--radius-sm)] bg-[var(--color-orange)] px-2 py-0.5 font-accent text-[10px] uppercase tracking-[var(--ls-widest)] text-[var(--text-on-dark)]">
          Сезон
        </span>
      )}
    </>
  );

  return (
    <article className="product-card-root grid h-full min-h-0 min-w-0 grid-rows-[auto_1fr] overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)] transition-shadow duration-[var(--dur-base)] ease-[var(--ease-soft)] hover:shadow-[var(--shadow-card)]">
      <div
        className="group/media relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-[var(--color-gray-light)]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          className={`object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-soft)] group-hover/media:scale-[1.03] active:scale-[1.02] md:active:scale-100 ${hovered && product.images[1] ? "opacity-0" : "opacity-100"}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw"
          loading="lazy"
        />

        {product.images[1] ? (
          <Image
            src={product.images[1]}
            alt={`${product.title} — вид 2`}
            fill
            className={`pointer-events-none object-cover transition-opacity duration-[var(--dur-base)] ease-[var(--ease-soft)] group-hover/media:scale-[1.03] ${hovered ? "opacity-100" : "opacity-0"}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw"
            loading="lazy"
          />
        ) : null}

        <div className="pointer-events-none absolute left-3 top-3 z-[2] flex flex-col gap-1.5">{metaBadges}</div>

        {quickView ? (
          <button
            type="button"
            className="absolute inset-0 z-[3] bg-transparent text-left outline-none ring-inset focus-visible:ring-2 focus-visible:ring-[var(--color-cherry)]"
            onClick={openQuick}
            aria-label={`Быстрый просмотр: ${product.title}`}
          >
            <span className="sr-only">Открыть быстрый просмотр</span>
          </button>
        ) : (
          <Link
            href={productPath(product.slug)}
            className="absolute inset-0 z-[3]"
            aria-label={product.title}
          />
        )}
      </div>

      <div className="flex min-h-[14.5rem] flex-col justify-between gap-3 px-5 pt-[18px] pb-[22px] md:min-h-[15rem]">
        <div className="flex min-w-0 flex-col gap-2">
          <Link href={productPath(product.slug)} className="min-w-0">
            <h4 className="font-accent text-[clamp(16px,1.12vw,18px)] font-medium leading-[1.38] text-[var(--text-primary)] transition-colors hover:text-[var(--color-cherry)]">
              {product.title}
            </h4>
          </Link>
          {product.composition ? <p className={compositionCls}>{product.composition}</p> : null}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[color-mix(in_srgb,var(--paloma-coal)_10%,transparent)] pt-2">
          <p className="font-accent text-base font-bold tabular-nums text-[var(--color-accent-burgundy)]">
            {formatPrice(product.price)}
          </p>
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-coal)] px-4 text-[var(--text-on-dark)] transition-colors duration-[var(--dur-fast)] ease-[var(--ease-soft)] hover:bg-[var(--color-cherry)]"
            aria-label={`В корзину: ${product.title}`}
          >
            <ShoppingBag size={17} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </article>
  );
}
