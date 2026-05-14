import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import CoffeeMenuClient from "./CoffeeMenuClient";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PageHero from "@/components/layout/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { siteConfig } from "@/lib/siteConfig";
import { getCoffeeMenuBootstrap } from "@/lib/catalog/getCoffeeMenu";
import { getCatalogBootstrap } from "@/lib/catalog/getCatalogBootstrap";
import ProductCard from "@/components/catalog/ProductCard";

const COFFEE_HERO =
  "https://images.unsplash.com/photo-1534687941688-651ccaafbff8?w=1920&q=85";

const ABOUT_IMG =
  "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1200&q=85";

const ATMOSPHERE = [
  {
    alt: "Гости за столиком в кофейне Paloma",
    src: "https://images.unsplash.com/photo-1445116572660-d38b25c309f4?w=900&q=80",
  },
  {
    alt: "Барная стойка и стаканы с напитками",
    src: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&q=80",
  },
  {
    alt: "Детали интерьера и цветы в зале",
    src: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=900&q=80",
  },
  {
    alt: "Свет и текстуры стола Paloma",
    src: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900&q=80",
  },
] as const;

const SEASONAL = [
  {
    title: "Сезонный раф",
    note: "ваниль · корица · двойной эспрессо",
    img: "https://images.unsplash.com/photo-1517701550927-30cf4ba704d9?w=800&q=80",
  },
  {
    title: "Шоколадный флер",
    note: "какао · молочная пена · какао-крупка",
    img: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&q=80",
  },
  {
    title: "Цитрус матча",
    note: "матча · юдзу · лёд",
    img: "https://images.unsplash.com/photo-1515825838458-f782986f705d?w=800&q=80",
  },
] as const;

export const metadata: Metadata = {
  title: `Кофейня — кофе и выпечка в ${siteConfig.legalName}`,
  description: `Кофейня ${siteConfig.legalName} в ${siteConfig.city}. Авторский кофе, матча, какао, круассаны и десерты. Добавьте кофе к заказу цветов — доставим вместе.`,
};

export default async function CoffeePage() {
  const [coffeeItems, catalogBootstrap] = await Promise.all([
    getCoffeeMenuBootstrap(),
    getCatalogBootstrap(),
  ]);

  const bouquetPicks = catalogBootstrap.products
    .filter((p) => p.inStock && p.category !== "coffee")
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Кофейня", path: "/coffee" },
        ]}
      />

      <PageHero
        crumbs={[{ name: "Главная", href: "/" }, { name: "Кофейня" }]}
        eyebrow={siteConfig.legalName}
        title="Кофейня Paloma"
        lead="Уютная кофейня внутри цветочного салона: двойной эспрессо, авторские напитки и тёплая выпечка — всё в палитре масла и ванили Paloma."
        titleStyle={{ fontSize: "clamp(2.25rem, 4.8vw, 4rem)", lineHeight: 0.95 }}
      >
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_minmax(0,0.95fr)] lg:items-center lg:gap-[var(--space-xl)]">
          <div className="flex flex-wrap gap-3">
            <Link href="/catalog" className="btn-primary">
              Заказать с букетом
            </Link>
            <Link href="/contacts" className="btn-secondary">
              Забронировать столик
            </Link>
          </div>
          <div className="relative aspect-[16/11] min-h-[220px] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-card)]">
            <Image
              src={COFFEE_HERO}
              alt="Интерьер и бар Paloma Coffee"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 540px"
              priority
            />
          </div>
        </div>
      </PageHero>

      <ScrollReveal>
      <section className="border-t border-[var(--color-line)] bg-[var(--bg-primary)] py-[var(--space-xl)] md:py-[var(--space-xxl)]">
        <div className="container mx-auto grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-[var(--space-xl)]">
          <div>
            <p className="font-accent mb-3 text-xs font-medium uppercase italic tracking-[0.22em] text-[var(--color-cherry)]">
              О кофейне
            </p>
            <h2
              className="mb-6 text-[var(--text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.85rem, 3vw, 2.75rem)",
                letterSpacing: "-0.02em",
                fontWeight: 400,
                lineHeight: 1.08,
              }}
            >
              Тихое место с ароматом цветов и зёрна
            </h2>
            <p className="font-accent mb-4 max-w-xl text-[clamp(15px,1.05vw,18px)] leading-relaxed text-[var(--text-secondary)]">
              Мы обжариваем аккуратно, подаём неспешно и держим свет приглушённым — чтобы можно было выпить кофе до
              сборки букета или после долгой прогулки по набережной.
            </p>
            <p className="font-accent max-w-xl text-[clamp(15px,1.05vw,18px)] leading-relaxed text-[var(--text-secondary)]">
              Загляните за стойку: часть ингредиентов те же, что и во флористике — цитрус, специи, мед и ягоды без
              лишней сладости.
            </p>
          </div>
          <div className="relative aspect-[4/5] min-h-[280px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-soft)]">
            <Image src={ABOUT_IMG} alt="Бариста готовит напитки Paloma" fill className="object-cover" sizes="(max-width:1024px) 100vw, 480px" />
          </div>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal>
      <CoffeeMenuClient items={coffeeItems} preset="drinks" sectionTitle="Меню кофе" eyebrow="Напитки" />
      </ScrollReveal>

      <ScrollReveal>
      <div className="border-t border-[var(--color-line)] bg-[var(--bg-primary)]">
        <CoffeeMenuClient items={coffeeItems} preset="pastries" sectionTitle="Меню выпечки" eyebrow="Выпечка и десерты" />
      </div>
      </ScrollReveal>

      <ScrollReveal>
      <section className="border-t border-[var(--color-line)] bg-[var(--bg-card)] py-[var(--space-xl)] md:py-[var(--space-xxl)]">
        <div className="container mx-auto">
          <p className="font-accent mb-3 text-xs font-medium uppercase italic tracking-[0.22em] text-[var(--color-cherry)]">
            Сезон
          </p>
          <h2
            className="mb-8 max-w-xl text-[var(--text-primary)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              letterSpacing: "-0.02em",
              fontWeight: 400,
              lineHeight: 1.08,
            }}
          >
            Лимитированные позиции в баре
          </h2>
          <div className="-mx-[var(--container-padding-mobile)] flex gap-4 overflow-x-auto px-[var(--container-padding-mobile)] pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 [scrollbar-width:thin] snap-x snap-mandatory md:snap-none">
            {SEASONAL.map((item) => (
              <article
                key={item.title}
                className="w-[78vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)] md:w-auto md:max-w-none"
              >
                <div className="relative aspect-[16/11]">
                  <Image src={item.img} alt={item.title} fill className="object-cover" sizes="320px" loading="lazy" />
                </div>
                <div className="p-5">
                  <h3 className="font-accent text-lg font-medium text-[var(--text-primary)]">{item.title}</h3>
                  <p className="caption mt-2 italic text-[var(--text-secondary)]">{item.note}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal>
      <section className="border-t border-[var(--color-line)] bg-[var(--bg-primary)] py-[var(--space-xl)] md:py-[var(--space-xxl)]">
        <div className="container mx-auto">
          <p className="font-accent mb-3 text-xs font-medium uppercase italic tracking-[0.22em] text-[var(--color-cherry)]">
            Атмосфера
          </p>
          <h2
            className="mb-8 max-w-xl text-[var(--text-primary)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              letterSpacing: "-0.02em",
              fontWeight: 400,
              lineHeight: 1.08,
            }}
          >
            Цветы, кофе и спокойный свет
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ATMOSPHERE.map((photo) => (
              <div
                key={photo.src}
                className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] shadow-[var(--shadow-soft)]"
              >
                <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="(max-width:640px) 100vw, 25vw" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal>
      <section className="border-t border-[var(--color-line)] bg-[var(--bg-primary)] py-[var(--space-xl)] md:py-[var(--space-xxl)]">
        <div className="container mx-auto grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-stretch">
          <div className="relative min-h-[280px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-soft)]">
            <Image
              src="https://images.unsplash.com/photo-1560472355-536de3968863?w=1200&q=80"
              alt={`Точка Paloma — ${siteConfig.address}`}
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="font-accent mb-3 text-xs font-medium uppercase italic tracking-[0.22em] text-[var(--color-cherry)]">
              Офлайн
            </p>
            <h2
              className="mb-6 text-[var(--text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                letterSpacing: "-0.02em",
                fontWeight: 400,
              }}
            >
              Приходите к нам на Советов
            </h2>
            <p className="font-accent mb-4 text-[clamp(15px,1.05vw,18px)] leading-relaxed text-[var(--text-secondary)]">
              {siteConfig.address}
            </p>
            <p className="font-accent mb-8 text-[clamp(15px,1.05vw,18px)] leading-relaxed text-[var(--text-secondary)]">
              {siteConfig.workingHours}
            </p>
            <Link
              href={siteConfig.maps}
              className="btn-secondary mb-4 inline-flex w-fit min-h-[44px] items-center justify-center px-8"
              target="_blank"
              rel="noopener noreferrer"
            >
              Открыть карту
            </Link>
            <Link href={`tel:${siteConfig.phoneTel}`} className="font-accent text-[var(--color-coal)] underline-offset-4 hover:underline">
              {siteConfig.phone}
            </Link>
          </div>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal>
      <section className="border-t border-[var(--color-line)] bg-[var(--bg-card)] py-[var(--space-xl)] md:py-[var(--space-xxl)]">
        <div className="container mx-auto">
          <p className="font-accent mb-3 text-xs font-medium uppercase italic tracking-[0.22em] text-[var(--color-cherry)]">
            Цветы рядом
          </p>
          <h2
            className="mb-4 max-w-xl text-[var(--text-primary)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              letterSpacing: "-0.02em",
              fontWeight: 400,
              lineHeight: 1.08,
            }}
          >
            Комбо: букет, кофе и десерт
          </h2>
          <p className="font-accent mb-10 max-w-xl text-[clamp(15px,1.05vw,18px)] leading-relaxed text-[var(--text-secondary)]">
            Соберите один заказ: цветы из витрины, напиток и выпечку или десерт — привезём одной доставкой или подготовим к вашему визиту в салон.
          </p>
          {bouquetPicks.length > 0 ? (
            <div className="catalog-product-grid mx-auto max-w-5xl">
              {bouquetPicks.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="caption text-[var(--text-secondary)]">Сейчас витрина обновляется — загляните в каталог чуть позже.</p>
          )}
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal>
      <section className="border-t border-[var(--color-line)] bg-[var(--bg-primary)] py-[var(--space-xl)] md:py-[var(--space-xxl)]">
        <div className="container mx-auto text-center">
          <p className="font-accent mb-3 text-xs font-medium uppercase italic tracking-[0.2em] text-[var(--color-cherry)]">
            Одна доставка
          </p>
          <h2
            className="mx-auto mb-4 max-w-2xl text-balance text-[var(--text-primary)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              letterSpacing: "-0.02em",
              fontWeight: 400,
              lineHeight: 1.1,
            }}
          >
            Заказ в один клик: цветы, кофе, десерт
          </h2>
          <p className="font-accent mx-auto mb-8 max-w-md text-[clamp(15px,1.05vw,18px)] leading-relaxed text-[var(--text-secondary)] md:text-base">
            Оформите доставку или самовывоз в корзине — добавляйте позиции из каталога и меню бара.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contacts" className="btn-primary">
              Связаться
            </Link>
            <Link href="/catalog" className="btn-secondary">
              Перейти в каталог
            </Link>
          </div>
        </div>
      </section>
      </ScrollReveal>
    </div>
  );
}
