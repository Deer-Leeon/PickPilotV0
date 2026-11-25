import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { getPlayer, getPlayerResearch, listPlayerIds } from "@/data/repository";
import { PlayerResearchFallback, PlayerResearchPage } from "@/features/player-research/PlayerResearchPage";

type Props = PageProps<"/[league]/players/[playerId]">;

/** Every player on the slate is built ahead of time. */
export async function generateStaticParams({ params }: { params: { league: string } }) {
  const playerIds = await listPlayerIds(params.league);
  return playerIds.map((playerId) => ({ playerId }));
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { league, playerId } = await params;
  const player = await getPlayer(league, playerId);
  return { title: player ? `${player.name} Props` : "Player not found" };
}

export default function PlayerPage({ params }: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Research params={params} />
    </Suspense>
  );
}

async function Research({ params }: Pick<Props, "params">) {
  const { league, playerId } = await params;
  const research = await getPlayerResearch(league, playerId);
  if (!research) notFound();

  // Stat, sample, filters and open panels live in the URL, which only the
  // browser knows. Until it is read, the fallback shows the default view.
  return (
    <Suspense fallback={<PlayerResearchFallback league={league} research={research} />}>
      <PlayerResearchPage key={research.player.id} league={league} research={research} />
    </Suspense>
  );
}
