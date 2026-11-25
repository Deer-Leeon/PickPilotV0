"use client";

import { cn } from "@/lib/cn";
import { useSidePanelStore } from "./sidePanelStore";

/**
 * Top-bar button that opens Stand Outs as a sheet. It is only shown on
 * screens too narrow to dock the side panel, where Stand Outs is always visible.
 */
export function StandOutsToggle({ className }: { className?: string }) {
  const open = useSidePanelStore((state) => state.standOutsOpen);
  const setOpen = useSidePanelStore((state) => state.setStandOutsOpen);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      aria-haspopup="dialog"
      className={cn(
        // The transparent border is spacing only: it keeps the button the height of the slip button beside it.
        "flex select-none items-center gap-2 rounded-lg border border-transparent bg-raised px-3 py-1.5 font-mono text-xs text-fg-soft transition hover:bg-active hover:text-fg",
        className,
      )}
    >
      <span aria-hidden="true" className="flex gap-0.5">
        <span className="size-2 rounded-full bg-good-fg" />
        <span className="size-2 rounded-full bg-bad-fg" />
      </span>
      <span>Stand Outs</span>
    </button>
  );
}
