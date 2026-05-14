import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: "default" | "wide";
  children: ReactNode;
};

export function Container({ size = "default", className, children, ...rest }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)]",
        size === "wide" && "max-w-[min(var(--container-wide,1600px),100%)]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
