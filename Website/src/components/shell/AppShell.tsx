import { Suspense, type ReactNode } from "react";
import type { League, NavIndex } from "@/data/types";
import { BottomNav } from "./BottomNav";
import { NavRail } from "./NavRail";
import { SidePanel } from "./SidePanel";
import { TopBar } from "./TopBar";

interface AppShellProps {
  league: League;
  nav: NavIndex;
  /** What stands out on the current page, shown in the side panel. */
  standOuts: ReactNode;
  children: ReactNode;
}

/**
 * The frame around every page: top bar, navigation, the page itself and the
 * side panel (stand-outs, or the research slip while it is open). The frame
 * fills the screen and never scrolls; each page scrolls inside its own area,
 * so the navigation is always in reach.
 */
export function AppShell({ league, nav, standOuts, children }: AppShellProps) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-fg focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-canvas"
      >
        Skip to content
      </a>

      <TopBar league={league} nav={nav} />

      <div className="flex min-h-0 flex-1">
        <Suspense fallback={<div className="hidden w-16 shrink-0 border-r border-border bg-inset md:block" />}>
          <NavRail league={league.id} nav={nav} />
        </Suspense>
        <main id="main" className="relative flex min-w-0 flex-1 overflow-hidden">
          {children}
        </main>
        <SidePanel standOuts={standOuts} />
      </div>

      <Suspense fallback={<div className="h-14 shrink-0 border-t border-border bg-inset md:hidden" />}>
        <BottomNav league={league.id} nav={nav} />
      </Suspense>
    </div>
  );
}
