import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type CardVariant = "default" | "muted" | "outline";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

const surface: Record<CardVariant, string> = {
  default: "bg-[var(--bg-card)] border border-[var(--border)]",
  muted: "bg-[var(--color-bg-secondary-token)] border border-[var(--color-border-token)]",
  outline: "bg-transparent border border-[var(--border)]",
};

/** Универсальная карточка дизайн-системы (секции, товары, формы). */
export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-[var(--radius-medium)] shadow-sm", surface[variant], className)}
      {...props}
    />
  );
}
