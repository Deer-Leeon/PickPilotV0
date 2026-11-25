import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { getLeaders, getLeague, getNavIndex } from "@/data/repository";
import { LeadersBoard, LeadersBoardFallback } from "@/features/leaders/LeadersBoard";

export const metadata: Metadata = { title: "Hit-Rate Leaders" };

type Props = PageProps<"/[league]/leaders">;

export default function LeadersPage({ params }: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Leaders params={params} />
    </Suspense>
  );
}

async function Leaders({ params }: Pick<Props, "params">) {
  const { league: leagueId } = await params;
  const [league, rows, nav] = await Promise.all([getLeague(leagueId), getLeaders(leagueId), getNavIndex(leagueId)]);
  if (!league) notFound();

  const props = { league: league.id, leagueName: league.name, gameCount: nav.todayGameCount, rows };
  return (
    <Suspense fallback={<LeadersBoardFallback {...props} />}>
      <LeadersBoard {...props} />
    </Suspense>
  );
}
