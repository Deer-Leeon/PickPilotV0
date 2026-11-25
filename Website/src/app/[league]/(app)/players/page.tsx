import { Suspense } from "react";
import type { Metadata } from "next";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { getSlatePlayers } from "@/data/repository";
import { PlayerIndex } from "@/features/player-research/PlayerIndex";

export const metadata: Metadata = { title: "Player Props" };

type Props = PageProps<"/[league]/players">;

export default function PlayersPage({ params }: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Players params={params} />
    </Suspense>
  );
}

async function Players({ params }: Pick<Props, "params">) {
  const { league } = await params;
  const slate = await getSlatePlayers(league);
  return <PlayerIndex league={league} slate={slate} />;
}
