import type { SupabaseClient } from "@supabase/supabase-js";

export type IncomingLineItem = {
  slug: string;
  productId: string;
  title: string;
  unitPrice: number;
  qty: number;
  size: string;
};

export interface ValidatedLine {
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  titleFromClient: string;
  sizeLabel: string;
}

const PRICE_EPS = 0.5;

function isUuidLike(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s.trim()
  );
}

export async function validateCheckoutLines(
  supabase: SupabaseClient,
  lines: IncomingLineItem[]
): Promise<{ ok: true; validated: ValidatedLine[] } | { ok: false; errors: string[] }> {
  if (!lines.length) return { ok: false, errors: ["Пустая корзина"] };

  const slugs = [...new Set(lines.map((l) => l.slug).filter(Boolean))];
  const uuidIds = [...new Set(lines.map((l) => l.productId).filter(isUuidLike))];

  const { data: bySlugRows, error: slugErr } = await supabase
    .from("products")
    .select("id, slug, price, is_available")
    .eq("is_available", true)
    .in("slug", slugs);

  if (slugErr) return { ok: false, errors: [slugErr.message] };

  const { data: byIdRows, error: idErr } =
    uuidIds.length === 0
      ? { data: [] as { id: string; slug: string; price: number; is_available: boolean }[], error: null }
      : await supabase.from("products").select("id, slug, price, is_available").in("id", uuidIds).eq(
          "is_available",
          true
        );

  if (idErr) return { ok: false, errors: [idErr.message] };

  const slugMap = new Map((bySlugRows ?? []).map((r) => [r.slug, r]));
  const idMap = new Map((byIdRows ?? []).map((r) => [r.id, r]));

  const errors: string[] = [];
  const validated: ValidatedLine[] = [];

  for (const line of lines) {
    if (!Number.isFinite(line.unitPrice) || line.unitPrice <= 0) errors.push(`${line.slug}: некорректная цена`);
    if (!Number.isInteger(line.qty) || line.qty < 1) errors.push(`${line.slug}: некорректное количество`);

    let row = slugMap.get(line.slug);
    if (!row && isUuidLike(line.productId)) row = idMap.get(line.productId) ?? undefined;

    if (!row) {
      errors.push(`Товар не найден в каталоге: ${line.slug || line.productId}`);
      continue;
    }

    const serverPrice = Number(row.price);
    if (!Number.isFinite(serverPrice) || Math.abs(serverPrice - line.unitPrice) > PRICE_EPS) {
      errors.push(
        `Цена устарела: «${line.title || row.slug}» — актуально ${Math.round(serverPrice)} ₽, обновите корзину`
      );
      continue;
    }

    validated.push({
      productId: row.id,
      quantity: line.qty,
      unitPrice: serverPrice,
      lineTotal: serverPrice * line.qty,
      titleFromClient: line.title,
      sizeLabel: line.size,
    });
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, validated };
}
