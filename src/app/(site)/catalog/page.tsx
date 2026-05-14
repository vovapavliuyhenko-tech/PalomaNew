import type { Metadata } from "next";
import { Suspense } from "react";
import CatalogListingPage from "./CatalogListingPage";
import { getCatalogBootstrap } from "@/lib/catalog/getCatalogBootstrap";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: `Каталог букетов с доставкой в ${siteConfig.city}`,
  description: `Выберите из каталога ${siteConfig.legalName}. Доставка в ${siteConfig.city} и побережье.`,
  openGraph: { images: ["/og/catalog.jpg"] },
};

export default async function CatalogPage() {
  const bootstrap = await getCatalogBootstrap();

  return <CatalogListingPage bootstrap={bootstrap} meta={null} pathCategorySlug="" />;
}
