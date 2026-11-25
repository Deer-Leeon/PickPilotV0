"use client";

import { useEffect } from "react";
import { LOCATE_STAND_OUT } from "@/lib/flash";

/**
 * Runs when a stand-out is selected, so a page can reveal the spot it points
 * at before the frame is drawn. Call `event.preventDefault()` when that spot
 * is not on screen yet and this handler is about to show it.
 */
export function useLocateStandOut(onLocate: (targets: readonly string[], event: Event) => void) {
  useEffect(() => {
    const handler = (event: Event) => {
      const targets = (event as CustomEvent<readonly string[]>).detail;
      onLocate(targets, event);
    };
    window.addEventListener(LOCATE_STAND_OUT, handler);
    return () => window.removeEventListener(LOCATE_STAND_OUT, handler);
  }, [onLocate]);
}
