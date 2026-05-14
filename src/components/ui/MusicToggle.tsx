"use client";

import { Music, Music2 } from "lucide-react";
import { useUIStore } from "@/lib/store/uiStore";
import { analytics } from "@/lib/analytics";

type MusicToggleProps = {
  className?: string;
  variant?: "headerLight" | "headerDark";
};

export default function MusicToggle({
  className = "",
  variant = "headerDark",
}: MusicToggleProps) {
  const { isMusicPlaying, toggleMusic } = useUIStore();

  const color =
    variant === "headerLight"
      ? "text-[var(--text-on-dark)] hover:bg-white/10"
      : "text-[var(--text-primary)] hover:bg-black/5";

  return (
    <button
      type="button"
      onClick={() => {
        analytics.toggleMusic(isMusicPlaying ? "off" : "on");
        toggleMusic();
      }}
      className={`rounded-full p-2 transition-all duration-200 ${color} ${
        isMusicPlaying ? "ring-2 ring-[color-mix(in_srgb,var(--paloma-orange)_38%,transparent)] ring-offset-2 ring-offset-transparent" : ""
      } ${className}`}
      aria-label={isMusicPlaying ? "Выключить фоновую музыку" : "Включить фоновую музыку"}
      title={isMusicPlaying ? "Пауза" : "Музыка"}
    >
      {isMusicPlaying ? (
        <Music2 size={20} strokeWidth={1.5} />
      ) : (
        <Music size={20} strokeWidth={1.5} />
      )}
    </button>
  );
}
