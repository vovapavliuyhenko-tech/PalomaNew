import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/siteConfig";

type PalomaLogoProps = {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg" | "hero";
  showTagline?: boolean;
  className?: string;
};

const sizeTitle: Record<NonNullable<PalomaLogoProps["size"]>, string> = {
  sm: "text-[1.35rem] lg:text-[1.5rem]",
  md: "text-[1.65rem] lg:text-3xl",
  lg: "text-[clamp(1.75rem,4vw,2.75rem)]",
  hero: "text-[clamp(2.35rem,8vw,4.75rem)]",
};

const variantTitle: Record<NonNullable<PalomaLogoProps["variant"]>, string> = {
  light: "text-[var(--text-on-dark)]",
  dark: "text-[var(--text-primary)]",
};

const variantTag: Record<NonNullable<PalomaLogoProps["variant"]>, string> = {
  light: "text-white/70",
  dark: "text-[var(--text-secondary)]",
};

export default function PalomaLogo({
  variant = "dark",
  size = "md",
  showTagline = false,
  className,
}: PalomaLogoProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span
        className={cn(
          "not-italic font-normal tracking-[var(--ls-heading)] leading-[var(--lh-heading)]",
          sizeTitle[size],
          variantTitle[variant]
        )}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {siteConfig.name}
      </span>
      {showTagline && (
        <span
          className={cn(
            size === "hero"
              ? "text-[0.7rem] sm:text-xs uppercase tracking-[var(--ls-wider)] font-medium"
              : "text-[0.65rem] uppercase tracking-[var(--ls-wider)] font-medium",
            variantTag[variant]
          )}
          style={{ fontFamily: "var(--font-accent)" }}
        >
          {siteConfig.tagline}
        </span>
      )}
    </div>
  );
}
