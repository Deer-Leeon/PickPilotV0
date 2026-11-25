import type { ReactNode } from "react";

/**
 * The Broadcast concept screen has no app shell: the hero matchup fills the
 * screen, edge to edge, with no rail and no side panel.
 */
export default function BroadcastLayout({ children }: { children: ReactNode }) {
  return <div className="h-dvh overflow-hidden bg-charcoal">{children}</div>;
}
