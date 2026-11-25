"use client";

import { create } from "zustand";

interface SidePanelState {
  /** Whether the Stand Outs sheet is open. Only used below the width where the panel docks. */
  standOutsOpen: boolean;
  setStandOutsOpen: (open: boolean) => void;
}

/** Not saved: the sheet starts closed on every visit, which is also what the server renders. */
export const useSidePanelStore = create<SidePanelState>()((set) => ({
  standOutsOpen: false,
  setStandOutsOpen: (standOutsOpen) => set({ standOutsOpen }),
}));
