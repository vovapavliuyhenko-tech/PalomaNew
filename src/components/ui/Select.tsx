"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Caption } from "@/components/ui/typography";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, id, label, error, children, ...props }, ref) => {
    const fieldId = id ?? props.name;
    return (
      <div className="flex w-full flex-col gap-2">
        {label && fieldId ? (
          <Caption as="label" htmlFor={fieldId} className="text-[var(--color-ink)]/70">
            {label}
          </Caption>
        ) : null}
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            className={cn(
              "min-h-[52px] w-full cursor-pointer appearance-none rounded-none border-0 border-b border-[var(--color-ink)] bg-transparent py-4 pl-0 pr-10 font-[family-name:var(--font-body),sans-serif] text-base text-[var(--color-ink)] outline-none",
              "focus:border-b-2 focus:border-[var(--color-ink)]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-ink)]",
              "disabled:cursor-not-allowed disabled:opacity-45",
              error && "border-b-2 border-[var(--color-bordeaux)] focus:border-[var(--color-bordeaux)]",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-err` : undefined}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-0 top-1/2 size-5 -translate-y-1/2 text-[var(--color-ink)]"
            aria-hidden
          />
        </div>
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

Select.displayName = "Select";
