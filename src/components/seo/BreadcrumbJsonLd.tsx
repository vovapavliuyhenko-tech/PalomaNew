import { siteConfig } from "@/lib/siteConfig";

export type BreadcrumbItem = { name: string; path: string };

type Props = { items: BreadcrumbItem[] };

export default function BreadcrumbJsonLd({ items }: Props) {
  const base = siteConfig.siteUrl.replace(/\/$/, "");
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${base}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
