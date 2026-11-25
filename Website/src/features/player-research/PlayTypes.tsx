"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { InsetRow } from "@/components/ui/InsetRow";
import type { PlayTypeId, PlayTypeSplit, ProfileScope } from "@/data/types";
import { cn } from "@/lib/cn";
import { isSoftMatchup } from "@/lib/research/matchup";
import { ScopeToggle } from "./ScopeToggle";

interface PlayTypesProps {
  playTypes: Record<ProfileScope, PlayTypeSplit[]>;
  opponentAbbr: string;
}

const PLAY_TYPE_LABELS: Record<PlayTypeId, string> = {
  pnrHandler: "Pick & Roll Handler",
  iso: "Isolation",
  transition: "Transition",
  spotUp: "Spot-Up",
  postUp: "Post-Up & Off-Screen",
};

/** How the player's possessions split by play type, with tonight's opponent's rank against each. */
export function PlayTypes({ playTypes, opponentAbbr }: PlayTypesProps) {
  const [scope, setScope] = useState<ProfileScope>("season");
  const splits = [...playTypes[scope]].sort((a, b) => b.share - a.share);

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-fg">Play Types</h3>
          <p className="truncate text-[11px] text-fg-muted">Offensive play frequency vs. {opponentAbbr} defense rank</p>
        </div>
        <ScopeToggle label="Play type sample" value={scope} onChange={setScope} />
      </div>

      <ul className="space-y-2">
        {splits.map((split) => {
          const soft = isSoftMatchup(split.oppRank);
          return (
            <InsetRow key={split.type} layout="stack" density="regular">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-semibold text-fg">{PLAY_TYPE_LABELS[split.type]}</span>
                  <span className="shrink-0 font-mono text-[11px] text-fg-muted">
                    {split.ppg.toFixed(1)} PPG<span className="hidden sm:inline"> · {split.ppp.toFixed(2)} PPP</span>
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2.5 font-mono">
                  <span className="font-bold text-fg">{split.share}%</span>
                  <Badge tone={soft ? "good" : "bad"} className="w-16 font-bold">
                    {opponentAbbr} #{split.oppRank}
                  </Badge>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-raised">
                <div className={cn("h-full rounded-full", soft ? "bg-good" : "bg-bad")} style={{ width: `${Math.min(100, split.share * 2.6)}%` }} />
              </div>
            </InsetRow>
          );
        })}
      </ul>
    </Card>
  );
}
