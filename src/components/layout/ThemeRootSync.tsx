"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/store/uiStore";
import { applyThemeToDocument } from "@/lib/themeSync";

/**
 * Applies persisted / live theme to <html> after Zustand rehydration.
 */
export default function ThemeRootSync() {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  return null;
}
