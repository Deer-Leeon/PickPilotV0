"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { Sheet } from "@/components/ui/Sheet";
import { SlipLegCard } from "./SlipLegCard";
import { useSlip } from "./useSlip";

function slipTitle(count: number): string {
  return `Research Slip (${count})`;
}

/** The saved picks, or the empty state. `onNavigate` lets a sheet close when a pick is followed. */
function SlipBody({ onNavigate }: { onNavigate?: () => void }) {
  const { legs, remove, clear } = useSlip();

  if (legs.length === 0) {
    return (
      <EmptyState
        className="flex-1"
        title="Your research slip"
        description="Select any odd to start researching. Picks you add are saved on this device."
      />
    );
  }
  return (
    <>
      <ul className="flex-1 space-y-3 overflow-y-auto p-4">
        {legs.map((leg) => (
          <SlipLegCard key={leg.id} leg={leg} onRemove={remove} onNavigate={onNavigate} />
        ))}
      </ul>
      <div className="flex shrink-0 items-center justify-between px-4 py-3 text-[11px] text-fg-subtle">
        <span>For research only. No bets are placed.</span>
        <button type="button" onClick={clear} className="font-medium text-fg-muted transition hover:text-fg">
          Clear all
        </button>
      </div>
    </>
  );
}

/** The research slip as the content of a docked side panel: its heading, a close button and the picks. */
export function SlipPanel() {
  const { legs, setOpen } = useSlip();
  return (
    <>
      <div className="flex shrink-0 items-center justify-between bg-card p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-good-fg" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-fg">{slipTitle(legs.length)}</h2>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-fg-muted transition hover:text-fg">
          Close ×
        </button>
      </div>
      <SlipBody />
    </>
  );
}

/** The research slip as a sheet over the page, for screens too narrow to dock it. */
export function SlipSheet({ open }: { open: boolean }) {
  const { legs, setOpen } = useSlip();
  return (
    <Sheet open={open} onOpenChange={setOpen} title={slipTitle(legs.length)} side="right">
      <SlipBody onNavigate={() => setOpen(false)} />
    </Sheet>
  );
}
