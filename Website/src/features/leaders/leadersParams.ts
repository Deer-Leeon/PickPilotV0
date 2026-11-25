import { parseAsStringLiteral } from "nuqs";
import { LEADER_FILTERS } from "@/lib/research/leaders";

/**
 * URL state for the Leaders page. The default is left out of the URL.
 *
 *   ?cat=REB   category (ALL | PTS | REB | AST | 3PM | COMBO | TEAM)
 */
export const leaderParsers = {
  cat: parseAsStringLiteral(LEADER_FILTERS).withDefault("ALL"),
};
