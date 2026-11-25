"use client";

import { cn } from "@/lib/cn";
import { useSlip } from "./useSlip";

/** Top-bar button that opens and closes the slip and shows how many picks are on it. */
export function SlipToggle({ className }: { className?: string }) {
  const { legs, isOpen, setOpen } = useSlip();
  return (
    <button
      type="button"
      onClick={() => setOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-label={`Research slip, ${legs.length} ${legs.length === 1 ? "pick" : "picks"}`}
      className={cn(
        "flex select-none items-center gap-2 rounded-lg border bg-raised px-3 py-1.5 font-mono text-xs text-fg-soft transition",
        isOpen ? "border-fg-subtle" : "border-border hover:border-fg-subtle",
        className,
      )}
    >
      <span className={cn("size-2 rounded-full", legs.length > 0 ? "bg-good-fg" : "bg-fg-faint")} />
      <span>Slip</span>
      <span className="min-w-5 rounded bg-white/10 px-1.5 text-center font-bold text-fg">{legs.length}</span>
    </button>
  );
}
