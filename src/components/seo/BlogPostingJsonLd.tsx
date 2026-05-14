import { siteConfig } from "@/lib/siteConfig";
import { SCHEMA_IDS } from "@/lib/schemaIds";
import type { BlogPost } from "@/data/blogPosts";

type Props = { slug: string; post: BlogPost };

export default function BlogPostingJsonLd({ slug, post }: Props) {
  const base = siteConfig.siteUrl.replace(/\/$/, "");
  const url = `${base}/blog/${slug}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: [post.image],
    datePublished: post.datePublished,
    dateModified: post.datePublished,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: { "@id": SCHEMA_IDS.organization },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
