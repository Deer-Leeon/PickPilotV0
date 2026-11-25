"use client";

import { useQueryState } from "nuqs";
import { StandOutList } from "@/components/ui/StandOutList";
import type { LeaderFilter } from "@/lib/research/leaders";
import type { StandOut } from "@/lib/research/standOuts/standOut";
import { leaderParsers } from "./leadersParams";

/** Shows the stand-outs for the category selected on the Leaders board, which lives in the URL (?cat=REB). */
export function CategoryStandOuts({ byFilter }: { byFilter: Record<LeaderFilter, StandOut[]> }) {
  const [filter] = useQueryState("cat", leaderParsers.cat);
  return <StandOutList items={byFilter[filter]} />;
}
