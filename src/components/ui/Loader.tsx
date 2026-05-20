import { cn } from "@/lib/utils";

export type LoaderProps = {
  className?: string;
  /** Размер в пикселях */
  size?: number;
  label?: string;
};

/** Простая индикация загрузки (SSR-safe). */
export function Loader({ className, size = 28, label = "Загрузка" }: LoaderProps) {
  return (
    <div role="status" aria-live="polite" aria-busy className={cn("inline-flex flex-col items-center gap-3", className)}>
      <div
        className="rounded-full border-2 border-[var(--border)] border-t-[var(--color-cherry)] motion-safe:animate-spin"
        style={{ width: size, height: size }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn("motion-safe:animate-pulse rounded-[var(--radius-small)] bg-[var(--border)]", className)}
      aria-hidden
    />
  );
}
