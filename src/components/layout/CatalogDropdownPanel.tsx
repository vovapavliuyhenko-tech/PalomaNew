"use client";

import Link from "next/link";
import { CATALOG_DROPDOWN_COLUMN_A, CATALOG_DROPDOWN_COLUMN_B } from "@/lib/catalogDropdownLinks";

type Props = {
  onLinkClick?: () => void;
};

export function CatalogDropdownPanel({ onLinkClick }: Props) {
  const Col = ({
    links,
  }: {
    links: readonly { readonly label: string; readonly href: string }[];
  }) => (
    <ul className="flex flex-col gap-[var(--space-md)]">
      {links.map((l) => (
        <li key={`${l.href}-${l.label}`}>
          <Link
            href={l.href}
            onClick={onLinkClick}
            className="font-accent text-sm text-[var(--text-primary)] transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-cherry)]"
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="mx-auto grid max-w-[min(720px,calc(100vw-48px))] grid-cols-2 gap-x-[var(--space-lg)] px-[var(--space-md)] py-[var(--space-lg)]">
      <Col links={CATALOG_DROPDOWN_COLUMN_A} />
      <Col links={CATALOG_DROPDOWN_COLUMN_B} />
    </div>
  );
}
