"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useActionState, useEffect, useMemo } from "react";

import { deleteProductImage, updateProductImageRow, uploadProductImage } from "./imageActions";

const inputCls =
  "min-h-[36px] w-full rounded-md border border-[var(--color-border-token)] bg-white px-2 py-1.5 text-sm text-[var(--color-text-token)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]";

export type ProductImageCard = {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
};

export default function ProductImagesSection({
  productId,
  slug,
  images,
}: {
  productId: string;
  slug: string;
  images: ProductImageCard[];
}) {
  const router = useRouter();
  const sorted = useMemo(
    () => [...images].sort((a, b) => a.display_order - b.display_order || a.id.localeCompare(b.id)),
    [images],
  );

  const [uploadState, uploadAction, uploadPending] = useActionState(uploadProductImage, null);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteProductImage, null);
  const [metaState, metaAction, metaPending] = useActionState(updateProductImageRow, null);

  useEffect(() => {
    const stamp = Math.max(uploadState?.at ?? 0, deleteState?.at ?? 0, metaState?.at ?? 0);
    if (stamp > 0) router.refresh();
  }, [uploadState?.at, deleteState?.at, metaState?.at, router]);

  return (
    <div className="max-w-3xl space-y-6 rounded-lg border border-[var(--color-border-token)] bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-base font-semibold tracking-tight">Фото товара</h2>
        <p className="mt-1 text-xs text-[var(--color-text-secondary-token)]">
          JPEG / PNG / WebP, до 5 МБ. Файлы в Supabase Storage (bucket из SUPABASE_STORAGE_BUCKET_PRODUCTS, по умолчанию catalog-images).
        </p>
      </div>

      <form action={uploadAction} encType="multipart/form-data" className="flex flex-wrap items-end gap-3 border-b border-[var(--color-border-token)] pb-6">
        <input type="hidden" name="product_id" value={productId} />
        <input type="hidden" name="slug" value={slug} />
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
            Новый файл
          </label>
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="block w-full text-xs file:mr-3 file:rounded-md file:border file:border-[var(--color-border-token)] file:bg-[var(--color-bg-secondary-token)] file:px-3 file:py-1.5 file:text-xs"
          />
        </div>
        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
            Alt (опционально)
          </label>
          <input name="alt_text" className={inputCls} placeholder="Кратко для доступности" />
        </div>
        <button
          type="submit"
          disabled={uploadPending}
          className="rounded-md bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {uploadPending ? "Загрузка…" : "Загрузить"}
        </button>
      </form>
      {uploadState?.error ? <p className="text-xs text-red-600">{uploadState.error}</p> : null}

      {sorted.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary-token)]">Пока нет фото — загрузите первое.</p>
      ) : (
        <ul className="space-y-5">
          {sorted.map((img) => (
            <li key={img.id} className="rounded-md border border-[var(--color-border-token)] p-4">
              <div className="flex flex-wrap gap-4">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-md border border-black/10 bg-[var(--color-bg-secondary-token)]">
                  <Image
                    src={img.image_url}
                    alt={img.alt_text ?? slug}
                    width={112}
                    height={112}
                    className="object-cover"
                  />
                </div>
                <div className="min-w-[220px] flex-1 space-y-3">
                  <form action={metaAction} className="grid gap-3 sm:grid-cols-[1fr_80px_auto]">
                    <input type="hidden" name="image_id" value={img.id} />
                    <input type="hidden" name="product_id" value={productId} />
                    <input type="hidden" name="slug" value={slug} />
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
                        Подпись (alt)
                      </label>
                      <input name="alt_text" className={inputCls} defaultValue={img.alt_text ?? ""} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--color-text-secondary-token)]">
                        №
                      </label>
                      <input
                        name="display_order"
                        type="number"
                        className={inputCls}
                        defaultValue={img.display_order}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={metaPending}
                        className="w-full whitespace-nowrap rounded-md border border-[var(--color-border-token)] px-3 py-2 text-xs hover:bg-black/5 disabled:opacity-50"
                      >
                        {metaPending ? "…" : "Сохранить"}
                      </button>
                    </div>
                  </form>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="break-all font-mono text-[10px] text-[var(--color-text-secondary-token)]">
                      {img.image_url}
                    </p>
                    <form action={deleteAction}>
                      <input type="hidden" name="image_id" value={img.id} />
                      <input type="hidden" name="product_id" value={productId} />
                      <input type="hidden" name="slug" value={slug} />
                      <button
                        type="submit"
                        disabled={deletePending}
                        className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-800 hover:bg-red-100 disabled:opacity-50"
                      >
                        Удалить
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {deleteState?.error ? <p className="text-xs text-red-600">{deleteState.error}</p> : null}
      {metaState?.error ? <p className="text-xs text-red-600">{metaState.error}</p> : null}
    </div>
  );
}
