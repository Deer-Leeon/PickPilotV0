import type { TeamStatKey } from "@/data/types";

/**
 * What a stand-out points at on the page.
 *
 * A component marks the element that shows something with one of these keys
 * (`{...flashKey(standOutTargets.player(id))}`), and a stand-out lists the keys
 * it is about. Clicking the stand-out lights up the first one that is on
 * screen. Both sides build their keys here, so they cannot drift apart.
 */

/** Whose offense a stat-bar row follows: the bars show one team's offense against the other's defense. */
export type OffenseSide = "away" | "home";

const TEAM_STAT = "stat";

export const standOutTargets = {
  /** A player's row or tile. */
  player: (playerId: string) => `player:${playerId}`,
  /** A team's row or column: the fallback for a player the page does not list on their own. */
  team: (teamId: string) => `team:${teamId}`,
  /** A row of an injury report. */
  injury: (entryId: string) => `injury:${entryId}`,
  /** One offer on the game lines tab. */
  offer: (offerId: string) => `offer:${offerId}`,
  /** A row of the leaders board. */
  leader: (rowId: string) => `leader:${rowId}`,
  /** A stat-bar row, in the view that follows the given side's offense. */
  teamStat: (offense: OffenseSide, key: TeamStatKey) => `${TEAM_STAT}:${offense}:${key}`,
  /** The team comparison card as a whole. */
  comparison: "comparison",
  /** One filter in the player page's filter drawer, which shows tonight's opponent rank beside it. */
  filter: (filterId: string) => `filter:${filterId}`,
  /** The button that opens the filter drawer. */
  filtersButton: "filters-button",
  /** The hit rate at the head of the player page's stat strip. */
  hitRate: "hit-rate",
  /** The prop being researched, with its prices. */
  prop: "prop",
  /** The hit-rate chart. */
  chart: "chart",
  /** Tonight's game at the end of the chart. */
  tonight: "tonight",
  /** The summary of how similar players fared. */
  similar: "similar",
} as const;

/** The offense a stat-bar key belongs to, or null when the key is not a stat-bar row. */
export function teamStatOffense(target: string): OffenseSide | null {
  const [kind, offense] = target.split(":");
  return kind === TEAM_STAT && (offense === "away" || offense === "home") ? offense : null;
}

/** Whether the key is a filter in the filter drawer. */
export function isFilterTarget(target: string): boolean {
  return target.startsWith("filter:");
}

/** Spread onto the element that shows this key: `{...flashKey(standOutTargets.player(id))}`. */
export function flashKey(key: string) {
  return { "data-flash": key } as const;
}
