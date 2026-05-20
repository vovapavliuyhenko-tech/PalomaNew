"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PalomaTheme } from "@/lib/themeSync";

interface UIStore {
  isMobileMenuOpen: boolean;
  isMusicPlaying: boolean;
  theme: PalomaTheme;
  cookieConsent: "accepted" | "rejected" | null;
  preloaderDone: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMusic: () => void;
  setTheme: (theme: PalomaTheme) => void;
  toggleTheme: () => void;
  setCookieConsent: (choice: "accepted" | "rejected") => void;
  setPreloaderDone: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isMobileMenuOpen: false,
      isMusicPlaying: false,
      theme: "light",
      cookieConsent: null,
      preloaderDone: false,

      toggleMobileMenu: () =>
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

      closeMobileMenu: () => set({ isMobileMenuOpen: false }),

      toggleMusic: () =>
        set((state) => ({ isMusicPlaying: !state.isMusicPlaying })),

      setTheme: (theme) => set({ theme }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark",
        })),

      setCookieConsent: (choice) => set({ cookieConsent: choice }),

      setPreloaderDone: () => set({ preloaderDone: true }),
    }),
    {
      name: "paloma-ui",
      partialize: (state) => ({
        cookieConsent: state.cookieConsent,
        isMusicPlaying: state.isMusicPlaying,
        theme: state.theme,
      }),
    }
  )
);
