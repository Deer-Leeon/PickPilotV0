import { Suspense } from "react";
import { StandOutListSkeleton } from "@/components/ui/StandOutList";
import { getSlatePlayers } from "@/data/repository";
import { PlayerIndexStandOuts } from "@/features/player-research/PlayerIndexStandOuts";

type Props = PageProps<"/[league]/players">;

/** Side panel for the Props list. */
export default function PlayerIndexStandOutsSlot({ params }: Props) {
  return (
    <Suspense fallback={<StandOutListSkeleton />}>
      <Slate params={params} />
    </Suspense>
  );
}

async function Slate({ params }: Pick<Props, "params">) {
  const { league } = await params;
  const slate = await getSlatePlayers(league);
  return <PlayerIndexStandOuts league={league} slate={slate} />;
}
