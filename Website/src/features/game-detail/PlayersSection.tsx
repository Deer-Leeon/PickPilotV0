"use client";

import { useQueryState } from "nuqs";
import type { Game, GameRosters, StatWindow } from "@/data/types";
import { gameParsers } from "./gameParams";
import { RotationTable } from "./RotationTable";

interface PlayersSectionProps {
  league: string;
  seasonLabel: string;
  game: Game;
  rosters: GameRosters;
}

interface PlayersViewProps extends PlayersSectionProps {
  window: StatWindow;
  onWindowChange: (window: StatWindow) => void;
}

function PlayersView({ league, seasonLabel, game, rosters, window, onWindowChange }: PlayersViewProps) {
  // Side by side only once the page column has room for both tables in full; below that they stack.
  return (
    <div className="grid grid-cols-1 gap-5 @6xl:grid-cols-2">
      <RotationTable
        league={league}
        seasonLabel={seasonLabel}
        roster={rosters.away}
        matchup={`@ ${game.home.team.abbr}`}
        window={window}
        onWindowChange={onWindowChange}
      />
      <RotationTable
        league={league}
        seasonLabel={seasonLabel}
        roster={rosters.home}
        matchup={`vs ${game.away.team.abbr}`}
        window={window}
        onWindowChange={onWindowChange}
      />
    </div>
  );
}

const noop = () => {};

/** Server-rendered default: the season window. Suspense fallback for PlayersSection. */
export function PlayersSectionFallback(props: PlayersSectionProps) {
  return <PlayersView {...props} window="season" onWindowChange={noop} />;
}

/** The Players tab: both rotations, sharing one stat window kept in the URL. */
export function PlayersSection(props: PlayersSectionProps) {
  const [window, setWindow] = useQueryState("window", gameParsers.window);
  return <PlayersView {...props} window={window} onWindowChange={(next) => void setWindow(next)} />;
}
