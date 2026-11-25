"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { useSlipStore, type SlipLeg } from "./slipStore";

const NO_LEGS: SlipLeg[] = [];

/**
 * The slip as components should read it. Until the page has hydrated it
 * reports an empty, closed slip, which is what the server rendered.
 */
export function useSlip() {
  const hydrated = useHydrated();
  const legs = useSlipStore((state) => state.legs);
  const isOpen = useSlipStore((state) => state.isOpen);
  const toggle = useSlipStore((state) => state.toggle);
  const remove = useSlipStore((state) => state.remove);
  const clear = useSlipStore((state) => state.clear);
  const setOpen = useSlipStore((state) => state.setOpen);

  return {
    hydrated,
    legs: hydrated ? legs : NO_LEGS,
    isOpen: hydrated && isOpen,
    toggle,
    remove,
    clear,
    setOpen,
  };
}

/** Whether one leg is on the slip. Re-renders only when that answer changes. */
export function useIsInSlip(legId: string): boolean {
  const hydrated = useHydrated();
  const inSlip = useSlipStore((state) => state.legs.some((leg) => leg.id === legId));
  return hydrated && inSlip;
}
