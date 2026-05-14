import { siteConfig } from "@/lib/siteConfig";

type Item = { slug: string; title: string };

type Props = { items: Item[] };

export default function BlogItemListJsonLd({ items }: Props) {
  const base = siteConfig.siteUrl.replace(/\/$/, "");

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${base}/blog/${post.slug}`,
      name: post.title,
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
