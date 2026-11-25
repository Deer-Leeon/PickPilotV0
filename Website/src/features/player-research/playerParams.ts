import { createParser, parseAsStringLiteral } from "nuqs";
import { TREND_METRICS } from "@/lib/research/chart";
import { parseFilters, serializeFilters, type ActiveFilter } from "@/lib/research/filters";
import { SAMPLE_WINDOWS } from "@/lib/research/sample";
import { STAT_IDS } from "@/lib/research/stats";

/**
 * URL state for the player research page. Defaults are left out of the URL,
 * so a shared link reproduces exactly what the sender was looking at:
 *
 *   ?stat=REB                    stat family (defaults to the player's featured prop)
 *   &sample=l10                  l5 | l10 | season
 *   &filters=dvp:18-30,home_split   active filters, rank filters with their window
 *   &trend=min                   trend line: oppDef | pnr | min | fga | none
 *   &tab=similar                 lower module: zones | shots | plays | similar | all
 *   &panel=filters               filter drawer open
 */
export const LOWER_TABS = ["zones", "shots", "plays", "similar", "all"] as const;
export type LowerTab = (typeof LOWER_TABS)[number];

const parseAsFilters = createParser<ActiveFilter[]>({
  parse: (value) => parseFilters(value),
  serialize: (filters) => serializeFilters(filters),
  eq: (a, b) => serializeFilters(a) === serializeFilters(b),
});

export const playerParsers = {
  stat: parseAsStringLiteral(STAT_IDS),
  sample: parseAsStringLiteral(SAMPLE_WINDOWS).withDefault("season"),
  filters: parseAsFilters.withDefault([]),
  trend: parseAsStringLiteral(TREND_METRICS).withDefault("oppDef"),
  tab: parseAsStringLiteral(LOWER_TABS).withDefault("zones"),
  panel: parseAsStringLiteral(["filters"] as const),
};
