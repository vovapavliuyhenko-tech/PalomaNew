/** Sync Paloma theme to the document root (light = no attribute). */
export type PalomaTheme = "light" | "dark";

export function applyThemeToDocument(theme: PalomaTheme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }
}
