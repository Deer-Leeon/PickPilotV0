import { Suspense } from "react";
import { StandOutList, StandOutListSkeleton } from "@/components/ui/StandOutList";
import { getGamePlayers } from "@/data/repository";
import { RotationStandOuts } from "@/features/game-detail/GameStandOuts";

type Props = PageProps<"/[league]/games/[gameId]/players">;

/** Side panel for a game's Players tab. */
export default function RotationStandOutsSlot({ params }: Props) {
  return (
    <Suspense fallback={<StandOutListSkeleton />}>
      <Rotations params={params} />
    </Suspense>
  );
}

async function Rotations({ params }: Pick<Props, "params">) {
  const { league, gameId } = await params;
  const rosters = await getGamePlayers(league, gameId);
  // The page itself shows "not found" for an unknown game. The panel just has nothing to say.
  if (!rosters) return <StandOutList items={[]} />;
  return <RotationStandOuts league={league} rosters={rosters} />;
}
