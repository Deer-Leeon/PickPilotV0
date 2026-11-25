import { useCallback, useSyncExternalStore } from "react";

/**
 * Tracks a CSS media query. Returns false on the server and until hydration,
 * so write layouts mobile-first and use this only to switch behaviour
 * (docked panel versus sheet), not to hide content.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Breakpoints, matching Tailwind's defaults. */
export const MEDIA = {
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  /** Narrower than lg: phones and small tablets, where side panels become sheets. */
  belowLg: "(max-width: 1023.98px)",
} as const;
