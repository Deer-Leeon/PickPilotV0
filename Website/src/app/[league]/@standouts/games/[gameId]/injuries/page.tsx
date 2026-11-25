import { Suspense } from "react";
import { StandOutList, StandOutListSkeleton } from "@/components/ui/StandOutList";
import { getGameInjuries } from "@/data/repository";
import { InjuriesStandOuts } from "@/features/game-detail/GameStandOuts";

type Props = PageProps<"/[league]/games/[gameId]/injuries">;

/** Side panel for a game's Injuries tab. */
export default function InjuriesStandOutsSlot({ params }: Props) {
  return (
    <Suspense fallback={<StandOutListSkeleton />}>
      <Injuries params={params} />
    </Suspense>
  );
}

async function Injuries({ params }: Pick<Props, "params">) {
  const { league, gameId } = await params;
  const injuries = await getGameInjuries(league, gameId);
  // The page itself shows "not found" for an unknown game. The panel just has nothing to say.
  if (!injuries) return <StandOutList items={[]} />;
  return <InjuriesStandOuts injuries={injuries} />;
}
