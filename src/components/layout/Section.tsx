import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

export type SectionProps = HTMLAttributes<HTMLElement> & {
  size?: "lg" | "md";
  tone?: "cream" | "ink" | "bordeaux" | "peach" | "milk";
  children: ReactNode;
};

const toneCls: Record<NonNullable<SectionProps["tone"]>, string> = {
  cream: "bg-[var(--color-bg-ivory)] text-[var(--color-text-graphite)]",
  milk: "bg-[var(--color-bg-milk)] text-[var(--color-text-graphite)]",
  ink: "bg-[var(--color-ink)] text-[var(--color-cream)]",
  bordeaux: "bg-[var(--color-bordeaux)] text-[var(--color-cream)]",
  peach:
    "bg-[color-mix(in_srgb,var(--color-peach)_22%,var(--color-bg-ivory))] text-[var(--color-text-graphite)]",
};

export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { size = "lg", tone = "cream", className, children, ...rest },
  ref
) {
  return (
    <section
      ref={ref}
      className={cn(
        toneCls[tone],
        "border-b border-[color-mix(in_srgb,var(--paloma-coal)_6%,transparent)] last:border-b-0",
        size === "lg" && "py-[var(--section-py-compact)] lg:py-[var(--section-py-desktop)]",
        size === "md" && "py-[clamp(3rem,7vw,5rem)] lg:py-[var(--section-py-compact)]",
        className
      )}
      {...rest}
    >
      {children}
    </section>
  );
});
Section.displayName = "Section";