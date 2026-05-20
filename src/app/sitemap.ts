import type { MetadataRoute } from "next";
import { mockProducts } from "@/data/mockProducts";
import { getAllBlogSlugs } from "@/data/blogPosts";
import { siteConfig } from "@/lib/siteConfig";
import { getCatalogCategorySegmentsForStatic } from "@/lib/catalog/prdCategoryFilter";
import { productPath } from "@/lib/constants";

const STATIC = [
  "",
  "/catalog",
  "/cart",
  "/coffee",
  "/subscription",
  "/wedding-piggybank",
  "/wedding",
  "/events",
  "/gifts",
  "/about",
  "/delivery",
  "/payment",
  "/payment/success",
  "/payment/failed",
  "/care",
  "/faq",
  "/contacts",
  "/blog",
  "/privacy",
  "/offer",
  "/consent",
] as const;

/** Static export (GitHub Pages): metadata route должен быть явно статическим. */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.siteUrl.replace(/\/$/, "");
  const now = new Date();

  const staticUrls = STATIC.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : path === "/catalog" ? 0.9 : 0.7,
  }));

  const catalogCategories = getCatalogCategorySegmentsForStatic().map((slug) => ({
    url: `${base}/catalog/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const products = mockProducts
    .filter((p) => p.inStock)
    .map((p) => ({
      url: `${base}${productPath(p.slug)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.85,
    }));

  const posts = getAllBlogSlugs().map((slug) => ({
    url: `${base}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticUrls, ...catalogCategories, ...products, ...posts];
}
