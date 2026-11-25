"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { InsetRow } from "@/components/ui/InsetRow";
import type { ProfileScope, ShotTypeId, ShotTypeSplit } from "@/data/types";
import { cn } from "@/lib/cn";
import { isSoftMatchup } from "@/lib/research/matchup";
import { ScopeToggle } from "./ScopeToggle";

interface ShotTypesProps {
  shotTypes: Record<ProfileScope, ShotTypeSplit[]>;
  playerLastName: string;
  opponentAbbr: string;
}

const SHOT_TYPE_LABELS: Record<ShotTypeId, { name: string; short: string }> = {
  pullUp: { name: "Pull-Up Jumpers", short: "Pull-Up" },
  rim: { name: "Rim & Paint (<10 ft)", short: "Rim <10ft" },
  catchShoot: { name: "Catch & Shoot", short: "Catch & Shoot" },
};

const SEGMENT_SHADES = ["bg-good", "bg-good-fg", "bg-emerald-300/80"];

/** How the player's shots split by type, with tonight's opponent's rank against each. */
export function ShotTypes({ shotTypes, playerLastName, opponentAbbr }: ShotTypesProps) {
  const [scope, setScope] = useState<ProfileScope>("season");
  const splits = shotTypes[scope];

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-fg">Shot Type Breakdown</h3>
          <p className="truncate text-[11px] text-fg-muted">
            {playerLastName} shot profile vs. {opponentAbbr} defense rank
          </p>
        </div>
        <ScopeToggle label="Shot type sample" value={scope} onChange={setScope} />
      </div>

      <div className="space-y-1.5">
        <div aria-hidden="true" className="flex h-3 gap-1 overflow-hidden rounded-full bg-inset p-0.5">
          {splits.map((split, index) => (
            <div key={split.type} style={{ width: `${split.share}%` }} className={cn("rounded-full", SEGMENT_SHADES[index % SEGMENT_SHADES.length])} />
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 px-0.5 font-mono text-[10px] text-fg-muted">
          {splits.map((split) => (
            <span key={split.type}>
              {SHOT_TYPE_LABELS[split.type].short} <strong className="text-fg">{split.share}%</strong>
            </span>
          ))}
        </div>
      </div>

      <ul className="space-y-2.5">
        {splits.map((split) => {
          const soft = isSoftMatchup(split.oppRank);
          return (
            <InsetRow key={split.type}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 shrink-0 rounded-full", soft ? "bg-good-fg" : "bg-bad-fg")} />
                  <span className="truncate text-xs font-bold text-fg">{SHOT_TYPE_LABELS[split.type].name}</span>
                </div>
                <div className="mt-1 pl-4 font-mono text-[11px] text-fg-muted">
                  <span className="text-fg-soft">{split.ppg.toFixed(1)} PPG</span> · {split.fga.toFixed(1)} FGA ·{" "}
                  <span className="text-good-fg">
                    {split.efficiencyPct.toFixed(1)}% {split.efficiencyLabel}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3 font-mono">
                <div className="text-right">
                  <div className="text-xs font-bold text-fg">{split.share}%</div>
                  <div className="text-[9px] uppercase text-fg-subtle">Share</div>
                </div>
                <Badge tone={soft ? "good" : "bad"} className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold">
                  {opponentAbbr} #{split.oppRank}
                </Badge>
              </div>
            </InsetRow>
          );
        })}
      </ul>
    </Card>
  );
}
