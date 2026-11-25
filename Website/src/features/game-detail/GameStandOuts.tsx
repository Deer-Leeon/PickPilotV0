import { Suspense } from "react";
import { StandOutList } from "@/components/ui/StandOutList";
import type { Game, GameInjuries, GameLines, GameMatchup, GameRosters, StatWindow } from "@/data/types";
import { STAT_WINDOWS } from "@/lib/research/matchup";
import { injuryStandOuts } from "@/lib/research/standOuts/injuries";
import { lineStandOuts } from "@/lib/research/standOuts/lines";
import { matchupStandOuts } from "@/lib/research/standOuts/matchup";
import { rotationStandOuts } from "@/lib/research/standOuts/rotation";
import type { StandOut } from "@/lib/research/standOuts/standOut";
import { WindowStandOuts } from "./WindowStandOuts";

/**
 * What stands out on each of the four game tabs.
 *
 * Matchup and Players follow the stat window in the URL. The list for every
 * window is worked out here, on the server, so the browser only has to pick
 * one. Until the URL is read, the season list is shown.
 */
function ByWindow({ find }: { find: (window: StatWindow) => StandOut[] }) {
  const byWindow = Object.fromEntries(STAT_WINDOWS.map((window) => [window, find(window)])) as Record<StatWindow, StandOut[]>;
  return (
    <Suspense fallback={<StandOutList items={byWindow.season} />}>
      <WindowStandOuts byWindow={byWindow} />
    </Suspense>
  );
}

interface MatchupStandOutsProps {
  league: string;
  /** Teams in the league: the worst possible rank. */
  teamCount: number;
  game: Game;
  matchup: GameMatchup;
}

export function MatchupStandOuts({ league, teamCount, game, matchup }: MatchupStandOutsProps) {
  return <ByWindow find={(window) => matchupStandOuts({ game, matchup, window, teamCount, league })} />;
}

export function RotationStandOuts({ league, rosters }: { league: string; rosters: GameRosters }) {
  return <ByWindow find={(window) => rotationStandOuts(rosters, window, league)} />;
}

export function LinesStandOuts({ lines }: { lines: GameLines }) {
  return <StandOutList items={lineStandOuts(lines)} />;
}

export function InjuriesStandOuts({ injuries }: { injuries: GameInjuries }) {
  return <StandOutList items={injuryStandOuts(injuries)} />;
}
