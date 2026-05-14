import { siteConfig } from "@/lib/siteConfig";
import { SCHEMA_IDS } from "@/lib/schemaIds";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export default function LocalBusinessJsonLd() {
  const base = siteConfig.siteUrl.replace(/\/$/, "");

  const data = {
    "@context": "https://schema.org",
    "@type": "Florist",
    "@id": SCHEMA_IDS.florist,
    parentOrganization: { "@id": SCHEMA_IDS.organization },
    name: siteConfig.legalName,
    image: `${base}/og/default.jpg`,
    url: `${base}/`,
    telephone: siteConfig.phoneTel,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address,
      addressLocality: siteConfig.city,
      addressCountry: "RU",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [...DAYS],
        opens: "08:00",
        closes: "22:00",
      },
    ],
    sameAs: [siteConfig.instagram, siteConfig.telegram, siteConfig.whatsapp].filter(Boolean),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
