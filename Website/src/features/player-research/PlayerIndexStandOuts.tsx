import { StandOutList } from "@/components/ui/StandOutList";
import type { SlateGamePlayers } from "@/data/types";
import { slateStandOuts } from "@/lib/research/standOuts/slate";

/** What stands out across every player listed on the Props page. */
export function PlayerIndexStandOuts({ league, slate }: { league: string; slate: readonly SlateGamePlayers[] }) {
  return <StandOutList items={slateStandOuts(slate, league)} />;
}
