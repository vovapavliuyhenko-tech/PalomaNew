import { Suspense } from "react";
import CatalogContent from "./CatalogContent";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import CatalogItemListJsonLd from "@/components/seo/CatalogItemListJsonLd";
import PageHero from "@/components/layout/PageHero";
import type { CatalogBootstrap } from "@/lib/catalog/getCatalogBootstrap";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/lib/siteConfig";

export default function CatalogListingPage({
  bootstrap,
  meta,
  pathCategorySlug,
}: {
  bootstrap: CatalogBootstrap;
  meta: { title: string; desc: string } | null;
  /** Сегмент URL или `?category=` — для фильтрации и хлебных крошек */
  pathCategorySlug: string;
}) {
  const isCategory = Boolean(meta && pathCategorySlug);
  const categoryPath =
    pathCategorySlug && meta ? `/catalog/${encodeURIComponent(pathCategorySlug)}` : "/catalog";

  const breadcrumbItems = isCategory
    ? ([
        { name: "Главная", path: "/" },
        { name: "Каталог", path: "/catalog" },
        { name: meta!.title, path: categoryPath },
      ] as const)
    : ([
        { name: "Главная", path: "/" },
        { name: "Каталог", path: "/catalog" },
      ] as const);

  const catalogListItems = bootstrap.products.filter((p) => p.inStock).map((p) => ({ slug: p.slug, title: p.title }));

  const catalogDescription = isCategory
    ? meta!.desc
    : `Соберите букет под повод и настроение — доставка в ${siteConfig.city} и побережье. При заказе от ${formatPrice(siteConfig.minOrderFreeDelivery)} — бесплатная доставка в зонах на странице доставки.`;

  const heroCrumbs = isCategory
    ? ([
        { name: "Главная", href: "/" as const },
        { name: "Каталог", href: "/catalog" as const },
        { name: meta!.title },
      ] as const)
    : ([
        { name: "Главная", href: "/" as const },
        { name: "Каталог" },
      ] as const);

  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd items={[...breadcrumbItems]} />
      <CatalogItemListJsonLd items={catalogListItems} />
      <PageHero
        crumbs={[...heroCrumbs]}
        eyebrow={isCategory ? "Раздел" : "Коллекция"}
        title={isCategory ? meta!.title : "Каталог букетов"}
        lead={catalogDescription}
      />

      <Suspense
        fallback={
          <div className="container mx-auto py-[var(--space-xl)] md:py-[var(--space-xxl)] text-center text-sm text-[var(--text-secondary)]">
            Загрузка фильтров…
          </div>
        }
      >
        <CatalogContent
          initialProducts={bootstrap.products}
          categoryOptions={bootstrap.categoryOptions}
          filterMode={bootstrap.filterMode}
          showSizeFilter={bootstrap.showSizeFilter}
          pathCategorySlug={pathCategorySlug}
        />
      </Suspense>
    </div>
  );
}
