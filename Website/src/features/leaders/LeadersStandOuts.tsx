import { Suspense } from "react";
import { StandOutList } from "@/components/ui/StandOutList";
import type { LeaderRow } from "@/data/types";
import { LEADER_FILTERS, type LeaderFilter } from "@/lib/research/leaders";
import { leaderStandOuts } from "@/lib/research/standOuts/leaders";
import type { StandOut } from "@/lib/research/standOuts/standOut";
import { CategoryStandOuts } from "./CategoryStandOuts";

interface LeadersStandOutsProps {
  league: string;
  /** Every ranked row for the slate, best first. */
  rows: readonly LeaderRow[];
}

/**
 * What stands out on the Leaders board. The list for every category is worked
 * out here, on the server, so the browser only has to pick the one for the
 * category in the URL. Until the URL is read, the mixed board's list is shown.
 */
export function LeadersStandOuts({ league, rows }: LeadersStandOutsProps) {
  const byFilter = Object.fromEntries(LEADER_FILTERS.map((filter) => [filter, leaderStandOuts(rows, filter, league)])) as Record<
    LeaderFilter,
    StandOut[]
  >;

  return (
    <Suspense fallback={<StandOutList items={byFilter.ALL} />}>
      <CategoryStandOuts byFilter={byFilter} />
    </Suspense>
  );
}
