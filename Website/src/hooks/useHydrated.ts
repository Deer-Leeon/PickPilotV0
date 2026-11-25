import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False on the server and during the first client render, true afterwards.
 * Use it to hold back anything read from the browser (saved slip, screen
 * width) so the first client render matches the server HTML.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
