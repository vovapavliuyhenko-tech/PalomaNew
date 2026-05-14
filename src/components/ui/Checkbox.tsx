"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import { Caption } from "@/components/ui/typography";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, id, label, ...props }, ref) => {
    const fieldId = id ?? props.name;
    return (
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 font-[family-name:var(--font-body),sans-serif] text-[15px] text-[var(--color-ink)]",
          "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-ink)]"
        )}
      >
        <input
          ref={ref}
          id={fieldId}
          type="checkbox"
          className={cn(
            "mt-0.5 size-4 shrink-0 cursor-pointer appearance-none rounded-none border border-[var(--color-ink)] bg-transparent",
            "checked:border-[var(--color-bordeaux)] checked:bg-[var(--color-bordeaux)]",
            "disabled:cursor-not-allowed disabled:opacity-45",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]",
            className
          )}
          {...props}
        />
        <Caption as="span" className="normal-case tracking-normal text-[15px] text-[var(--color-ink)]">
          {label}
        </Caption>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
