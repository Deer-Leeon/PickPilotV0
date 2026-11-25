import type { ReactNode } from "react";

/**
 * The league's root layout: a passthrough so a route group can opt out of the
 * app shell. The shell lives in `(app)/layout.tsx`; `(broadcast)` replaces it.
 */
export default function LeagueRootLayout({ children }: { children: ReactNode }) {
  return children;
}
