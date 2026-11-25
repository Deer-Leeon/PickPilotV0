import { parseAsStringLiteral } from "nuqs";
import { STAT_WINDOWS } from "@/lib/research/matchup";

/**
 * URL state for the game pages. Defaults are left out of the URL, so a plain
 * link shows the season view and a shared link reproduces what the sender saw.
 *
 *   ?window=l5   stat window (l3 | l5 | season)
 *   ?view=bars   team comparison view (radar | bars)
 *   ?dir=home    which offense the stat bars follow (away | home)
 */
export const COMPARISON_VIEWS = ["radar", "bars"] as const;
export type ComparisonView = (typeof COMPARISON_VIEWS)[number];

export const OFFENSE_SIDES = ["away", "home"] as const;
export type OffenseSide = (typeof OFFENSE_SIDES)[number];

export const gameParsers = {
  window: parseAsStringLiteral(STAT_WINDOWS).withDefault("season"),
  view: parseAsStringLiteral(COMPARISON_VIEWS).withDefault("radar"),
  dir: parseAsStringLiteral(OFFENSE_SIDES).withDefault("away"),
};
