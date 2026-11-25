"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentState {
  /** The game the user last opened, so the "Matchup" nav item returns to it. */
  lastGameId: string | null;
  setLastGameId: (gameId: string) => void;
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      lastGameId: null,
      setLastGameId: (lastGameId) => set({ lastGameId }),
    }),
    { name: "pickpilot.recent", version: 1 },
  ),
);
