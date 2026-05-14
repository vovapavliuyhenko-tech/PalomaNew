import { definePageMeta } from "@/lib/seo";

export { definePageMeta };

type JsonLdProps = { data: Record<string, unknown> };

/** Вставка JSON-LD в разметку страницы (Server Component). */
export function JsonLdScript({ data }: JsonLdProps) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
