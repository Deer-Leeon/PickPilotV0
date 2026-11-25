"use client";

import { useQueryStates } from "nuqs";
import type { Game, GameMatchup, StatWindow } from "@/data/types";
import { useLocateStandOut } from "@/hooks/useLocateStandOut";
import { teamStatOffense } from "@/lib/research/standOuts/targets";
import { gameParsers, type ComparisonView, type OffenseSide } from "./gameParams";
import { StartingLineups } from "./StartingLineups";
import { TeamComparison } from "./TeamComparison";

interface MatchupSectionProps {
  league: string;
  seasonLabel: string;
  game: Game;
  matchup: GameMatchup;
}

interface MatchupViewProps extends MatchupSectionProps {
  window: StatWindow;
  view: ComparisonView;
  offense: OffenseSide;
  onWindowChange: (window: StatWindow) => void;
  onViewChange: (view: ComparisonView) => void;
  onOffenseChange: (side: OffenseSide) => void;
}

function MatchupView({ league, seasonLabel, game, matchup, ...state }: MatchupViewProps) {
  return (
    <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
      <StartingLineups
        league={league}
        gameId={game.id}
        rosters={matchup.rosters}
        window={state.window}
        spotlightPlayerId={matchup.spotlightPlayer?.id ?? null}
      />
      <TeamComparison
        league={league}
        seasonLabel={seasonLabel}
        away={game.away.team}
        home={game.home.team}
        comparison={matchup.comparison}
        spotlightPlayer={matchup.spotlightPlayer}
        {...state}
      />
    </div>
  );
}

const noop = () => {};

/** Server-rendered default: season window, radar view. Suspense fallback for MatchupSection. */
export function MatchupSectionFallback(props: MatchupSectionProps) {
  return (
    <MatchupView {...props} window="season" view="radar" offense="away" onWindowChange={noop} onViewChange={noop} onOffenseChange={noop} />
  );
}

/** The Matchup tab, with its window, view and direction kept in the URL. */
export function MatchupSection(props: MatchupSectionProps) {
  const [params, setParams] = useQueryStates(gameParsers);

  // A team stat is drawn in the stat bars, and only for the offense on screen. Show that view, then the frame can find the row.
  useLocateStandOut((targets, event) => {
    const offense = targets.map(teamStatOffense).find((side) => side !== null);
    if (!offense || (params.view === "bars" && params.dir === offense)) return;
    event.preventDefault();
    void setParams({ view: "bars", dir: offense });
  });

  return (
    <MatchupView
      {...props}
      window={params.window}
      view={params.view}
      offense={params.dir}
      onWindowChange={(window) => void setParams({ window })}
      onViewChange={(view) => void setParams({ view })}
      onOffenseChange={(dir) => void setParams({ dir })}
    />
  );
}
