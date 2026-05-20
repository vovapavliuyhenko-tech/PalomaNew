"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "paloma-modal-title" : undefined}
        aria-describedby={description ? "paloma-modal-desc" : undefined}
        className={cn(
          "relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-2xl",
          className
        )}
      >
        {title && (
          <h2 id="paloma-modal-title" className="mb-3 text-xl text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h2>
        )}
        {description && (
          <p id="paloma-modal-desc" className="mb-6 text-sm text-[var(--text-secondary)]">
            {description}
          </p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          закрыть
        </button>
        {children}
      </div>
    </div>
  );
}
