import { Suspense } from "react";
import { StandOutListSkeleton } from "@/components/ui/StandOutList";
import { getLeaders } from "@/data/repository";
import { LeadersStandOuts } from "@/features/leaders/LeadersStandOuts";

type Props = PageProps<"/[league]/leaders">;

/** Side panel for the Leaders board. */
export default function LeadersStandOutsSlot({ params }: Props) {
  return (
    <Suspense fallback={<StandOutListSkeleton />}>
      <Leaders params={params} />
    </Suspense>
  );
}

async function Leaders({ params }: Pick<Props, "params">) {
  const { league } = await params;
  const rows = await getLeaders(league);
  return <LeadersStandOuts league={league} rows={rows} />;
}
