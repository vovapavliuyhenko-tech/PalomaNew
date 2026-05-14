import type { Metadata } from "next";
import CatalogListingPage from "./CatalogListingPage";
import { getCatalogBootstrap } from "@/lib/catalog/getCatalogBootstrap";
import { getCatalogCategoryMeta } from "@/lib/catalog/catalogCategoryMeta";
import { siteConfig } from "@/lib/siteConfig";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const { category } = await searchParams;
  const meta = category ? getCatalogCategoryMeta(category) : null;

  return {
    title: meta ? `${meta.title} | Каталог` : `Каталог букетов с доставкой в ${siteConfig.city}`,
    description: meta
      ? meta.desc
      : `Выберите из каталога ${siteConfig.legalName}. Доставка в ${siteConfig.city} и побережье.`,
    openGraph: { images: ["/og/catalog.jpg"] },
  };
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ category }, bootstrap] = await Promise.all([searchParams, getCatalogBootstrap()]);
  const meta = category ? getCatalogCategoryMeta(category) : null;
  const pathCategorySlug = meta && category ? category : "";

  return <CatalogListingPage bootstrap={bootstrap} meta={meta} pathCategorySlug={pathCategorySlug} />;
}
