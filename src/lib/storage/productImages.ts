import { randomUUID } from "node:crypto";

/** Имя публичного bucket в Supabase Storage (задаётся в dashboard). */
export function productImagesBucket(): string {
  return (process.env.SUPABASE_STORAGE_BUCKET_PRODUCTS ?? "catalog-images").trim() || "catalog-images";
}

const MAX_BYTES = 5 * 1024 * 1024;
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type ImageFileOk = { ok: true; ext: string };
export type ImageFileErr = { ok: false; error: string };

export function validateImageFile(file: unknown): ImageFileOk | ImageFileErr {
  if (!(file instanceof File)) {
    return { ok: false, error: "Не найден файл." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `Файл больше ${MAX_BYTES / 1024 / 1024} МБ.` };
  }
  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    return { ok: false, error: "Допускаются только JPEG, PNG и WebP." };
  }
  return { ok: true, ext };
}

export function buildStorageObjectPath(productId: string, ext: string): string {
  return `${productId}/${randomUUID()}.${ext}`;
}

/** Достать ключ объекта после `/object/public/{bucket}/` для удаления из Storage. */
export function parseStoragePathFromPublicUrl(publicUrl: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const i = publicUrl.indexOf(marker);
  if (i === -1) return null;
  try {
    return decodeURIComponent(publicUrl.slice(i + marker.length));
  } catch {
    return null;
  }
}
