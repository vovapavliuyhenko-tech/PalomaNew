import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/utils";

type HeadingProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

const displaySerif =
  "font-[family-name:var(--font-display),var(--font-serif),serif] font-normal";

export function H1<T extends ElementType = "h1">({ as, className, children, ...rest }: HeadingProps<T>) {
  const Comp = (as ?? "h1") as ElementType;
  return (
    <Comp
      className={cn(
        displaySerif,
        "text-[clamp(48px,6vw,96px)] leading-[0.96] tracking-[-0.025em]",
        className
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function H2<T extends ElementType = "h2">({ as, className, children, ...rest }: HeadingProps<T>) {
  const Comp = (as ?? "h2") as ElementType;
  return (
    <Comp
      className={cn(
        displaySerif,
        "text-[clamp(36px,4vw,64px)] leading-[1.02] tracking-[-0.02em]",
        className
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function H3<T extends ElementType = "h3">({ as, className, children, ...rest }: HeadingProps<T>) {
  const Comp = (as ?? "h3") as ElementType;
  return (
    <Comp
      className={cn(
        displaySerif,
        "text-[clamp(24px,2.4vw,36px)] leading-[1.12] tracking-[-0.018em]",
        className
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}

const bodyFont = "font-[family-name:var(--font-body),var(--font-sans),sans-serif]";

export function Body<T extends ElementType = "p">({ as, className, children, ...rest }: HeadingProps<T>) {
  const Comp = (as ?? "p") as ElementType;
  return (
    <Comp
      className={cn(
        bodyFont,
        "max-w-[65ch] text-[clamp(16px,1.05vw,18px)] leading-[1.62]",
        className
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function Caption<T extends ElementType = "span">({
  as,
  className,
  children,
  ...rest
}: HeadingProps<T>) {
  const Comp = (as ?? "span") as ElementType;
  return (
    <Comp
      className={cn(
        bodyFont,
        "text-[13px] uppercase leading-[1.2] tracking-[0.08em]",
        className
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}
