"use client";

import { parseAsString, useQueryState } from "nuqs";
import type { SlateDate } from "@/data/types";
import { defaultSlateDate } from "./slateDate";

/**
 * The Games page's selected date, kept in the URL (?date=2026-11-14).
 * Today is the default and is left out of the URL; a date that is not on the
 * slate falls back to today.
 */
export function useSlateDate(dates: readonly SlateDate[]): [date: string, setDate: (date: string) => void] {
  const today = defaultSlateDate(dates);
  const [date, setDate] = useQueryState("date", parseAsString.withDefault(today));
  const selected = dates.some((entry) => entry.date === date) ? date : today;
  return [selected, (next) => void setDate(next === today ? null : next)];
}
