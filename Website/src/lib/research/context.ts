import type { PlayerResearch } from "@/data/types";
import { lastName, shortName } from "@/lib/format";
import type { FilterContext } from "./filters";

/** Everything the filters need to know about a player and tonight's game. */
export function buildFilterContext(research: PlayerResearch): FilterContext {
  const { player, team, opponent, upcoming, teammateOut, gameLog, shotProfile } = research;
  return {
    playerLastName: lastName(player.name),
    matchupPosition: player.matchupPosition,
    opponentAbbr: opponent.abbr,
    opponentNickname: opponent.nickname,
    homeVenueName: team.venue?.name ?? null,
    upcomingOppRanks: upcoming.oppRanks,
    teammateOut: teammateOut
      ? {
          id: teammateOut.id,
          shortName: shortName(teammateOut.playerName),
          lastName: lastName(teammateOut.playerName),
          impactNote: teammateOut.impactNote,
        }
      : null,
    seasonLog: gameLog,
    seasonZones: shotProfile.zones.season,
    seasonShotTypes: shotProfile.shotTypes.season,
  };
}
