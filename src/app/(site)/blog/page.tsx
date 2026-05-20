import type { Metadata } from "next";
import { Suspense } from "react";
import { BLOG_POSTS, getBlogCategoryFilters } from "@/data/blogPosts";
import { siteConfig } from "@/lib/siteConfig";
import BlogPageClient from "./BlogPageClient";

export const metadata: Metadata = {
  title: `Блог о цветах — ${siteConfig.legalName}`,
  description: `Советы по уходу за цветами, тренды флористики, свадебная флористика, рецепты из кофейни ${siteConfig.legalName}.`,
};

export default function BlogPage() {
  const filters = getBlogCategoryFilters();

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] bg-[var(--bg-card)]" aria-busy="true" aria-label="Загрузка блога" />
      }
    >
      <BlogPageClient filters={filters} posts={BLOG_POSTS} />
    </Suspense>
  );
}
