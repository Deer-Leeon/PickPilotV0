"use client";

import { PlayerAvatar } from "@/components/media/PlayerAvatar";
import { FilterIcon } from "@/components/shell/icons";
import { CONTROL_FILL } from "@/components/ui/Button";
import type { PlayerProp, PlayerResearch } from "@/data/types";
import { AddToSlipButton } from "@/features/slip/AddToSlipButton";
import { propLeg } from "@/features/slip/legs";
import { cn } from "@/lib/cn";
import { computeHitRate } from "@/lib/research/hitRate";
import { flashKey, standOutTargets } from "@/lib/research/standOuts/targets";
import { formatOdds } from "@/lib/research/odds";
import { STAT_FAMILIES, getStatValue } from "@/lib/research/stats";

interface PlayerHeaderProps {
  league: string;
  research: PlayerResearch;
  prop: PlayerProp | null;
  filterCount: number;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  onOpenRoster: () => void;
}

/** Who the player is, the prop being researched with its prices, and the filters button. */
export function PlayerHeader({ league, research, prop, filterCount, filtersOpen, onToggleFilters, onOpenRoster }: PlayerHeaderProps) {
  const { player, team, opponent, isHome, gameLog } = research;
  const matchup = `${isHome ? "vs" : "@"} ${opponent.abbr}`;
  const highlighted = filtersOpen || filterCount > 0;

  // The slip always carries the full-season record, so a pick reads the same wherever it was added.
  const season = prop
    ? computeHitRate(
        gameLog.map((game) => getStatValue(game, prop.stat)),
        prop.line,
      )
    : null;

  const propRow = prop ? (
    <>
      <span className="mr-1 font-mono text-xs font-bold text-fg">
        {prop.stat === "DD" ? STAT_FAMILIES.DD.label : `${prop.line} ${STAT_FAMILIES[prop.stat].label}`}
      </span>
      <span className="rounded bg-good/15 px-2 py-1 font-mono text-[11px] font-semibold text-good-fg">
        {prop.stat === "DD" ? "Yes" : "O"} {formatOdds(prop.over.price)} ({prop.over.book})
      </span>
      <span className="rounded bg-bad/10 px-2 py-1 font-mono text-[11px] text-bad-fg">
        {prop.stat === "DD" ? "No" : "U"} {formatOdds(prop.under.price)}
      </span>
      <AddToSlipButton
        variant="icon"
        className="size-6 rounded-md"
        leg={propLeg({
          league,
          playerId: player.id,
          playerName: player.name,
          stat: prop.stat,
          line: prop.line,
          side: "over",
          price: prop.over.price,
          book: prop.over.book,
          matchup,
          hits: season?.hits,
          sample: season?.total,
        })}
      />
    </>
  ) : (
    <span className="font-mono text-xs text-fg-muted">No props posted</span>
  );

  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 pb-2.5 sm:gap-x-3.5">
      {/* Below lg the roster lives in a sheet. On wide screens this only shows while the filter drawer has taken the roster's place. */}
      <button
        type="button"
        onClick={onOpenRoster}
        className={cn(
          "shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
          CONTROL_FILL,
          filtersOpen ? "flex" : "flex lg:hidden",
        )}
      >
        <span aria-hidden="true">◂</span> Roster
      </button>
      <PlayerAvatar name={player.name} headshotKey={player.headshotKey} className="size-9 sm:size-11" />
      <div className="min-w-0 flex-1">
        <div className="sm:flex sm:items-center sm:gap-2">
          <h1 className="truncate text-base font-bold tracking-tight text-fg">{player.name}</h1>
          <span className="block shrink-0 truncate font-mono text-[11px] text-fg-muted">
            {player.position} · {team.abbr} {matchup}
          </span>
        </div>
        <div className="mt-1 hidden flex-wrap items-center gap-1.5 sm:flex" {...flashKey(standOutTargets.prop)}>
          {propRow}
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleFilters}
        aria-expanded={filtersOpen}
        aria-label={filterCount > 0 ? `Filters, ${filterCount} active` : "Filters"}
        {...flashKey(standOutTargets.filtersButton)}
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 font-mono text-xs transition sm:px-3.5",
          highlighted ? "bg-good font-bold text-black shadow-md" : CONTROL_FILL,
        )}
      >
        <FilterIcon className="size-3.5" />
        <span className="hidden sm:inline">Filters</span>
        {filterCount > 0 ? <span>({filterCount})</span> : null}
      </button>

      {/* On phones the prop and its prices get their own line. */}
      <div className="flex w-full flex-wrap items-center gap-1.5 sm:hidden" {...flashKey(standOutTargets.prop)}>
        {propRow}
      </div>
    </div>
  );
}
