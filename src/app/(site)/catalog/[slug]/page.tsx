import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import CatalogListingPage from "../CatalogListingPage";
import { siteConfig } from "@/lib/siteConfig";
import { resolveProductDetail } from "@/lib/catalog/resolveProductDetail";
import { getCatalogBootstrap } from "@/lib/catalog/getCatalogBootstrap";
import { getCatalogCategoryMeta } from "@/lib/catalog/catalogCategoryMeta";
import { getCatalogCategorySegmentsForStatic, isCatalogCategorySegment } from "@/lib/catalog/prdCategoryFilter";
import { productPath } from "@/lib/constants";

export async function generateStaticParams() {
  return getCatalogCategorySegmentsForStatic().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const productResolved = await resolveProductDetail(slug);
  if (productResolved) {
    const { product } = productResolved;
    return {
      title: `${product.title} — купить с доставкой в ${siteConfig.city}`,
      description: `${product.description} ${product.composition}`.slice(0, 300),
      openGraph: {
        images: product.images.length ? [product.images[0]] : [],
      },
    };
  }

  const catMeta = getCatalogCategoryMeta(slug);
  if (catMeta) {
    return {
      title: `${catMeta.title} | Каталог`,
      description: catMeta.desc,
      openGraph: { images: ["/og/catalog.jpg"] },
    };
  }

  return {};
}

export default async function CatalogSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveProductDetail(slug);

  if (resolved) {
    permanentRedirect(productPath(slug));
  }

  if (!isCatalogCategorySegment(slug)) notFound();

  const meta = getCatalogCategoryMeta(slug);
  if (!meta) notFound();

  const bootstrap = await getCatalogBootstrap();
  return <CatalogListingPage bootstrap={bootstrap} meta={meta} pathCategorySlug={slug} />;
}
