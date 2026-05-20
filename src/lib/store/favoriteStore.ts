"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoriteStore {
  /** Ключ: `slug` или составной `id:size` для согласования с корзиной */
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((state) =>
          state.ids.includes(id)
            ? { ids: state.ids.filter((x) => x !== id) }
            : { ids: [...state.ids, id] }
        ),
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    { name: "paloma-favorites", partialize: (s) => ({ ids: s.ids }) }
  )
);
