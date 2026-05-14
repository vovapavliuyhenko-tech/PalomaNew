"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const sizes = ["S", "M", "L", "XL", "XXL"];

function FiltersContent({
  onClose,
  categoryOptions,
  showSizeFilter,
}: {
  onClose?: () => void;
  categoryOptions: Array<{ value: string; label: string }>;
  showSizeFilter: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const pathSegment =
    pathname.startsWith("/catalog/") && pathname !== "/catalog"
      ? pathname.slice("/catalog/".length).split("/")[0] || ""
      : "";
  const currentCategory = pathSegment || searchParams.get("category") || "";

  const pushWithCategory = useCallback(
    (categoryValue: string) => {
      const qs = new URLSearchParams(searchParams.toString());
      qs.delete("category");
      const tail = qs.toString();
      const base = categoryValue ? `/catalog/${categoryValue}` : "/catalog";
      router.push(tail ? `${base}?${tail}` : base, { scroll: false });
    },
    [router, searchParams],
  );

  const updateParams = useCallback(
    (key: string, value: string | string[]) => {
      if (key === "category") {
        pushWithCategory(Array.isArray(value) ? value[0] ?? "" : value);
        return;
      }
      const params = new URLSearchParams(searchParams.toString());
      if (Array.isArray(value)) {
        params.delete(key);
        value.forEach((v) => params.append(key, v));
      } else if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      const pathSeg =
        pathname.startsWith("/catalog/") && pathname !== "/catalog"
          ? pathname.slice("/catalog/".length).split("/")[0] || ""
          : "";
      const base = pathSeg ? `/catalog/${pathSeg}` : "/catalog";
      const qs = params.toString();
      router.push(qs ? `${base}?${qs}` : base, { scroll: false });
    },
    [router, searchParams, pushWithCategory],
  );

  const qFromUrl = searchParams.get("q") || "";
  const currentSizes = searchParams.getAll("size");
  const currentMin = Number(searchParams.get("min") || 0);
  const currentMax = Number(searchParams.get("max") || 30000);

  const [qDraft, setQDraft] = useState(qFromUrl);

  useEffect(() => {
    setQDraft(qFromUrl);
  }, [qFromUrl]);

  const [priceRange, setPriceRange] = useState<[number, number]>([currentMin, currentMax]);

  const toggleSize = (size: string) => {
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter((s) => s !== size)
      : [...currentSizes, size];
    updateParams("size", newSizes);
  };

  const handleReset = () => {
    router.push("/catalog", { scroll: false });
    setPriceRange([0, 30000]);
  };

  const activeCount = [
    currentCategory ? 1 : 0,
    qFromUrl.trim() ? 1 : 0,
    showSizeFilter ? currentSizes.length : 0,
    currentMin > 0 || currentMax < 30000 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium uppercase tracking-[var(--ls-widest)] text-[var(--text-primary)]">
          Фильтры{" "}
          {activeCount > 0 && (
            <span className="text-[var(--color-cherry)]">({activeCount})</span>
          )}
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-[var(--color-cherry)] transition-colors hover:text-[var(--paloma-burgundy)] hover:underline"
        >
          Сбросить фильтры
        </button>
      )}

      <div>
        <p className="text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)] mb-3">
          Поиск
        </p>
        <div className="flex gap-2">
          <input
            type="search"
            value={qDraft}
            onChange={(e) => setQDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                updateParams("q", qDraft.trim());
              }
            }}
            placeholder="Название, состав…"
            className="flex-1 min-w-0 rounded-[var(--radius-small)] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:ring-1 focus:ring-[var(--color-cherry)]/40"
            aria-label="Поиск по каталогу"
          />
          <button
            type="button"
            onClick={() => updateParams("q", qDraft.trim())}
            className="flex-shrink-0 rounded-[var(--radius-small)] border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-primary)] hover:border-[var(--color-cherry)] transition-colors"
          >
            Найти
          </button>
        </div>
      </div>

      {showSizeFilter ? (
        <div>
          <p className="text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)] mb-3">
            Размер
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                type="button"
                key={size}
                onClick={() => toggleSize(size)}
                className={`w-10 h-10 text-sm rounded-[var(--radius-small)] border transition-all ${
                  currentSizes.includes(size)
                    ? "border-[var(--color-cherry)] bg-[var(--color-cherry)] text-[var(--text-on-dark)]"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--color-cherry)]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <p className="text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)] mb-3">
          Цена: {priceRange[0].toLocaleString("ru")} — {priceRange[1].toLocaleString("ru")} ₽
        </p>
        <input
          type="range"
          min={0}
          max={30000}
          step={500}
          value={priceRange[1]}
          onChange={(e) => {
            const max = Number(e.target.value);
            setPriceRange([priceRange[0], max]);
            updateParams("max", String(max));
          }}
          className="w-full accent-[var(--color-cherry)]"
        />
      </div>
    </div>
  );
}

export default function ProductFilters({
  categoryOptions,
  showSizeFilter,
}: {
  categoryOptions: Array<{ value: string; label: string }>;
  showSizeFilter: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pathSeg =
    pathname.startsWith("/catalog/") && pathname !== "/catalog"
      ? pathname.slice("/catalog/".length).split("/")[0] || ""
      : "";
  const activeCount = [
    (pathSeg || searchParams.get("category")) ? 1 : 0,
    searchParams.get("q")?.trim() ? 1 : 0,
    showSizeFilter ? searchParams.getAll("size").length : 0,
    Number(searchParams.get("max") || 30000) < 30000 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <>
      <aside className="sticky top-24 hidden w-[13rem] flex-shrink-0 self-start lg:block">
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-primary)] p-4 shadow-[var(--shadow-soft)]">
          <FiltersContent categoryOptions={categoryOptions} showSizeFilter={showSizeFilter} />
        </div>
      </aside>

      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 text-sm border border-[var(--border)] px-4 py-2.5 rounded-[var(--radius-small)] hover:border-[var(--color-cherry)] transition-colors text-[var(--text-primary)]"
        >
          <SlidersHorizontal size={16} />
          Фильтры{" "}
          {activeCount > 0 && (
            <span className="w-5 h-5 bg-[var(--color-cherry)] text-[var(--text-on-dark)] text-xs rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-[var(--radius-lg)] border-t border-[var(--border)] bg-[var(--bg-primary)] px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] shadow-[var(--shadow-card)] lg:hidden"
            >
              <FiltersContent
                onClose={() => setMobileOpen(false)}
                categoryOptions={categoryOptions}
                showSizeFilter={showSizeFilter}
              />
              <div className="mt-6 pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-full btn-primary justify-center"
                >
                  Применить
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
