"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import type { MockProduct } from "@/data/mockProducts";
import { useCartStore } from "@/lib/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import { TrackOutboundAnchor } from "@/components/analytics/TrackOutboundAnchor";
import { siteConfig } from "@/lib/siteConfig";
import { productPath } from "@/lib/constants";

type Props = {
  product: MockProduct | null;
  onClose: () => void;
};

export default function ProductQuickViewModal({ product, onClose }: Props) {
  const { addItem, openCart } = useCartStore();
  const [sizeIdx, setSizeIdx] = useState(0);

  useEffect(() => {
    setSizeIdx(0);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, onClose]);

  const size = product?.sizes[sizeIdx] ?? product?.sizes[0];

  const handleAdd = () => {
    if (!product || !size) return;
    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: size.price,
      size: size.size,
      quantity: 1,
      image: product.images[0],
      type:
        product.category === "coffee"
          ? "coffee"
          : product.category === "vases"
            ? "vase"
            : "flower",
    });
    if (product.category === "coffee") analytics.addCoffeeToCart(product.id);
    else analytics.addToCart(product.id, size.price);
    openCart();
    onClose();
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.button
            type="button"
            aria-label="Закрыть"
            className="fixed inset-0 z-[10000] bg-[color-mix(in_srgb,var(--paloma-coal)_52%,transparent)] backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="qv-title"
            className="fixed left-1/2 top-1/2 z-[10001] w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-primary)] shadow-[var(--shadow-card)]"
            initial={{ opacity: 0, scale: 0.96, y: "-48%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.96, y: "-48%" }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 512px) 100vw, 512px"
              />
              <button
                type="button"
                onClick={onClose}
                className="absolute top-3 right-3 rounded-full bg-[var(--bg-card)]/90 p-2 text-[var(--text-primary)] shadow-md hover:bg-[var(--bg-secondary)]"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h2 id="qv-title" className="text-xl text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
                  {product.title}
                </h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">{product.description}</p>
              </div>

              {product.sizes.length > 1 && (
                <div>
                  <p className="text-[10px] uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)] mb-2">
                    Размер
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s, i) => (
                      <button
                        key={s.size}
                        type="button"
                        onClick={() => setSizeIdx(i)}
                        className={`rounded-[var(--radius-sm)] border px-3 py-2 text-xs transition-colors ${
                          sizeIdx === i
                            ? "border-[var(--color-cherry)] bg-[color-mix(in_srgb,var(--paloma-orange)_12%,var(--paloma-white))] text-[var(--text-primary)]"
                            : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--color-cherry)]/50"
                        }`}
                      >
                        {s.size} · {formatPrice(s.price)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-lg font-bold text-[var(--color-accent-burgundy)]">
                {size ? formatPrice(size.price) : formatPrice(product.price)}
              </p>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button type="button" onClick={handleAdd} className="btn-primary flex-1 justify-center gap-2">
                  <ShoppingBag size={16} />
                  В корзину
                </button>
                <Link href={productPath(product.slug)} onClick={onClose} className="btn-secondary flex-1 justify-center text-center">
                  Страница товара
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
                <TrackOutboundAnchor
                  href={siteConfig.whatsapp}
                  kind="whatsapp"
                  source="quick_view"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--color-cherry)] underline underline-offset-[3px] transition-colors hover:text-[var(--paloma-burgundy)]"
                >
                  WhatsApp
                </TrackOutboundAnchor>
                <TrackOutboundAnchor
                  href={siteConfig.telegram}
                  kind="telegram"
                  source="quick_view"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--color-cherry)] underline underline-offset-[3px] transition-colors hover:text-[var(--paloma-burgundy)]"
                >
                  Telegram
                </TrackOutboundAnchor>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
