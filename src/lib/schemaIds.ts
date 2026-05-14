import { siteConfig } from "@/lib/siteConfig";

const base = siteConfig.siteUrl.replace(/\/$/, "");

/** Стабильные @id для связи блоков JSON-LD (Organization, точка продаж, сайт). */
export const SCHEMA_IDS = {
  organization: `${base}/#organization`,
  florist: `${base}/#florist`,
  website: `${base}/#website`,
} as const;
