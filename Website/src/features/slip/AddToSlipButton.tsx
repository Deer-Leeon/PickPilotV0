"use client";

import { CONTROL_FILL } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { SlipLeg } from "./slipStore";
import { useSlipStore } from "./slipStore";
import { useIsInSlip } from "./useSlip";

interface AddToSlipButtonProps {
  leg: SlipLeg;
  /** "full" shows a label, "icon" is a compact + / ✓ for table rows. */
  variant?: "full" | "icon";
  className?: string;
}

/** Adds a pick to the research slip, or takes it off again. The green fill alone says "in your slip". */
export function AddToSlipButton({ leg, variant = "full", className }: AddToSlipButtonProps) {
  const inSlip = useIsInSlip(leg.id);
  const toggle = useSlipStore((state) => state.toggle);

  return (
    <button
      type="button"
      aria-pressed={inSlip}
      aria-label={inSlip ? `Remove ${leg.title} from slip` : `Add ${leg.title} to slip`}
      onClick={() => toggle(leg)}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-lg font-mono text-[11px] font-semibold transition",
        variant === "icon" ? "size-7" : "h-8 gap-1.5 px-3",
        inSlip ? "bg-good/25 text-good-fg" : CONTROL_FILL,
        className,
      )}
    >
      <span aria-hidden="true">{inSlip ? "✓" : "+"}</span>
      {variant === "full" ? <span>{inSlip ? "In Slip" : "Add to Slip"}</span> : null}
    </button>
  );
}
