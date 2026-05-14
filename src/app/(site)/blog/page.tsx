import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/layout/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import BlogItemListJsonLd from "@/components/seo/BlogItemListJsonLd";
import { BLOG_POSTS, getBlogCategoryFilters } from "@/data/blogPosts";
import { siteConfig } from "@/lib/siteConfig";

const defaultMeta: Metadata = {
  title: `Блог о цветах — ${siteConfig.legalName}`,
  description: `Советы по уходу за цветами, тренды флористики, свадебная флористика, рецепты из кофейни ${siteConfig.legalName}.`,
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}): Promise<Metadata> {
  const { cat } = await searchParams;
  if (!cat) return defaultMeta;
  const label = getBlogCategoryFilters().find((f) => f.key === cat)?.label;
  if (!label) return defaultMeta;
  return {
    title: `${label} — блог | ${siteConfig.legalName}`,
    description: `Материалы рубрики «${label}» в блоге ${siteConfig.legalName}.`,
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const filters = getBlogCategoryFilters();
  const validKeys = new Set(filters.map((f) => f.key));
  const activeCat = cat && validKeys.has(cat) ? cat : undefined;
  const posts = activeCat ? BLOG_POSTS.filter((p) => p.categoryKey === activeCat) : BLOG_POSTS;
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
      <BlogItemListJsonLd items={posts.map((p) => ({ slug: p.slug, title: p.title }))} />
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
        {posts.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)] text-center py-12">
            В этой рубрике пока нет материалов.
          </p>
        ) : (
          <div className="grid gap-[var(--space-lg)] md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <div className="relative aspect-video rounded-[var(--radius-md)] overflow-hidden mb-4 border border-[var(--border)] shadow-[var(--shadow-soft)] transition-shadow duration-[var(--dur-slow)] group-hover:shadow-[var(--shadow-card)]">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-[var(--dur-slow)] group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                </div>
                <div>
                  <span className="text-xs text-[var(--color-cherry)] uppercase tracking-[var(--ls-widest)]">
                    {post.categoryLabel}
                  </span>
                  <h3
                    className="text-xl mt-1.5 mb-2 text-[var(--text-primary)] group-hover:text-[var(--color-cherry)] transition-colors"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {post.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-3 leading-relaxed">{post.excerpt}</p>
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
