import { siteConfig } from "@/lib/siteConfig";
import { productPath } from "@/lib/constants";

type Item = { slug: string; title: string };

type Props = { items: Item[] };

/** Список позиций каталога в наличии (для SEO; не зависит от клиентских фильтров). */
export default function CatalogItemListJsonLd({ items }: Props) {
  const base = siteConfig.siteUrl.replace(/\/$/, "");

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${base}${productPath(p.slug)}`,
      name: p.title,
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
