import { Suspense } from "react";
import { StandOutList, StandOutListSkeleton } from "@/components/ui/StandOutList";
import { getGame, getGameMatchup, getLeague } from "@/data/repository";
import { MatchupStandOuts } from "@/features/game-detail/GameStandOuts";

type Props = PageProps<"/[league]/games/[gameId]/matchup">;

/** Side panel for a game's Matchup tab. */
export default function MatchupStandOutsSlot({ params }: Props) {
  return (
    <Suspense fallback={<StandOutListSkeleton />}>
      <Matchup params={params} />
    </Suspense>
  );
}

async function Matchup({ params }: Pick<Props, "params">) {
  const { league: leagueId, gameId } = await params;
  const [league, game, matchup] = await Promise.all([getLeague(leagueId), getGame(leagueId, gameId), getGameMatchup(leagueId, gameId)]);
  // The page itself shows "not found" for an unknown game. The panel just has nothing to say.
  if (!league || !game || !matchup) return <StandOutList items={[]} />;
  return <MatchupStandOuts league={league.id} teamCount={league.teamCount} game={game} matchup={matchup} />;
}
