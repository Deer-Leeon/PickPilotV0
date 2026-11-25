import type { StatId } from "@/data/types";

/**
 * Every in-app URL is built here, so a route can be renamed in one place.
 */

export const DEFAULT_LEAGUE = "nba";

export const GAME_SECTIONS = ["matchup", "players", "lines", "injuries"] as const;
export type GameSection = (typeof GAME_SECTIONS)[number];

export const GAME_SECTION_LABELS: Record<GameSection, string> = {
  matchup: "Matchup",
  players: "Players",
  lines: "Game lines",
  injuries: "Injuries",
};

export const routes = {
  games: (league: string, date?: string) => (date ? `/${league}/games?date=${date}` : `/${league}/games`),
  gamesBroadcast: (league: string) => `/${league}/games/concepts/broadcast`,
  game: (league: string, gameId: string, section: GameSection = "matchup") => `/${league}/games/${gameId}/${section}`,
  players: (league: string) => `/${league}/players`,
  player: (league: string, playerId: string, options?: { stat?: StatId }) =>
    options?.stat
      ? `/${league}/players/${playerId}?stat=${encodeURIComponent(options.stat)}`
      : `/${league}/players/${playerId}`,
  leaders: (league: string) => `/${league}/leaders`,
};
