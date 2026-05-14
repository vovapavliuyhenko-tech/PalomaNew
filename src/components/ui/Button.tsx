"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Caption } from "@/components/ui/typography";

export type ButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-ink)] text-[var(--color-cream)] border border-[var(--color-ink)] hover:opacity-[0.92]",
  secondary:
    "border border-[color-mix(in_srgb,var(--color-ink)_28%,transparent)] bg-transparent text-[var(--color-ink)] hover:bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)]",
  accent:
    "border border-[var(--color-bordeaux)] bg-[var(--color-bordeaux)] text-[var(--color-cream)] hover:opacity-[0.93]",
  ghost:
    "border border-[color-mix(in_srgb,var(--color-ink)_14%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-ivory)_40%,transparent)] text-[var(--color-ink)] hover:bg-[color-mix(in_srgb,var(--color-ink)_8%,transparent)]",
  link:
    "border-0 bg-transparent px-0 py-0 text-[var(--color-ink)] underline-offset-[6px] hover:underline min-h-0",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4",
  md: "min-h-12 px-6",
  lg: "min-h-14 px-8",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      type = "button",
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-opacity duration-200",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]",
          "disabled:pointer-events-none disabled:opacity-40",
          variant !== "link" && "rounded-[var(--radius-button)]",
          variantClass[variant],
          variant === "link" ? "text-[11px] font-medium tracking-[0.08em]" : sizeClass[size],
          className
        )}
        {...props}
      >
        {loading ? <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden /> : null}
        <Caption
          as="span"
          className={cn(
            "font-medium tracking-[0.1em]",
            variant === "link" ? "text-[11px] normal-case tracking-[0.08em]" : "text-[11px]"
          )}
        >
          {children}
        </Caption>
      </button>
    );
  }
);

Button.displayName = "Button";
