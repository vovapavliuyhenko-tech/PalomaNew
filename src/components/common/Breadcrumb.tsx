"use client";

import Link from "next/link";
import { Fragment } from "react";

export type BreadcrumbTrailItem = {
  label: string;
  href?: string;
};

/** Визуальные крошки (переиспользуем стиль страниц вне PageHero при необходимости). */
export function Breadcrumb({ items, className }: { items: BreadcrumbTrailItem[]; className?: string }) {
  return (
    <nav
      className={`text-xs text-[var(--text-secondary)] ${className ?? ""}`}
      aria-label="Хлебные крошки"
    >
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {items.map((it, i) => (
          <Fragment key={`${it.label}-${i}`}>
            {i > 0 && <span className="text-[var(--text-secondary)]/50">/</span>}
            <li style={{ fontFamily: "var(--font-accent)" }}>
              {it.href ? (
                <Link href={it.href} className="transition-colors hover:text-[var(--paloma-orange)]">
                  {it.label}
                </Link>
              ) : (
                <span className="text-[var(--text-primary)]">{it.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
