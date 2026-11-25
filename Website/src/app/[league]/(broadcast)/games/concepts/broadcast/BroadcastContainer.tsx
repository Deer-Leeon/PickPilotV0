"use client";

import { BroadcastView } from "@/features/games-broadcast/BroadcastView";
import type { Game, SlateDate } from "@/data/types";
import { useSlateDate } from "@/features/games/useSlateDate";

interface BroadcastContainerProps {
  league: string;
  dates: readonly SlateDate[];
  /** Games for every date in `dates`, keyed by date. */
  slates: Record<string, Game[]>;
}

/** The broadcast slate with its selected date kept in the URL (?date=…). */
export function BroadcastContainer({ league, dates, slates }: BroadcastContainerProps) {
  const [selectedDate, setDate] = useSlateDate(dates);
  return (
    <BroadcastView
      league={league}
      dates={dates}
      selectedDate={selectedDate}
      onSelectDate={setDate}
      games={slates[selectedDate] ?? []}
    />
  );
}
