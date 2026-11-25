"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { FAVORABLE_HIT_RATE } from "@/lib/research/hitRate";
import { formatOdds } from "@/lib/research/odds";
import type { SlipLeg } from "./slipStore";

interface SlipLegCardProps {
  leg: SlipLeg;
  onRemove: (id: string) => void;
  /** Called when the user follows the leg's link, so a sheet can close. */
  onNavigate?: () => void;
}

/** One saved pick. The card links back to where the pick was researched. */
export function SlipLegCard({ leg, onRemove, onNavigate }: SlipLegCardProps) {
  const rate = leg.hits !== null && leg.sample ? leg.hits / leg.sample : null;

  return (
    <li className="group relative rounded-xl bg-raised transition hover:bg-active">
      <Link href={leg.href} onClick={onNavigate} className="block space-y-1.5 p-3 pr-9">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-bold leading-snug text-fg">{leg.title}</span>
          <span className="shrink-0 font-mono text-xs font-bold text-good-fg">{formatOdds(leg.price)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 font-mono text-[11px] text-fg-muted">
          <span className="truncate">
            {leg.subtitle}
            {leg.book ? ` · ${leg.book}` : ""}
          </span>
          {rate !== null ? (
            <span className={cn("shrink-0", rate >= FAVORABLE_HIT_RATE ? "text-good-fg" : "text-bad-fg")}>
              {Math.round(rate * 100)}% ({leg.hits}/{leg.sample})
            </span>
          ) : null}
        </div>
      </Link>
      <button
        type="button"
        onClick={() => onRemove(leg.id)}
        aria-label={`Remove ${leg.title}`}
        className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-md text-sm text-fg-subtle transition hover:bg-white/10 hover:text-fg"
      >
        ×
      </button>
    </li>
  );
}
