"use client";

import { Moon, Sun } from "lucide-react";
import { useUIStore } from "@/lib/store/uiStore";
import { analytics } from "@/lib/analytics";

type ThemeToggleProps = {
  className?: string;
  variant?: "headerLight" | "headerDark";
};

export default function ThemeToggle({
  className = "",
  variant = "headerDark",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useUIStore();
  const isDark = theme === "dark";

  const color =
    variant === "headerLight"
      ? "text-[var(--text-on-dark)] hover:bg-white/10"
      : "text-[var(--text-primary)] hover:bg-black/5";

  return (
    <button
      type="button"
      onClick={() => {
        analytics.toggleTheme(isDark ? "light" : "dark");
        toggleTheme();
      }}
      className={`p-2 rounded-full transition-colors ${color} ${className}`}
      aria-label={isDark ? "Светлая тема" : "Тёмная тема"}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
    >
      {isDark ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
    </button>
  );
}
