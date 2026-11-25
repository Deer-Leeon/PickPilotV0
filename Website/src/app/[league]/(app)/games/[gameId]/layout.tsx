import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageColumn } from "@/components/shell/PageColumn";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { getGame, getSlate, listGameIds } from "@/data/repository";
import { GameHero } from "@/features/game-detail/GameHero";
import { TrackRecentGame } from "@/features/game-detail/GameNav";

type Props = LayoutProps<"/[league]/games/[gameId]">;

/** Every game on the slate is built ahead of time. Other ids render on first request. */
export async function generateStaticParams({ params }: { params: { league: string } }) {
  const gameIds = await listGameIds(params.league);
  return gameIds.map((gameId) => ({ gameId }));
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { league, gameId } = await params;
  const game = await getGame(league, gameId);
  return { title: game ? `${game.away.team.abbr} @ ${game.home.team.abbr}` : "Game not found" };
}

/** Shared frame for the four game tabs: the hero stays put while the tab below it changes. */
export default function GameLayout({ children, params }: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <GameFrame params={params}>{children}</GameFrame>
    </Suspense>
  );
}

async function GameFrame({ params, children }: { params: Props["params"]; children: ReactNode }) {
  const { league, gameId } = await params;
  const game = await getGame(league, gameId);
  if (!game) notFound();
  const slate = await getSlate(league, game.date);

  return (
    <PageColumn>
      <GameHero league={league} game={game} slate={slate} />
      <TrackRecentGame gameId={game.id} />
      {children}
    </PageColumn>
  );
}
