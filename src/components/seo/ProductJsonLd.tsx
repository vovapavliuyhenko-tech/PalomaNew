import { siteConfig } from "@/lib/siteConfig";
import { SCHEMA_IDS } from "@/lib/schemaIds";
import { getMinPrice, type MockProduct } from "@/data/mockProducts";
import { productPath } from "@/lib/constants";

type Props = { product: MockProduct };

export default function ProductJsonLd({ product }: Props) {
  const low = getMinPrice(product);
  const base = siteConfig.siteUrl.replace(/\/$/, "");
  const productUrl = `${base}${productPath(product.slug)}`;
  const offers = product.sizes.map((s) => ({
    "@type": "Offer",
    price: s.price,
    priceCurrency: "RUB",
    availability: "https://schema.org/InStock",
    name: s.size,
  }));

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    url: productUrl,
    name: product.title,
    description: product.description,
    image: product.images,
    brand: { "@type": "Brand", name: siteConfig.legalName },
    manufacturer: { "@id": SCHEMA_IDS.organization },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: low,
      highPrice: Math.max(...product.sizes.map((s) => s.price)),
      priceCurrency: "RUB",
      offerCount: product.sizes.length,
      offers,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
