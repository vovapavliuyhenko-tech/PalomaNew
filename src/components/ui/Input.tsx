"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import { Caption } from "@/components/ui/typography";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, id, label, error, type = "text", ...props }, ref) => {
    const fieldId = id ?? props.name;
    return (
      <div className="flex w-full flex-col gap-2">
        {label && fieldId ? (
          <Caption as="label" htmlFor={fieldId} className="text-[var(--color-ink)]/70">
            {label}
          </Caption>
        ) : null}
        <input
          ref={ref}
          id={fieldId}
          type={type}
          className={cn(
            "min-h-[52px] w-full rounded-none border-0 border-b border-[var(--color-ink)] bg-transparent px-0 py-4 font-[family-name:var(--font-body),sans-serif] text-base text-[var(--color-ink)] outline-none transition-[border-width]",
            "placeholder:text-[var(--color-ink)]/50",
            "focus:border-b-2 focus:border-[var(--color-ink)]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-ink)]",
            "disabled:cursor-not-allowed disabled:opacity-45",
            error && "border-b-2 border-[var(--color-bordeaux)] focus:border-[var(--color-bordeaux)]",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-err` : undefined}
          {...props}
        />
        {error ? (
          <p
            id={fieldId ? `${fieldId}-err` : undefined}
            className="font-[family-name:var(--font-body),sans-serif] text-[13px] text-[var(--color-bordeaux)]"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
