import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import { getGame, getGamePlayers, getLeague } from "@/data/repository";
import { PlayersSection, PlayersSectionFallback } from "@/features/game-detail/PlayersSection";

type Props = PageProps<"/[league]/games/[gameId]/players">;

export default function GamePlayersPage({ params }: Props) {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
      <Players params={params} />
    </Suspense>
  );
}

async function Players({ params }: Pick<Props, "params">) {
  const { league: leagueId, gameId } = await params;
  const [league, game, rosters] = await Promise.all([getLeague(leagueId), getGame(leagueId, gameId), getGamePlayers(leagueId, gameId)]);
  if (!league || !game || !rosters) notFound();

  const props = { league: league.id, seasonLabel: league.seasonShortLabel, game, rosters };
  return (
    <Suspense fallback={<PlayersSectionFallback {...props} />}>
      <PlayersSection {...props} />
    </Suspense>
  );
}
