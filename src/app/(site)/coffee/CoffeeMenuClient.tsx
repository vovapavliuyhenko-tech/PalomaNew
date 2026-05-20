"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { MockProduct } from "@/data/mockProducts";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cartStore";
import { analytics } from "@/lib/analytics";

const drinkTabs = [
  { value: "all", label: "Все" },
  { value: "coffee", label: "Кофе" },
  { value: "cocoa", label: "Какао" },
  { value: "tea", label: "Чай" },
  { value: "matcha", label: "Матча" },
] as const;

function isMatchaLike(i: MockProduct): boolean {
  const slug = i.slug.toLowerCase();
  const title = i.title.toLowerCase();
  return slug.includes("matcha") || title.includes("матча") || title.includes("matcha");
}

/** Выпечка / десерты: каталог `vypechka` или позиции PRD (`cafe-bakery`, `cafe-desserts`). */
function isDessertsLike(i: MockProduct): boolean {
  const c = i.catalogCategorySlug ?? "";
  if (c === "vypechka" || c === "cafe-bakery" || c === "cafe-desserts") return true;
  if (c) return false;
  const slug = i.slug.toLowerCase();
  const title = i.title.toLowerCase();
  return (
    slug.includes("kroassan") ||
    slug.includes("croissant") ||
    title.includes("круассан") ||
    title.includes("выпечк")
  );
}

function passesTab(activeTab: string, i: MockProduct): boolean {
  if (activeTab === "all") return true;

  const c = i.catalogCategorySlug ?? "";

  if (c === "cafe-cocoa") return activeTab === "cocoa";
  if (c === "cafe-tea") return activeTab === "tea";

  if (c === "vypechka" || c === "cafe-bakery" || c === "cafe-desserts") {
    return activeTab === "desserts";
  }

  if (c === "kofe" || c === "cafe-coffee") {
    if (activeTab === "cocoa" || activeTab === "tea") return false;
    if (activeTab === "coffee") return !isMatchaLike(i);
    if (activeTab === "matcha") return isMatchaLike(i);
    return false;
  }

  if (activeTab === "coffee") return i.category === "coffee" && !isMatchaLike(i) && !isDessertsLike(i);
  if (activeTab === "matcha") return isMatchaLike(i);
  if (activeTab === "desserts") return i.category === "coffee" && isDessertsLike(i);
  return false;
}

type CoffeeMenuPreset = "drinks" | "pastries";

type Props = {
  items: MockProduct[];
  preset: CoffeeMenuPreset;
  sectionTitle: string;
  eyebrow?: string;
};

export default function CoffeeMenuClient({ items, preset, sectionTitle, eyebrow }: Props) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const { addItem, openCart } = useCartStore();

  const drinkPool = items.filter((i) => !isDessertsLike(i));

  const filteredDrinks =
    preset === "drinks"
      ? drinkPool.filter((i) => passesTab(activeTab === "all" ? "all" : activeTab, i))
      : [];

  const pastriesPool = items.filter((i) => isDessertsLike(i));

  const displayItems =
    preset === "pastries"
      ? pastriesPool
      : filteredDrinks.length > 0
        ? filteredDrinks
        : drinkPool;

  const handleAdd = (item: MockProduct) => {
    const size = item.sizes[0];
    addItem({
      id: item.id,
      slug: item.slug,
      title: item.title,
      price: size.price,
      size: size.size,
      quantity: 1,
      image: item.images[0],
      type: "coffee",
    });
    analytics.addCoffeeToCart(item.id);
    openCart();
  };

  return (
    <section className="container mx-auto pb-[var(--space-xl)] md:pb-[var(--space-xxl)]">
      {eyebrow ? (
        <p className="font-accent mb-3 text-xs font-medium uppercase italic tracking-[0.22em] text-[var(--color-cherry)]">
          {eyebrow}
        </p>
      ) : null}

      <h2
        className="mb-8 max-w-3xl text-balance text-[var(--text-primary)]"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
          letterSpacing: "-0.02em",
          fontWeight: 400,
          lineHeight: 1.08,
        }}
      >
        {sectionTitle}
      </h2>

      {preset === "drinks" ? (
        <div className="catalog-category-tabs">
          {drinkTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`catalog-category-tab${activeTab === tab.value ? " catalog-category-tab--active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      {displayItems.length === 0 ? (
        <p className="caption mx-auto max-w-md py-14 text-center text-[var(--text-secondary)]">
          Позиции этого блока скоро появятся в меню — спросите бариста в зале или напишите нам в Telegram.
        </p>
      ) : (
      <div className="catalog-product-grid">
        {displayItems.map((item) => {
          const firstSize = item.sizes[0];
          const priceLabel = firstSize ? formatPrice(firstSize.price) : formatPrice(item.price);

          return (
            <article
              key={item.id}
              className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)] transition-shadow duration-[var(--dur-base)] hover:shadow-[var(--shadow-card)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-gray-light)]">
                <Image
                  src={item.images[0]}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-soft)] group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 px-5 pt-[18px] pb-[22px]">
                <p
                  className="mb-2 text-[clamp(15px,1.1vw,17px)] font-medium leading-snug text-[var(--text-primary)]"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  {item.title}
                </p>
                {firstSize ? (
                  <p className="caption mb-3.5 uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                    {firstSize.size}
                  </p>
                ) : null}
                <p className="caption mb-4 line-clamp-2 italic text-[var(--text-secondary)] sm:mb-3.5">{item.composition}</p>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-[color-mix(in_srgb,var(--paloma-coal)_10%,transparent)] pt-2">
                  <span className="font-accent text-base font-bold tabular-nums text-[var(--color-accent-burgundy)]">
                    {priceLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAdd(item)}
                    className="flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-full bg-[var(--color-cherry)] text-[var(--text-on-dark)] transition-colors hover:bg-[var(--color-orange)]"
                    aria-label={`В корзину: ${item.title}`}
                  >
                    <ShoppingBag size={17} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      )}

    </section>
  );
}
