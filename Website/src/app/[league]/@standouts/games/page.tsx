import { Suspense } from "react";
import { StandOutListSkeleton } from "@/components/ui/StandOutList";
import { getSlateDates, getSlatePlayers } from "@/data/repository";
import { GamesStandOuts } from "@/features/games/GamesStandOuts";

type Props = PageProps<"/[league]/games">;

/** Side panel for the Games board. */
export default function GamesStandOutsSlot({ params }: Props) {
  return (
    <Suspense fallback={<StandOutListSkeleton />}>
      <Slate params={params} />
    </Suspense>
  );
}

async function Slate({ params }: Pick<Props, "params">) {
  const { league } = await params;
  const [dates, slate] = await Promise.all([getSlateDates(league), getSlatePlayers(league)]);
  return <GamesStandOuts league={league} dates={dates} slate={slate} />;
}
