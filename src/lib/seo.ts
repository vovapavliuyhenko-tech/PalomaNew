import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";

type PageMetaArgs = {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  ogImage?: string;
};

/** Единые defaults для статических страниц (App Router `metadata`). */
export function definePageMeta({
  title,
  description,
  path,
  noIndex,
  ogImage,
}: PageMetaArgs): Metadata {
  const url = path ? `${siteConfig.siteUrl.replace(/\/$/, "")}${path}` : siteConfig.siteUrl;
  return {
    title,
    description,
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      locale: "ru_RU",
      siteName: siteConfig.legalName,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}
