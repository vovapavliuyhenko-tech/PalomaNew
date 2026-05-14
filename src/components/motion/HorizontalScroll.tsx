import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type HorizontalScrollProps = {
  children?: ReactNode;
  className?: string;
};

/** Заглушка: наполнение на этапе 15 (GSAP pin + translate). */
export function HorizontalScroll({ children, className }: HorizontalScrollProps) {
  return (
    <div
      data-horizontal-scroll="stub"
      className={cn("w-full", className)}
    >
      {children}
    </div>
  );
}
