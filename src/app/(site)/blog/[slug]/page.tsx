import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import BlogPostingJsonLd from "@/components/seo/BlogPostingJsonLd";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getAllBlogSlugs, getBlogPostBySlug } from "@/data/blogPosts";

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.image] },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[var(--bg-card)]">
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Блог", path: "/blog" },
          { name: post.title, path: `/blog/${slug}` },
        ]}
      />
      <BlogPostingJsonLd slug={slug} post={post} />
      <div className="relative h-[50vh] min-h-[350px]">
        <Image src={post.image} alt={post.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--paloma-coal)_45%,transparent)]" />
        <div className="absolute inset-x-0 bottom-0 container mx-auto max-w-4xl py-8">
          <p className="font-accent text-xs font-medium uppercase italic tracking-[0.22em] text-[var(--paloma-orange)]">
            {post.category}
          </p>
          <div
            className="mb-5 mt-3 h-px w-12 bg-[color-mix(in_srgb,var(--paloma-orange)_42%,transparent)]"
            aria-hidden
          />
          <h1
            className="text-balance text-[var(--text-on-dark)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4.2vw, 3.25rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              fontWeight: 400,
            }}
          >
            {post.title}
          </h1>
        </div>
      </div>

      <ScrollReveal>
      <div className="container mx-auto max-w-3xl py-12">
        <nav
          className="mb-6 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-[var(--text-secondary)]"
          aria-label="Хлебные крошки"
        >
          {(
            [
              { name: "Главная", href: "/" },
              { name: "Блог", href: "/blog" },
              { name: post.title },
            ] as { name: string; href?: string }[]
          ).map((c, i) => (
            <Fragment key={`${c.name}-${i}`}>
              {i > 0 && (
                <span className="text-[var(--text-secondary)]/50" aria-hidden>
                  /
                </span>
              )}
              {c.href ? (
                <Link
                  href={c.href}
                  className="transition-colors hover:text-[var(--paloma-orange)]"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  {c.name}
                </Link>
              ) : (
                <span className="text-[var(--text-primary)]" style={{ fontFamily: "var(--font-accent)" }}>
                  {c.name}
                </span>
              )}
            </Fragment>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mb-8">
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.author}</span>
        </div>

        <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line [&_strong]:text-[var(--text-primary)]">
          {post.content}
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <Link
            href="/blog"
            className="text-sm text-[var(--color-cherry)] underline-offset-2 transition-colors hover:text-[var(--paloma-burgundy)] hover:underline"
          >
            ← Вернуться в блог
          </Link>
        </div>
      </div>
      </ScrollReveal>
    </div>
  );
}
