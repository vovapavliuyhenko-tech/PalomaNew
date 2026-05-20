"use client";

import { useRef, useState } from "react";
import { ChevronDown, Phone } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import { TrackOutboundAnchor } from "@/components/analytics/TrackOutboundAnchor";
import { analytics } from "@/lib/analytics";

type ContactMenuProps = {
  variant: "light" | "dark";
};

export function ContactMenu({ variant }: ContactMenuProps) {
  const [open, setOpen] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const text = variant === "light" ? "text-[var(--text-on-dark)]" : "text-[var(--text-primary)]";
  const hoverBg = variant === "light" ? "hover:bg-white/10" : "hover:bg-black/5";

  const clearLeave = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  const scheduleClose = () => {
    clearLeave();
    leaveTimer.current = setTimeout(() => setOpen(false), 140);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        clearLeave();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={`flex items-center gap-1 px-3 py-2 text-sm font-light tracking-[var(--ls-wide)] transition-colors hover:text-[var(--color-cherry)] ${text} ${hoverBg} rounded-md`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Связаться
        <ChevronDown size={12} className="mt-0.5 opacity-70" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 min-w-[220px] bg-[var(--bg-card)] rounded-[var(--radius-small)] shadow-xl border border-[var(--border)] py-2 z-[70]">
          <a
            href={`tel:${siteConfig.phoneTel}`}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            onClick={() => analytics.clickPhone("header_contact_menu")}
          >
            <Phone size={16} className="text-[var(--color-cherry)]" />
            Позвонить
          </a>
          <TrackOutboundAnchor
            href={siteConfig.whatsapp}
            kind="whatsapp"
            source="header_contact_menu"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
          >
            WhatsApp
          </TrackOutboundAnchor>
          <TrackOutboundAnchor
            href={siteConfig.telegram}
            kind="telegram"
            source="header_contact_menu"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
          >
            Telegram
          </TrackOutboundAnchor>
        </div>
      )}
    </div>
  );
}
