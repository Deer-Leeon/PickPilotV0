import type { SlateDate } from "@/data/types";

/** The date the Games board opens on: today if it is on the slate, otherwise the first date. */
export function defaultSlateDate(dates: readonly SlateDate[]): string {
  return dates.find((entry) => entry.isToday)?.date ?? dates[0]?.date ?? "";
}
