import { Suspense } from "react";
import { StandOutList, StandOutListSkeleton } from "@/components/ui/StandOutList";
import { getPlayerResearch } from "@/data/repository";
import { PlayerSpotlight } from "@/features/player-research/PlayerSpotlight";
import { PlayerStandOuts, PlayerStandOutsFallback } from "@/features/player-research/PlayerStandOuts";

type Props = PageProps<"/[league]/players/[playerId]">;

/** Side panel for a player's research page. */
export default function PlayerStandOutsSlot({ params }: Props) {
  return (
    <Suspense fallback={<StandOutListSkeleton />}>
      <Research params={params} />
    </Suspense>
  );
}

async function Research({ params }: Pick<Props, "params">) {
  const { league, playerId } = await params;
  const research = await getPlayerResearch(league, playerId);
  // The page itself shows "not found" for an unknown player. The panel just has nothing to say.
  if (!research) return <StandOutList items={[]} />;

  // Stat, sample and filters live in the URL, which only the browser knows.
  // Until it is read, the fallback shows the stand-outs for the default view.
  // The spotlight sits outside that boundary and is keyed by the player, so its
  // intro plays once per player opened and not again when the URL state changes.
  return (
    <>
      <PlayerSpotlight key={research.player.id} player={research.player} team={research.team} />
      <Suspense fallback={<PlayerStandOutsFallback research={research} />}>
        <PlayerStandOuts key={research.player.id} research={research} />
      </Suspense>
    </>
  );
}
