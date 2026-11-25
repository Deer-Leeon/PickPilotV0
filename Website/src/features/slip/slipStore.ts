"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BookId } from "@/data/types";

/**
 * One line of research the user saved: a player prop or a game line.
 * The slip is a research list. It does not place bets.
 */
export interface SlipLeg {
  /**
   * Stable identity, so the same pick added from two screens is one leg:
   * "prop:jayson-tatum:PTS:over:28.5" or "nyk-bos:spread:away".
   */
  id: string;
  title: string;
  subtitle: string;
  price: number;
  book: BookId | null;
  /** Hits and sample behind the pick, when the screen that added it knew them. */
  hits: number | null;
  sample: number | null;
  /** Where the leg links back to. */
  href: string;
}

interface SlipState {
  legs: SlipLeg[];
  isOpen: boolean;
  /** Adds the leg, or removes it if it is already on the slip. */
  toggle: (leg: SlipLeg) => void;
  remove: (id: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

/**
 * The research slip. Legs are saved in the browser so they survive a reload.
 * When accounts exist this moves to the slip and slip_leg tables
 * (docs/DATABASE.md) and the store becomes a cache of that.
 *
 * The saved legs load before React hydrates, so components must not render
 * them on the first pass: read them through useSlip() below.
 */
export const useSlipStore = create<SlipState>()(
  persist(
    (set) => ({
      legs: [],
      isOpen: false,
      toggle: (leg) =>
        set((state) => ({
          legs: state.legs.some((item) => item.id === leg.id)
            ? state.legs.filter((item) => item.id !== leg.id)
            : [...state.legs, leg],
        })),
      remove: (id) => set((state) => ({ legs: state.legs.filter((item) => item.id !== id) })),
      clear: () => set({ legs: [] }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: "pickpilot.slip",
      version: 1,
      partialize: (state) => ({ legs: state.legs }),
    },
  ),
);
