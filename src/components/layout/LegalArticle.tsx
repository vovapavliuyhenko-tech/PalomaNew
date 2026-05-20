import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function LegalArticle({
  meta,
  children,
  maxWidthClass = "max-w-4xl",
}: {
  meta?: ReactNode;
  children: ReactNode;
  maxWidthClass?: string;
}) {
  return (
    <article
      className={cn(
        "legal-doc container mx-auto py-[var(--space-xl)] md:py-[var(--space-xxl)]",
        maxWidthClass
      )}
    >
      {meta != null ? <div className="legal-doc__meta">{meta}</div> : null}
      {children}
    </article>
  );
}

export default LegalArticle;
