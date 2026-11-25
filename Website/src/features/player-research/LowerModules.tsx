"use client";

import type { PlayerResearch } from "@/data/types";
import { cn } from "@/lib/cn";
import { lastName } from "@/lib/format";
import { LOWER_TABS, type LowerTab } from "./playerParams";
import { PlayTypes } from "./PlayTypes";
import { ShotTypes } from "./ShotTypes";
import { ShotZones } from "./ShotZones";
import { POSITION_GROUP_LABELS, SimilarPlayers } from "./SimilarPlayers";

interface LowerModulesProps {
  research: PlayerResearch;
  tab: LowerTab;
  onTabChange: (tab: LowerTab) => void;
}

/**
 * The four research modules under the chart: one at a time, or all together.
 * A size container: "Compare All 4" puts two modules side by side only where this column has the room.
 */
export function LowerModules({ research, tab, onTabChange }: LowerModulesProps) {
  const { player, opponent, shotProfile, similar } = research;

  const labels: Record<LowerTab, string> = {
    zones: "Shooting Zones (Half-Court)",
    shots: "Shot Types",
    plays: "Play Types",
    similar: `Similar ${POSITION_GROUP_LABELS[player.positionGroup]} vs ${opponent.abbr}`,
    all: "Compare All 4",
  };
  // What a tab is called where the bar is too narrow to fit every full label.
  const shortLabels: Partial<Record<LowerTab, string>> = { zones: "Shooting Zones" };

  const zones = <ShotZones zones={shotProfile.zones} opponentAbbr={opponent.abbr} />;
  const shots = <ShotTypes shotTypes={shotProfile.shotTypes} playerLastName={lastName(player.name)} opponentAbbr={opponent.abbr} />;
  const plays = <PlayTypes playTypes={shotProfile.playTypes} opponentAbbr={opponent.abbr} />;
  const comps = <SimilarPlayers comps={similar} positionGroup={player.positionGroup} opponentNickname={opponent.nickname} />;

  return (
    <div className="@container pb-10">
      {/* Solid background so cards do not show through while the tab bar is stuck to the top. */}
      <div className="sticky top-0 z-30 -mx-1 bg-canvas px-1 py-3">
        <div
          role="tablist"
          aria-label="Research modules"
          className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-xl bg-card p-1.5 shadow-xl @2xl:gap-1.5"
        >
          {LOWER_TABS.map((id) => {
            const active = id === tab;
            const short = shortLabels[id];
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(id)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition @2xl:px-3.5",
                  active ? "bg-white font-semibold text-black shadow" : "text-fg-muted hover:text-fg",
                )}
              >
                {short ? (
                  <>
                    <span className="@2xl:hidden">{short}</span>
                    <span className="hidden @2xl:inline">{labels[id]}</span>
                  </>
                ) : (
                  labels[id]
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* The minimum height keeps the page from jumping when a shorter module is selected. */}
      <div role="tabpanel" aria-label={labels[tab]} className="min-h-[32rem] pt-1">
        {tab === "zones" ? zones : null}
        {tab === "shots" ? shots : null}
        {tab === "plays" ? plays : null}
        {tab === "similar" ? comps : null}
        {tab === "all" ? (
          <div className="space-y-5">
            {zones}
            <div className="grid grid-cols-1 items-stretch gap-5 @4xl:grid-cols-2">
              {shots}
              {plays}
            </div>
            {comps}
          </div>
        ) : null}
      </div>
    </div>
  );
}
