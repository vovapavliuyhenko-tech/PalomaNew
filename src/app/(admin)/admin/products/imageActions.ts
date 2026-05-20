"use server";

import { revalidatePath } from "next/cache";

import { requireAdminOrRedirect } from "@/lib/admin/requireAdminOrRedirect";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import {
  buildStorageObjectPath,
  parseStoragePathFromPublicUrl,
  productImagesBucket,
  validateImageFile,
} from "@/lib/storage/productImages";

function svc() {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

export type ImgFormState = { error?: string; ok?: boolean; at?: number } | null;

function revalidateAdminProductEdit(productId: string, slug: string) {
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/catalog");
  revalidatePath(`/product/${slug}`);
  revalidatePath(`/catalog/${slug}`);
}

export async function uploadProductImage(_prev: ImgFormState, formData: FormData): Promise<ImgFormState> {
  await requireAdminOrRedirect();
  const sb = svc();
  if (!sb) return { error: "Нет SUPABASE_SERVICE_ROLE_KEY на сервере." };

  const productId = String(formData.get("product_id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const altFallback = String(formData.get("alt_text") ?? "").trim() || null;
  const file = formData.get("file");

  if (!productId) return { error: "Не указан товар." };
  if (!slug) return { error: "Не указан slug для сброса кэша." };

  const v = validateImageFile(file);
  if (!v.ok) {
    return { error: v.error };
  }
  const { ext } = v;

  const { data: product, error: pErr } = await sb.from("products").select("id").eq("id", productId).maybeSingle();

  if (pErr || !product) return { error: "Товар не найден." };

  const { data: lastRows } = await sb
    .from("product_images")
    .select("display_order")
    .eq("product_id", productId)
    .order("display_order", { ascending: false })
    .limit(1);

  const prevNum = Number(lastRows?.[0]?.display_order);
  const display_order = Number.isFinite(prevNum) ? prevNum + 1 : 0;

  const bucket = productImagesBucket();
  const storagePath = buildStorageObjectPath(productId, ext);
  const buffer = Buffer.from(await (file as File).arrayBuffer());

  const up = await sb.storage.from(bucket).upload(storagePath, buffer, {
    contentType: (file as File).type || `image/${ext === "jpg" ? "jpeg" : ext}`,
    upsert: false,
  });

  if (up.error) {
    return {
      error: up.error.message.includes("Bucket") || up.error.message.includes("bucket")
        ? `Проверьте bucket Storage «${bucket}» (или переменную SUPABASE_STORAGE_BUCKET_PRODUCTS).`
        : up.error.message,
    };
  }

  const pub = sb.storage.from(bucket).getPublicUrl(storagePath);
  const image_url = pub.data.publicUrl;

  const ins = await sb.from("product_images").insert({
    product_id: productId,
    image_url,
    alt_text: altFallback,
    display_order,
  });

  if (ins.error) {
    await sb.storage.from(bucket).remove([storagePath]).catch(() => undefined);
    return { error: ins.error.message };
  }

  revalidateAdminProductEdit(productId, slug);
  return { ok: true, at: Date.now() };
}

export async function deleteProductImage(_prev: ImgFormState, formData: FormData): Promise<ImgFormState> {
  await requireAdminOrRedirect();
  const sb = svc();
  if (!sb) return { error: "Нет SUPABASE_SERVICE_ROLE_KEY на сервере." };

  const imageId = String(formData.get("image_id") ?? "").trim();
  const productId = String(formData.get("product_id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();

  if (!imageId || !productId || !slug) return { error: "Недостаточно данных." };

  const { data: row, error: fErr } = await sb
    .from("product_images")
    .select("id, image_url, product_id")
    .eq("id", imageId)
    .maybeSingle();

  if (fErr || !row || row.product_id !== productId) {
    return { error: "Запись изображения не найдена." };
  }

  const bucket = productImagesBucket();
  const storagePath = parseStoragePathFromPublicUrl(row.image_url, bucket);

  if (storagePath) {
    await sb.storage.from(bucket).remove([storagePath]).catch(() => undefined);
  }

  const { error: delErr } = await sb.from("product_images").delete().eq("id", imageId);
  if (delErr) return { error: delErr.message };

  revalidateAdminProductEdit(productId, slug);
  return { ok: true, at: Date.now() };
}

export async function updateProductImageRow(_prev: ImgFormState, formData: FormData): Promise<ImgFormState> {
  await requireAdminOrRedirect();
  const sb = svc();
  if (!sb) return { error: "Нет SUPABASE_SERVICE_ROLE_KEY на сервере." };

  const imageId = String(formData.get("image_id") ?? "").trim();
  const productId = String(formData.get("product_id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const alt_text = String(formData.get("alt_text") ?? "").trim() || null;
  const orderRaw = String(formData.get("display_order") ?? "0");
  const display_order = Number.parseInt(orderRaw, 10);

  if (!imageId || !productId || !slug) return { error: "Недостаточно данных." };
  if (!Number.isFinite(display_order)) return { error: "Некорректный порядок." };

  const { error } = await sb
    .from("product_images")
    .update({ alt_text, display_order })
    .eq("id", imageId)
    .eq("product_id", productId);

  if (error) return { error: error.message };

  revalidateAdminProductEdit(productId, slug);
  return { ok: true, at: Date.now() };
}
