"use client";

import { StandOutList } from "@/components/ui/StandOutList";
import type { SlateDate } from "@/data/types";
import type { StandOut } from "@/lib/research/standOuts/standOut";
import { useSlateDate } from "./useSlateDate";

interface SlateDateStandOutsProps {
  dates: readonly SlateDate[];
  /** Finished stand-outs for every date in `dates`, keyed by date. */
  byDate: Record<string, StandOut[]>;
}

/** Shows the stand-outs for the date selected on the Games board, which lives in the URL. */
export function SlateDateStandOuts({ dates, byDate }: SlateDateStandOutsProps) {
  const [date] = useSlateDate(dates);
  return <StandOutList items={byDate[date] ?? []} />;
}
