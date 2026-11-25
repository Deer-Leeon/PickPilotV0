import { Suspense } from "react";
import { StandOutList, StandOutListSkeleton } from "@/components/ui/StandOutList";
import { getGameLines } from "@/data/repository";
import { LinesStandOuts } from "@/features/game-detail/GameStandOuts";

type Props = PageProps<"/[league]/games/[gameId]/lines">;

/** Side panel for a game's Game lines tab. */
export default function LinesStandOutsSlot({ params }: Props) {
  return (
    <Suspense fallback={<StandOutListSkeleton />}>
      <Lines params={params} />
    </Suspense>
  );
}

async function Lines({ params }: Pick<Props, "params">) {
  const { league, gameId } = await params;
  const lines = await getGameLines(league, gameId);
  // The page itself shows "not found" for an unknown game. The panel just has nothing to say.
  if (!lines) return <StandOutList items={[]} />;
  return <LinesStandOuts lines={lines} />;
}
