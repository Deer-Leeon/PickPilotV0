import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import { getGame, getGameMatchup, getLeague } from "@/data/repository";
import { MatchupSection, MatchupSectionFallback } from "@/features/game-detail/MatchupSection";

type Props = PageProps<"/[league]/games/[gameId]/matchup">;

export default function MatchupPage({ params }: Props) {
  return (
    <Suspense fallback={<Skeleton className="min-h-96 flex-1 rounded-2xl" />}>
      <Matchup params={params} />
    </Suspense>
  );
}

async function Matchup({ params }: Pick<Props, "params">) {
  const { league: leagueId, gameId } = await params;
  const [league, game, matchup] = await Promise.all([getLeague(leagueId), getGame(leagueId, gameId), getGameMatchup(leagueId, gameId)]);
  if (!league || !game || !matchup) notFound();

  const props = { league: league.id, seasonLabel: league.seasonShortLabel, game, matchup };
  return (
    <Suspense fallback={<MatchupSectionFallback {...props} />}>
      <MatchupSection {...props} />
    </Suspense>
  );
}
