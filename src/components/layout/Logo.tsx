import Link from "next/link";

import { cn } from "@/lib/utils";

export type LogoProps = {
  size: "sm" | "md" | "lg";
  /** `cream` — для тёмного фона (hero, футер, мобильное меню). */
  tone?: "ink" | "cream";
  className?: string;
  /** Если false — без ссылки (прелоадер). */
  asLink?: boolean;
  href?: string;
};

const titleCls: Record<LogoProps["size"], string> = {
  sm: "text-[1.2rem] leading-[0.92] tracking-[-0.03em] md:text-[1.35rem]",
  md: "text-[clamp(1.35rem,2.2vw,2rem)] leading-[0.92] tracking-[-0.035em]",
  lg: "text-[clamp(2.25rem,7vw,4.25rem)] leading-[0.9] tracking-[-0.04em]",
};

const tagRowCls: Record<LogoProps["size"], string> = {
  sm: "mt-0.5 gap-x-3 text-[8px] md:text-[9px]",
  md: "mt-1 gap-x-4 text-[9px] md:text-[10px]",
  lg: "mt-3 gap-x-5 sm:mt-4 sm:gap-x-8 text-[10px] sm:text-xs",
};

export function Logo({
  size,
  tone = "ink",
  className,
  asLink = true,
  href = "/",
}: LogoProps) {
  const ink = tone === "cream" ? "text-[var(--color-cream)]" : "text-[var(--color-ink)]";
  const tagMuted =
    tone === "cream" ? "text-[var(--color-cream)]/75" : "text-[var(--color-ink)]/60";

  const inner = (
    <div className={cn("flex flex-col items-start", className)}>
      <span
        className={cn(
          "font-[family-name:var(--font-display),var(--font-serif),serif] font-normal",
          titleCls[size],
          ink
        )}
      >
        PALOMA
      </span>
      <span
        className={cn(
          "flex flex-row font-[family-name:var(--font-body),sans-serif] font-medium uppercase tracking-[0.08em]",
          tagRowCls[size],
          tagMuted
        )}
      >
        <span>flowers</span>
        <span>coffee</span>
        <span>you</span>
      </span>
    </div>
  );

  if (asLink) {
    return (
      <Link
        href={href}
        className="min-w-0 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-ink)]"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
