import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "error";

/** Бейджи витрины по PRD (акцентные фоны без pill). */
export type CatalogBadgeKind = "bestseller" | "seasonal" | "online";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  /** Когда задано, в приоритете над `tone` — стили карточки товара. */
  catalogKind?: CatalogBadgeKind;
};

const toneCls: Record<BadgeTone, string> = {
  neutral:
    "border border-[var(--color-border-token-prd)] bg-[color-mix(in_srgb,var(--color-bg-milk)_85%,var(--color-bg-ivory))] text-[var(--color-text-graphite)]",
  accent:
    "border border-[color-mix(in_srgb,var(--color-accent-burgundy)_35%,transparent)] bg-[var(--color-accent-soft)] text-[var(--color-text-graphite)]",
  success:
    "border border-[var(--color-border-token-prd)] bg-[color-mix(in_srgb,var(--color-accent-floral)_55%,var(--color-bg-ivory))] text-[var(--color-text-graphite)]",
  warning:
    "border border-[color-mix(in_srgb,var(--color-orange)_38%,transparent)] bg-[color-mix(in_srgb,var(--color-orange)_12%,transparent)] text-[var(--color-text-graphite)]",
  error:
    "border border-[color-mix(in_srgb,var(--color-bordeaux)_42%,transparent)] bg-[color-mix(in_srgb,var(--color-bordeaux)_12%,transparent)] text-[var(--color-bordeaux)]",
};

const catalogCls: Record<CatalogBadgeKind, string> = {
  bestseller:
    "bg-[var(--color-accent-burgundy)] text-[var(--color-cream)] border-transparent",
  seasonal: "bg-[var(--color-orange)] text-[var(--color-cream)] border-transparent",
  online: "bg-[var(--color-text-graphite)] text-[var(--color-cream)] border-transparent",
};

export function Badge({ className, tone = "neutral", catalogKind, ...props }: BadgeProps) {
  const preset = catalogKind ? catalogCls[catalogKind] : toneCls[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em]",
        preset,
        className
      )}
      {...props}
    />
  );
}
