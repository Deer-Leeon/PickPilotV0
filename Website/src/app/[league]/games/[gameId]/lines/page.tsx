import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import { getGame, getGameLines } from "@/data/repository";
import { GameLinesCards } from "@/features/game-detail/GameLinesCards";

type Props = PageProps<"/[league]/games/[gameId]/lines">;

export default function GameLinesPage({ params }: Props) {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
      <Lines params={params} />
    </Suspense>
  );
}

async function Lines({ params }: Pick<Props, "params">) {
  const { league, gameId } = await params;
  const [game, lines] = await Promise.all([getGame(league, gameId), getGameLines(league, gameId)]);
  if (!game || !lines) notFound();
  return <GameLinesCards league={league} game={game} lines={lines} />;
}
