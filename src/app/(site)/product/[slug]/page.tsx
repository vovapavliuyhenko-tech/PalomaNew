import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import ProductDetailClient from "@/components/catalog/ProductDetailClient";
import { productPath } from "@/lib/constants";
import { siteConfig } from "@/lib/siteConfig";
import { resolveProductDetail } from "@/lib/catalog/resolveProductDetail";
import { getCatalogStaticSlugParams } from "@/lib/catalog/getCatalogBootstrap";

export async function generateStaticParams() {
  return getCatalogStaticSlugParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveProductDetail(slug);
  if (!resolved) return {};

  const { product } = resolved;

  return {
    title: `${product.title} — купить с доставкой в ${siteConfig.city}`,
    description: `${product.description} ${product.composition}`.slice(0, 300),
    openGraph: {
      images: product.images.length ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveProductDetail(slug);

  if (!resolved) notFound();

  const { product, related, upsell } = resolved;
  const path = productPath(product.slug);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Каталог", path: "/catalog" },
          { name: product.title, path },
        ]}
      />
      <ProductJsonLd product={product} />
      <ProductDetailClient product={product} related={related} upsell={upsell} />
    </>
  );
}
