import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";

export type PageHeroCrumb = { name: string; href?: string };

export type PageHeroProps = {
  crumbs: PageHeroCrumb[];
  eyebrow?: string;
  title: string;
  lead?: string;
  /** Дополнительные inline-стили для h1 (например компактный PDP). */
  titleStyle?: CSSProperties;
  /** Узкая колонка текста внутри стандартного `.container` (например max-w-4xl). */
  maxWidthClass?: string;
  /** Подзаголовок и блок под ним по центру (как на странице подписки). Крошки остаются слева в колонке. */
  align?: "left" | "center";
  children?: ReactNode;
};

export default function PageHero({
  crumbs,
  eyebrow,
  title,
  lead,
  titleStyle,
  maxWidthClass,
  align = "left",
  children,
}: PageHeroProps) {
  const ruleAlign = align === "center" ? "mx-auto" : "";
  const innerWidth = maxWidthClass ? `${maxWidthClass} mx-auto w-full` : "w-full";

  return (
    <header className="border-b border-[var(--color-line)] bg-[var(--bg-primary)] pt-[clamp(2rem,5vw,3rem)] pb-[clamp(2.25rem,5vw,3.5rem)] md:pb-[clamp(2.75rem,6vw,4rem)]">
      <div className="container mx-auto">
        <div className={innerWidth}>
        <nav
          className="mb-6 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-[var(--text-secondary)]"
          aria-label="Хлебные крошки"
        >
          {crumbs.map((c, i) => (
            <Fragment key={`${c.name}-${i}`}>
              {i > 0 && (
                <span className="text-[var(--text-secondary)]/50" aria-hidden>
                  /
                </span>
              )}
              {c.href ? (
                <Link
                  href={c.href}
                  className="transition-colors hover:text-[var(--paloma-orange)]"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  {c.name}
                </Link>
              ) : (
                <span className="text-[var(--text-primary)]" style={{ fontFamily: "var(--font-accent)" }}>
                  {c.name}
                </span>
              )}
            </Fragment>
          ))}
        </nav>

        <div className={align === "center" ? "text-center" : undefined}>
          {eyebrow ? (
            <>
              <p className="font-accent mb-3 text-xs font-medium uppercase italic tracking-[0.22em] text-[var(--color-cherry)]">
                {eyebrow}
              </p>
              <div
                className={`mb-6 h-px w-12 bg-[color-mix(in_srgb,var(--paloma-orange)_38%,transparent)] ${ruleAlign}`}
                aria-hidden
              />
            </>
          ) : null}

          <h1
            className="text-balance text-[var(--text-primary)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              fontWeight: 400,
              ...titleStyle,
            }}
          >
            {title}
          </h1>

          {lead ? (
            <p
              className={`font-accent mt-6 text-balance text-base leading-relaxed text-[var(--text-secondary)] md:text-lg ${
                align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"
              }`}
            >
              {lead}
            </p>
          ) : null}

          {children ? <div className={lead || eyebrow ? "mt-6" : "mt-6"}>{children}</div> : null}
        </div>
        </div>
      </div>
    </header>
  );
}
