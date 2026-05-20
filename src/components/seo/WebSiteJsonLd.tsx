import { siteConfig } from "@/lib/siteConfig";
import { SCHEMA_IDS } from "@/lib/schemaIds";

export default function WebSiteJsonLd() {
  const base = siteConfig.siteUrl.replace(/\/$/, "");

  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SCHEMA_IDS.website,
    name: siteConfig.legalName,
    alternateName: siteConfig.name,
    url: `${base}/`,
    publisher: { "@id": SCHEMA_IDS.organization },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}/catalog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
