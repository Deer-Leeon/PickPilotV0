import { Suspense } from "react";
import { StandOutList } from "@/components/ui/StandOutList";
import type { SlateDate, SlateGamePlayers } from "@/data/types";
import { slateStandOuts } from "@/lib/research/standOuts/slate";
import { SlateDateStandOuts } from "./SlateDateStandOuts";
import { defaultSlateDate } from "./slateDate";

interface GamesStandOutsProps {
  league: string;
  dates: readonly SlateDate[];
  /** Every game on the slate with its rotations, whatever its date. */
  slate: readonly SlateGamePlayers[];
}

/**
 * What stands out on the Games board. The stand-outs for every date are
 * worked out here, on the server, so the browser only has to pick the list
 * for the date in the URL. Until the URL is read, today's list is shown.
 */
export function GamesStandOuts({ league, dates, slate }: GamesStandOutsProps) {
  const byDate = Object.fromEntries(
    dates.map(({ date }) => [
      date,
      slateStandOuts(
        slate.filter(({ game }) => game.date === date),
        league,
      ),
    ]),
  );

  return (
    <Suspense fallback={<StandOutList items={byDate[defaultSlateDate(dates)] ?? []} />}>
      <SlateDateStandOuts dates={dates} byDate={byDate} />
    </Suspense>
  );
}
