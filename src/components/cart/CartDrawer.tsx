"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { X, ShoppingBag, Flower2, Check } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { formatPrice, isDeliveryFree, FREE_DELIVERY_FROM } from "@/lib/utils";
import { getCartDrawerAddonProducts } from "@/data/mockProducts";
import { analytics } from "@/lib/analytics";
import { promoHintsText } from "@/lib/cart/promoCodes";
import CartItem from "./CartItem";

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const [promoDraft, setPromoDraft] = useState("");
  const [promoMsg, setPromoMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const upsellViewTracked = useRef(false);
  const {
    items,
    isOpen,
    closeCart,
    total,
    count,
    addItem,
    promo,
    applyPromo,
    removePromo,
    discountAmount,
    totalAfterDiscount,
  } = useCartStore();

  const cartIds = useMemo(() => new Set(items.map((i) => i.id)), [items]);
  const suggestAddons = useMemo(
    () => getCartDrawerAddonProducts().filter((p) => !cartIds.has(p.id)),
    [cartIds]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isOpen) return;
    analytics.openCart();
  }, [mounted, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      upsellViewTracked.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!mounted || !isOpen || items.length === 0 || suggestAddons.length === 0) return;
    if (upsellViewTracked.current) return;
    upsellViewTracked.current = true;
    analytics.viewCartUpsells();
  }, [mounted, isOpen, items.length, suggestAddons.length]);

  if (!mounted) return null;
  const lineSubtotal = total();
  const disc = discountAmount();
  const afterDisc = totalAfterDiscount();
  const cartCount = count();
  const freeDelivery = isDeliveryFree(afterDisc);

  return (
    <>
      {isOpen ? (
        <>
          <div className="fixed inset-0 z-[9990] bg-black/40" onClick={closeCart} aria-hidden />

          <div className="fixed right-0 top-0 z-[9991] flex h-full w-full max-w-[460px] translate-x-0 flex-col border-l border-[var(--border)] bg-[var(--bg-card)] shadow-2xl motion-reduce:transition-none">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-[var(--color-cherry)]" strokeWidth={1.5} />
                <h3
                  className="text-lg text-[var(--text-primary)]"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.02em" }}
                >
                  Ваша корзина
                  {cartCount > 0 && (
                    <span className="ml-2 font-accent text-[var(--color-cherry)]">({cartCount})</span>
                  )}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="rounded-full p-2 text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-secondary)]">
                  <Flower2 size={32} className="text-[var(--color-cherry)]" strokeWidth={1.25} />
                </div>
                <h4
                  className="mb-2 text-[var(--text-primary)]"
                  style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 400 }}
                >
                  Корзина пуста
                </h4>
                <p className="font-accent mb-6 text-sm text-[var(--text-secondary)]">
                  Выберите прекрасный букет из нашего каталога
                </p>
                <Link href="/catalog" onClick={closeCart} className="btn-primary">
                  В каталог
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {items.map((item) => (
                    <CartItem key={`${item.id}-${item.size}`} item={item} />
                  ))}
                </div>

                {suggestAddons.length > 0 && (
                  <div className="border-t border-[var(--border)] bg-[var(--bg-secondary)]/30 px-6 py-4">
                    <p className="font-accent mb-3 text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)]">
                      Идеально дополнят ваш букет
                    </p>
                    <div className="space-y-2">
                      {suggestAddons.map((p) => {
                        const def = p.sizes[0];
                        if (!def) return null;
                        const t =
                          p.category === "coffee"
                            ? "coffee"
                            : p.category === "vases"
                              ? "vase"
                              : "flower";
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              analytics.cartUpsellClick(p.id);
                              addItem({
                                id: p.id,
                                slug: p.slug,
                                title: p.title,
                                price: def.price,
                                size: def.size,
                                quantity: 1,
                                image: p.images[0],
                                type: t,
                              });
                              if (p.category === "coffee") analytics.addCoffeeToCart(p.id);
                              else analytics.addToCart(p.id, def.price);
                            }}
                            className="flex w-full items-center gap-3 rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] p-3 text-left transition-colors hover:border-[var(--color-cherry)]/40"
                          >
                            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)]">
                              <Image
                                src={p.images[0]}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-[var(--text-primary)]">{p.title}</p>
                              <p className="text-xs font-medium text-[var(--color-cherry)]">
                                + {formatPrice(def.price)}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-4 border-t border-[var(--border)] bg-[var(--bg-secondary)]/50 px-6 py-5">
                  <div>
                    <p className="font-accent mb-2 text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)]">
                      Промокод
                    </p>
                    {promo ? (
                      <div className="flex items-center justify-between gap-2 rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2">
                        <span className="font-mono text-sm text-[var(--text-primary)]">{promo.code}</span>
                        <button
                          type="button"
                          onClick={() => {
                            removePromo();
                            setPromoMsg(null);
                          }}
                          className="text-xs text-[var(--color-cherry)] hover:underline"
                        >
                          Убрать
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          value={promoDraft}
                          onChange={(e) => {
                            setPromoDraft(e.target.value);
                            setPromoMsg(null);
                          }}
                          placeholder="Код"
                          className="min-w-0 flex-1 rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--color-cherry)] focus:outline-none"
                          aria-label="Промокод"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const r = applyPromo(promoDraft);
                              setPromoMsg(
                                r.ok ? { type: "ok", text: "Промокод применён." } : { type: "err", text: r.error }
                              );
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const r = applyPromo(promoDraft);
                            setPromoMsg(
                              r.ok ? { type: "ok", text: "Промокод применён." } : { type: "err", text: r.error }
                            );
                          }}
                          className="shrink-0 rounded-[var(--radius-medium)] border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-primary)] hover:border-[var(--color-cherry)]"
                        >
                          OK
                        </button>
                      </div>
                    )}
                    <p className="mt-1.5 font-accent text-[10px] leading-relaxed text-[var(--text-secondary)]/80">
                      {promoHintsText()}
                    </p>
                    {promoMsg ? (
                      <p
                        className={`mt-1.5 text-xs ${promoMsg.type === "ok" ? "text-green-700" : "text-red-600"}`}
                      >
                        {promoMsg.text}
                      </p>
                    ) : null}
                  </div>

                  {freeDelivery ? (
                    <div className="flex items-center gap-2 rounded-[var(--radius-medium)] border border-[color-mix(in_srgb,var(--paloma-orange)_28%,transparent)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm text-[var(--text-primary)]">
                      <Check size={16} className="shrink-0 text-[var(--color-cherry)]" strokeWidth={2} aria-hidden />
                      <span className="font-accent">Доставка бесплатная</span>
                    </div>
                  ) : (
                    <div className="rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5 text-sm text-[var(--text-secondary)]">
                      <span className="font-accent">
                        Бесплатная доставка от{" "}
                        <span className="font-medium text-[var(--color-cherry)]">
                          {formatPrice(FREE_DELIVERY_FROM)}
                        </span>
                        {" · "}осталось{" "}
                        <span className="font-medium text-[var(--text-primary)]">
                          {formatPrice(FREE_DELIVERY_FROM - afterDisc)}
                        </span>
                      </span>
                    </div>
                  )}

                  <div className="space-y-1.5 border-t border-[var(--border)] pt-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-accent text-[var(--text-secondary)]">Товары</span>
                      <span className="tabular-nums text-[var(--text-primary)]">{formatPrice(lineSubtotal)}</span>
                    </div>
                    {disc > 0 ? (
                      <div className="flex items-center justify-between">
                        <span className="font-accent text-[var(--text-secondary)]">Скидка</span>
                        <span className="tabular-nums text-[var(--color-cherry)]">−{formatPrice(disc)}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-accent text-sm text-[var(--text-secondary)]">К оплате (товары)</span>
                    <span
                      className="text-2xl text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em", fontWeight: 400 }}
                    >
                      {formatPrice(afterDisc)}
                    </span>
                  </div>
                  <p className="font-accent text-[10px] leading-snug text-[var(--text-secondary)]/85">
                    Доставка рассчитывается при оформлении.
                  </p>

                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="btn-primary w-full justify-center text-center"
                  >
                    Оформить заказ
                  </Link>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="w-full py-1 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                  >
                    <span className="font-accent">Продолжить выбор</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      ) : null}
    </>
  );
}
