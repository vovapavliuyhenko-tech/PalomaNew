import Link from "next/link";
import { notFound } from "next/navigation";

import ProductEditForm from "../../ProductEditForm";
import ProductImagesSection, {
  type ProductImageCard,
} from "../../ProductImagesSection";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";

function svc() {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

function normalizeProductImages(rel: unknown): ProductImageCard[] {
  let arr: unknown[];
  if (rel == null) arr = [];
  else if (Array.isArray(rel)) arr = rel;
  else arr = [rel];

  return arr.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const o = row as Record<string, unknown>;
    const id = o.id;
    const url = o.image_url;
    if (typeof id !== "string" || typeof url !== "string") return [];
    const alt = o.alt_text;
    const ord = Number(o.display_order ?? 0);
    return [
      {
        id,
        image_url: url,
        alt_text: alt === undefined || alt === null ? null : String(alt),
        display_order: Number.isFinite(ord) ? ord : 0,
      },
    ];
  });
}

export default async function AdminProductsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = svc();

  if (!client) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-text-secondary-token)]">Нет SUPABASE_SERVICE_ROLE_KEY.</p>
      </div>
    );
  }

  const [{ data: product, error: pErr }, { data: categories }] = await Promise.all([
    client.from("products").select("*, product_images(*)").eq("id", id).maybeSingle(),
    client.from("categories").select("id,name,slug").order("display_order", { ascending: true }),
  ]);

  if (pErr || !product) notFound();

  const imageRows = normalizeProductImages(
    "product_images" in product ? (product as { product_images?: unknown }).product_images : undefined,
  );

  return (
    <div className="space-y-8">
      <Link href="/admin/products" className="text-xs text-[var(--color-accent-primary)] hover:underline">
        ← все товары
      </Link>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Редактирование</h1>
        <p className="mt-1 font-mono text-xs text-[var(--color-text-secondary-token)]">{product.slug}</p>
      </div>
      <ProductEditForm
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          description: product.description,
          composition: product.composition,
          category_id: product.category_id,
          display_order: product.display_order,
          is_available: product.is_available,
          is_ready_today: product.is_ready_today,
        }}
        categories={(categories ?? []) as { id: string; name: string; slug: string }[]}
      />
      <ProductImagesSection
        productId={product.id}
        slug={typeof product.slug === "string" ? product.slug.toLowerCase() : String(product.slug)}
        images={imageRows}
      />
    </div>
  );
}
