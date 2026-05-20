"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Обязателен для доступности, если внутри нет текста. */
  "aria-label": string;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex size-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-sm border border-transparent text-[var(--color-ink)] transition-opacity",
        "hover:opacity-75",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]",
        "disabled:pointer-events-none disabled:opacity-35",
        className
      )}
      {...props}
    />
  )
);

IconButton.displayName = "IconButton";
