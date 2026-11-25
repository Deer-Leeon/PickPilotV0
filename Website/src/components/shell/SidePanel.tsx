"use client";

import type { MouseEvent, ReactNode } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { SlipPanel, SlipSheet } from "@/features/slip/SlipPanel";
import { useSlip } from "@/features/slip/useSlip";
import { useLocateStandOut } from "@/hooks/useLocateStandOut";
import { MEDIA, useMediaQuery } from "@/hooks/useMediaQuery";
import { useSidePanelStore } from "./sidePanelStore";

const TITLE = "Stand Outs";

/** The card's heading. */
function StandOutsHeader() {
  return (
    <div className="shrink-0 px-5 pb-1 pt-4">
      <h2 className="text-base font-bold tracking-tight text-fg">{TITLE}</h2>
      <p className="text-xs text-fg-muted">Select one to see it on the page</p>
    </div>
  );
}

interface SidePanelProps {
  /** The current page's stand-outs, from the `@standouts` route that mirrors it. */
  standOuts: ReactNode;
}

/**
 * The one panel on the right of every page, the same width everywhere.
 *
 * On wide screens it is docked beside the page as a card of its own: rounded,
 * as far from the top bar as the page's first card and, from 2xl up, as far
 * from the edge of the screen as the page is from the rail. On a laptop that
 * outer margin is one card gap, so the page keeps its room. The card fills the
 * height between its top and bottom margins. What it holds stays at the top
 * and scrolls inside once that is more than the screen, leaving empty card
 * below a short list. It shows the page's stand-outs, and the research slip
 * takes its place while the slip is open.
 *
 * It is not one of the page's cards, so it does not share their shade: it has
 * the panel shade the sheets use, lit faintly from the top, and what it holds
 * sits on it as raised tiles. Colour is left to the content.
 *
 * On narrower screens nothing is docked: stand-outs and the slip each open as
 * a sheet, from their buttons in the top bar and the navigation.
 */
export function SidePanel({ standOuts }: SidePanelProps) {
  const { isOpen: slipOpen } = useSlip();
  const standOutsOpen = useSidePanelStore((state) => state.standOutsOpen);
  const setStandOutsOpen = useSidePanelStore((state) => state.setStandOutsOpen);
  const isWide = useMediaQuery(MEDIA.xl);
  const slipDocked = slipOpen && isWide;

  // On a phone the list covers the page, so it steps aside before the spot is lit.
  useLocateStandOut(() => {
    if (!isWide) setStandOutsOpen(false);
  });

  // A stand-out that links somewhere has done its job once it is followed.
  const closeOnLink = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("a")) setStandOutsOpen(false);
  };

  return (
    <>
      {/* Docked with CSS rather than the media-query hook, so the panel is already in the page the server sends. */}
      <aside
        aria-label={slipDocked ? "Research slip" : TITLE}
        className="relative z-20 my-5 mr-5 hidden min-h-0 w-80 shrink-0 flex-col overflow-hidden rounded-2xl bg-panel bg-linear-to-b from-white/[0.05] to-transparent to-[7rem] shadow-xl xl:flex 2xl:mr-10"
      >
        {slipDocked ? (
          <SlipPanel />
        ) : (
          <>
            <StandOutsHeader />
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{standOuts}</div>
          </>
        )}
      </aside>

      <Sheet open={standOutsOpen && !isWide} onOpenChange={setStandOutsOpen} title={TITLE} side="right">
        <div className="flex flex-1 flex-col" onClick={closeOnLink}>
          {standOuts}
        </div>
      </Sheet>

      <SlipSheet open={slipOpen && !isWide} />
    </>
  );
}
