"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Camera, ChevronDown, ChevronUp, Mail, MapPin, Package, Sprout, Truck } from "lucide-react";
import { MockProduct } from "@/data/mockProducts";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/lib/siteConfig";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ProductCard from "@/components/catalog/ProductCard";
import PageHero from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useCartStore } from "@/lib/store/cartStore";
import { analytics } from "@/lib/analytics";
import { fadeUpVariant, staggerContainer } from "@/lib/animations";

interface Props {
  product: MockProduct;
  related: MockProduct[];
  upsell: MockProduct[];
}

export default function ProductDetailClient({ product, related, upsell }: Props) {
  useEffect(() => {
    analytics.viewProduct(product.slug);
  }, [product.slug]);

  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes[Math.floor(product.sizes.length / 2)] || product.sizes[0]
  );
  const [compositionOpen, setCompositionOpen] = useState(false);
  const { addItem, openCart } = useCartStore();

  const infoItems = useMemo(
    () => [
      { Icon: Camera, text: "Фото букета перед отправкой" },
      { Icon: Truck, text: "Доставка день-в-день" },
      { Icon: Sprout, text: "Цветы прямо от поставщиков" },
      { Icon: Mail, text: "Бесплатная открытка" },
      {
        Icon: Package,
        text: `Бесплатная доставка от ${formatPrice(siteConfig.minOrderFreeDelivery)}`,
      },
    ],
    []
  );

  const handleAddUpsell = (item: MockProduct) => {
    const size = item.sizes[0];
    const type =
      item.category === "coffee"
        ? "coffee"
        : item.category === "vases"
          ? "vase"
          : "gift";

    addItem({
      id: item.id,
      slug: item.slug,
      title: item.title,
      price: size.price,
      size: size.size,
      quantity: 1,
      image: item.images[0],
      type,
    });
    if (type === "coffee") analytics.addCoffeeToCart(item.id);
    else analytics.addToCart(item.id, size.price);
    openCart();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <PageHero
        crumbs={[
          { name: "Главная", href: "/" },
          { name: "Каталог", href: "/catalog" },
          { name: product.title },
        ]}
        eyebrow="К позиции"
        title={product.title}
        maxWidthClass="max-w-4xl"
        titleStyle={{
          fontSize: "clamp(1.875rem, 3.8vw, 3rem)",
          lineHeight: 1,
        }}
      />

      <ScrollReveal>
      <Container className="py-[var(--space-lg)] md:py-[var(--space-xl)]">
        <div className="grid gap-[clamp(20px,3vw,32px)] pb-16 lg:grid-cols-5 lg:gap-[var(--space-xl)] lg:pb-20">
          <div className="lg:col-span-3">
            <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] shadow-[var(--shadow-card)]">
              <Image
                src={product.images[selectedImg]}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImg(i)}
                    className={`relative h-20 w-16 overflow-hidden rounded-[var(--radius-md)] border-2 transition-all ${
                      selectedImg === i ? "border-[var(--color-cherry)]" : "border-transparent"
                    }`}
                  >
                    <Image src={img} alt={`Фото ${i + 1}`} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-5 lg:col-span-2"
          >
            <div className="flex flex-wrap gap-2">
              {product.isBestseller && (
                <span className="rounded-[var(--radius-sm)] bg-[var(--color-burgundy)] px-2.5 py-1 text-xs uppercase tracking-wider text-[var(--text-on-dark)]">
                  Хит
                </span>
              )}
              {product.isSeasonal && (
                <span className="rounded-[var(--radius-sm)] bg-[var(--color-orange)] px-2.5 py-1 text-xs uppercase tracking-wider text-[var(--text-on-dark)]">
                  Сезон
                </span>
              )}
            </div>

            <motion.p
              variants={fadeUpVariant}
              className="font-bold text-[var(--color-accent-burgundy)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-3xl)",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              {formatPrice(selectedSize.price)}
            </motion.p>

            <motion.p
              variants={fadeUpVariant}
              className="font-accent text-balance text-sm leading-relaxed text-[var(--text-secondary)] md:text-base"
            >
              {product.description}
            </motion.p>

            <motion.div variants={fadeUpVariant}>
              <p className="mb-2.5 text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)]">
                Размер букета
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`rounded-[var(--radius-medium)] border px-4 py-2 text-sm transition-all ${
                      selectedSize.size === s.size
                        ? "border-[var(--color-cherry)] bg-[var(--color-cherry)] text-[var(--text-on-dark)]"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--color-cherry)]"
                    }`}
                  >
                    {s.size}
                    <span className="ml-1.5 text-xs opacity-70">{formatPrice(s.price)}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={fadeUpVariant}
              className="overflow-hidden rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)]"
            >
              <button
                type="button"
                onClick={() => setCompositionOpen(!compositionOpen)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                <span>Состав букета</span>
                {compositionOpen ? (
                  <ChevronUp size={15} className="shrink-0 text-[var(--text-secondary)]" />
                ) : (
                  <ChevronDown size={15} className="shrink-0 text-[var(--text-secondary)]" />
                )}
              </button>
              {compositionOpen && (
                <div className="border-t border-[var(--border)] px-4 pb-3.5 pt-1">
                  <p className="font-accent pt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {product.composition}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <MapPin size={12} className="shrink-0" aria-hidden />
                    <span className="font-accent">Происхождение: {product.origin}</span>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div variants={fadeUpVariant} className="sticky bottom-20 lg:static">
              <AddToCartButton
                product={product}
                selectedSize={selectedSize.size}
                selectedPrice={selectedSize.price}
              />
            </motion.div>

            <motion.div variants={fadeUpVariant} className="grid gap-2 sm:grid-cols-2">
              {infoItems.map(({ Icon, text }) => (
                <div
                  key={text}
                  className="flex gap-2.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--color-bg-milk)] px-3 py-2.5 text-xs leading-snug text-[var(--text-secondary)]"
                >
                  <Icon size={14} className="mt-0.5 shrink-0 text-[var(--color-cherry)]" strokeWidth={1.75} aria-hidden />
                  <span className="font-accent">{text}</span>
                </div>
              ))}
            </motion.div>

            {upsell.length > 0 && (
              <motion.div variants={fadeUpVariant}>
                <p className="mb-3 text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)]">
                  Идеально дополнит
                </p>
                <div className="flex flex-wrap gap-2">
                  {upsell.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAddUpsell(item)}
                      className="group flex items-center gap-2 rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-xs transition-all hover:border-[var(--color-cherry)]"
                    >
                      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)]">
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                      <div className="text-left">
                        <div className="line-clamp-1 text-[var(--text-secondary)] transition-colors group-hover:text-[var(--color-cherry)]">
                          {item.title}
                        </div>
                        <div className="font-accent text-[var(--text-secondary)]/80">
                          {formatPrice(item.sizes[0].price)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {related.length > 0 && (
          <div className="border-t border-[var(--border)] py-16 md:py-20">
            <p className="font-accent mb-3 text-center text-xs font-medium uppercase italic tracking-[0.2em] text-[var(--color-cherry)]">
              К коллекции
            </p>
            <h2
              className="mb-12 text-center text-balance text-[var(--text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
                letterSpacing: "-0.02em",
                fontWeight: 400,
                lineHeight: 1.05,
              }}
            >
              С этим покупают
            </h2>
            <div className="catalog-product-grid">
              {related.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </Container>
      </ScrollReveal>
    </div>
  );
}
