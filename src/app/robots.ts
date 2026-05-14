import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";

/** Static export (GitHub Pages): metadata route должен быть явно статическим. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.siteUrl.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio/", "/api/", "/checkout/", "/admin/", "/design-system"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
