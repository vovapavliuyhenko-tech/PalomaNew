"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import PageHero from "@/components/layout/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import BlogItemListJsonLd from "@/components/seo/BlogItemListJsonLd";
import type { BlogCategoryFilter, BlogPost } from "@/data/blogPosts";

export default function BlogPageClient({
  filters,
  posts,
}: {
  filters: BlogCategoryFilter[];
  posts: BlogPost[];
}) {
  const searchParams = useSearchParams();
  const cat = searchParams.get("cat") ?? undefined;

  const validKeys = useMemo(() => new Set(filters.map((f) => f.key)), [filters]);
  const activeCat = cat && validKeys.has(cat) ? cat : undefined;

  const filtered = useMemo(
    () => (activeCat ? posts.filter((p) => p.categoryKey === activeCat) : posts),
    [posts, activeCat],
  );

  const catLabel = activeCat ? filters.find((f) => f.key === activeCat)?.label : undefined;

  const breadcrumbItems =
    catLabel && activeCat
      ? ([
          { name: "Главная", path: "/" },
          { name: "Блог", path: "/blog" },
          { name: catLabel, path: `/blog?cat=${encodeURIComponent(activeCat)}` },
        ] as const)
      : ([
          { name: "Главная", path: "/" },
          { name: "Блог", path: "/blog" },
        ] as const);

  const heroCrumbs =
    catLabel && activeCat
      ? ([
          { name: "Главная", href: "/" as const },
          { name: "Блог", href: "/blog" as const },
          { name: catLabel },
        ] as const)
      : ([
          { name: "Главная", href: "/" as const },
          { name: "Блог" },
        ] as const);

  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd items={[...breadcrumbItems]} />
      <BlogItemListJsonLd items={filtered.map((p) => ({ slug: p.slug, title: p.title }))} />
      <PageHero
        crumbs={[...heroCrumbs]}
        eyebrow="Журнал"
        title="Блог"
        lead="Советы флористов, тренды и вдохновение для вашего дома"
      >
        <div className="flex flex-wrap gap-2">
          <Link
            href="/blog"
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              !activeCat
                ? "border-[var(--color-cherry)] bg-[var(--color-cherry)]/10 text-[var(--text-primary)]"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--color-cherry)]/50"
            }`}
          >
            Все
          </Link>
          {filters.map((f) => (
            <Link
              key={f.key}
              href={`/blog?cat=${encodeURIComponent(f.key)}`}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                activeCat === f.key
                  ? "border-[var(--color-cherry)] bg-[var(--color-cherry)]/10 text-[var(--text-primary)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--color-cherry)]/50"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </PageHero>

      <ScrollReveal>
        <div className="container mx-auto py-[var(--space-xl)] md:py-[var(--space-xxl)]">
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-sm text-[var(--text-secondary)]">
              В этой рубрике пока нет материалов.
            </p>
          ) : (
            <div className="grid gap-[var(--space-lg)] md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                  <div className="relative mb-4 aspect-video overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] shadow-[var(--shadow-soft)] transition-shadow duration-[var(--dur-slow)] group-hover:shadow-[var(--shadow-card)]">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-[var(--dur-slow)] group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-[var(--ls-widest)] text-[var(--color-cherry)]">
                      {post.categoryLabel}
                    </span>
                    <h3
                      className="mb-2 mt-1.5 text-xl text-[var(--text-primary)] transition-colors group-hover:text-[var(--color-cherry)]"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {post.title}
                    </h3>
                    <p className="mb-3 text-sm leading-relaxed text-[var(--text-secondary)]">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]/80">
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.author}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
