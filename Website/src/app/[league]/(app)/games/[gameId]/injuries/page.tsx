import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import { getGameInjuries } from "@/data/repository";
import { InjuryReport } from "@/features/game-detail/InjuryReport";

type Props = PageProps<"/[league]/games/[gameId]/injuries">;

export default function GameInjuriesPage({ params }: Props) {
  return (
    <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
      <Injuries params={params} />
    </Suspense>
  );
}

async function Injuries({ params }: Pick<Props, "params">) {
  const { league, gameId } = await params;
  const injuries = await getGameInjuries(league, gameId);
  if (!injuries) notFound();
  return <InjuryReport injuries={injuries} />;
}
