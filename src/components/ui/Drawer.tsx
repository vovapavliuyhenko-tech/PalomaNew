"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type DrawerPlacement = "right" | "left";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  placement?: DrawerPlacement;
  title?: string;
  children?: ReactNode;
  className?: string;
};

export function Drawer({
  open,
  onClose,
  placement = "right",
  title,
  children,
  className,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-overlay)] lg:z-[calc(var(--z-overlay)+90)]">
      <button type="button" aria-label="Закрыть" className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute top-0 flex h-full w-full max-w-md flex-col border-[var(--border)] bg-[var(--bg-card)] shadow-2xl",
          placement === "right" ? "right-0 border-l" : "left-0 border-r",
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          {title ? (
            <h2 className="text-lg text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            закрыть
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
