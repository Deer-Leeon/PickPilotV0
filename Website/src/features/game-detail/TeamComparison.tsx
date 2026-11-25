"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { Player, StatWindow, Team, TeamProfile } from "@/data/types";
import { cn } from "@/lib/cn";
import { flashKey, standOutTargets } from "@/lib/research/standOuts/targets";
import { routes } from "@/lib/routes";
import type { ComparisonView, OffenseSide } from "./gameParams";
import { RadarChart } from "./RadarChart";
import { StatBars } from "./StatBars";
import { WindowControl } from "./WindowControl";

export interface TeamComparisonProps {
  league: string;
  seasonLabel: string;
  away: Team;
  home: Team;
  comparison: { away: TeamProfile; home: TeamProfile };
  spotlightPlayer: Player | null;
  window: StatWindow;
  view: ComparisonView;
  offense: OffenseSide;
  onWindowChange: (window: StatWindow) => void;
  onViewChange: (view: ComparisonView) => void;
  onOffenseChange: (side: OffenseSide) => void;
}

/**
 * How the two teams rank against each other, as a radar or as stat bars.
 * The card is a size container: the legend notes and the hint show by the card's width, not the screen's.
 */
export function TeamComparison(props: TeamComparisonProps) {
  const { league, away, home, comparison, spotlightPlayer, window, view, offense } = props;
  const awayProfile = comparison.away[window];
  const homeProfile = comparison.home[window];

  const offenseOptions: { side: OffenseSide; label: string }[] = [
    { side: "away", label: `${away.abbr} Offense vs ${home.abbr} Defense` },
    { side: "home", label: `${home.abbr} Offense vs ${away.abbr} Defense` },
  ];

  return (
    <Card className="@container flex min-h-0 flex-col px-4 py-4 shadow-lg sm:px-5" {...flashKey(standOutTargets.comparison)}>
      <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold tracking-tight text-fg">Team Comparison</h2>
          <p className="text-xs text-fg-muted">Green indicates statistical advantage · Red indicates disadvantage</p>
        </div>
        <div className="flex items-center gap-2">
          <SegmentedControl
            label="Comparison view"
            value={view}
            onChange={props.onViewChange}
            options={[
              { value: "radar", label: "Radar" },
              { value: "bars", label: "Stat Bars" },
            ]}
          />
          <WindowControl value={window} onChange={props.onWindowChange} seasonLabel={props.seasonLabel} />
        </div>
      </div>

      {view === "radar" ? (
        <div className="flex min-h-80 flex-1 flex-col items-center justify-between">
          <div className="flex w-full shrink-0 items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="size-2.5 rounded-full bg-slate-200" />
              <span className="font-semibold text-fg">{away.abbr}</span>
              <span className="hidden text-[11px] text-fg-muted @sm:inline">(Left Rank)</span>
            </div>
            <span className="hidden font-mono text-[11px] text-fg-subtle @sm:inline">Outer Ring = #1 NBA</span>
            <div className="flex items-center gap-2 text-xs">
              <span className="size-2.5 rounded-full bg-good-fg" />
              <span className="font-semibold text-good-fg">{home.abbr}</span>
              <span className="hidden text-[11px] text-good-fg/70 @sm:inline">(Right Rank)</span>
            </div>
          </div>
          <div className="flex min-h-0 w-full flex-1 items-center justify-center py-2">
            <RadarChart awayAbbr={away.abbr} homeAbbr={home.abbr} away={awayProfile.radar} home={homeProfile.radar} />
          </div>
        </div>
      ) : (
        <>
          <div
            role="radiogroup"
            aria-label="Matchup direction"
            className="mb-4 grid shrink-0 select-none grid-cols-2 gap-1.5 rounded-xl bg-inset p-1 text-xs"
          >
            {offenseOptions.map((option) => {
              const active = option.side === offense;
              return (
                <button
                  key={option.side}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => props.onOffenseChange(option.side)}
                  className={cn(
                    "rounded-lg px-2 py-1.5 transition @sm:px-3",
                    active ? "bg-white font-semibold text-black" : "font-medium text-fg-muted hover:text-fg",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <StatBars away={awayProfile} home={homeProfile} direction={offense === "away" ? "awayOffense" : "homeOffense"} />
        </>
      )}

      <div className="mt-4 flex shrink-0 items-center justify-between gap-3">
        <span className="hidden font-mono text-xs text-fg-muted @sm:inline">Open any player to research their props</span>
        {spotlightPlayer ? (
          <Link
            href={routes.player(league, spotlightPlayer.id)}
            className="ml-auto flex shrink-0 select-none items-center gap-1.5 rounded-xl bg-raised px-3.5 py-2 text-xs font-medium text-fg-soft transition hover:bg-active hover:text-fg"
          >
            <span>{spotlightPlayer.name} Prop Research</span>
            <span aria-hidden="true" className="text-good-fg">
              →
            </span>
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
