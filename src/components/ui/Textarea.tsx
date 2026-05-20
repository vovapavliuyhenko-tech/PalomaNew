"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import { Caption } from "@/components/ui/typography";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, id, label, error, ...props }, ref) => {
    const fieldId = id ?? props.name;
    return (
      <div className="flex w-full flex-col gap-2">
        {label && fieldId ? (
          <Caption as="label" htmlFor={fieldId} className="text-[var(--color-ink)]/70">
            {label}
          </Caption>
        ) : null}
        <textarea
          ref={ref}
          id={fieldId}
          className={cn(
            "min-h-[120px] w-full resize-y rounded-none border-0 border-b border-[var(--color-ink)] bg-transparent px-0 py-4 font-[family-name:var(--font-body),sans-serif] text-base text-[var(--color-ink)] outline-none",
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

Textarea.displayName = "Textarea";
