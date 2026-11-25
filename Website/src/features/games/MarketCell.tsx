"use client";

import type { SlipLeg } from "@/features/slip/slipStore";
import { useSlipStore } from "@/features/slip/slipStore";
import { useIsInSlip } from "@/features/slip/useSlip";
import { cn } from "@/lib/cn";
import { formatOdds } from "@/lib/research/odds";

interface MarketCellProps {
  /** Main figure: "+4.5", "+164", "O 224.5". */
  primary: string;
  /** Second line: the price, or "ML" for moneylines. */
  secondary: string;
  /** Marks the best available line with an emerald dot. */
  isBest: boolean;
  leg: SlipLeg;
}

/** One odds cell on a game card. Pressing it adds the pick to the research slip. */
export function MarketCell({ primary, secondary, isBest, leg }: MarketCellProps) {
  const inSlip = useIsInSlip(leg.id);
  const toggle = useSlipStore((state) => state.toggle);

  return (
    <button
      type="button"
      aria-pressed={inSlip}
      aria-label={`${leg.title} at ${formatOdds(leg.price)}${isBest ? ", best line" : ""}. ${inSlip ? "Remove from" : "Add to"} slip`}
      onClick={() => toggle(leg)}
      className={cn(
        "relative z-10 flex h-10 select-none flex-col items-center justify-center rounded-lg px-1 transition sm:px-1.5",
        // No outline. The green fill says "in your slip"; the best line has its dot.
        inSlip ? "bg-good/25 hover:bg-good/30" : "bg-inset hover:bg-active",
      )}
    >
      <span className="whitespace-nowrap font-mono text-[11px] font-semibold leading-tight tracking-tight text-fg sm:text-xs sm:tracking-normal">{primary}</span>
      <span className="whitespace-nowrap font-mono text-[10px] leading-tight text-fg-muted">{secondary}</span>
      {isBest ? <span className="absolute right-0.5 top-0.5 size-1 sm:right-1.5 sm:top-1.5 sm:size-1.5 rounded-full bg-good-fg" /> : null}
    </button>
  );
}
