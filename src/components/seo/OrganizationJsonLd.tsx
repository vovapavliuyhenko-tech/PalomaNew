import { siteConfig } from "@/lib/siteConfig";
import { SCHEMA_IDS } from "@/lib/schemaIds";

export default function OrganizationJsonLd() {
  const base = siteConfig.siteUrl.replace(/\/$/, "");

  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": SCHEMA_IDS.organization,
    name: siteConfig.legalName,
    alternateName: siteConfig.name,
    url: siteConfig.siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${base}/og/default.jpg`,
    },
    email: siteConfig.email,
    telephone: siteConfig.phoneTel,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address,
      addressLocality: siteConfig.city,
      addressCountry: "RU",
    },
    sameAs: [siteConfig.instagram, siteConfig.telegram, siteConfig.whatsapp].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
