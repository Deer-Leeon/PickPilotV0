import type {
  MatchupPosition,
  OppRankMetric,
  OppRanks,
  PlayerGameLogEntry,
  ShotTypeSplit,
  ShotZoneSplit,
} from "@/data/types";
import { RANK_PRESETS, type RankPreset } from "./matchup";

/**
 * Matchup filters for the player research page.
 *
 * Each filter is a rule over one field of a game log row. The prototype had
 * 14 of its 22 filters read the same placeholder field; here every filter has
 * its own data. To add a filter: add an id, a definition below and, if it
 * needs a new opponent rank, a metric in OppRankMetric.
 */

export type FilterCategory = "opp" | "zones" | "workload" | "splits";

export const FILTER_IDS = [
  "dvp",
  "pnr",
  "opp_pts",
  "opp_pace",
  "def_iso",
  "def_trans",
  "opp_fta",
  "opp_reb",
  "zone_atb3",
  "zone_ra",
  "zone_paint",
  "shot_pullup",
  "shot_cs",
  "zone_c3",
  "min_34",
  "fga_20",
  "usg_30",
  "h2h",
  "home_split",
  "away_split",
  "without",
  "rest_1plus",
] as const;

export type FilterId = (typeof FILTER_IDS)[number];

export type FilterRule =
  /** Opponent's league rank on a metric falls inside a range. */
  | { kind: "oppRank"; metric: OppRankMetric }
  /** A workload number reached a threshold. */
  | { kind: "minStat"; stat: "min" | "fga" | "usg"; threshold: number }
  | { kind: "headToHead" }
  | { kind: "home" }
  | { kind: "away" }
  | { kind: "withoutTeammate" }
  | { kind: "rested" };

export interface FilterDef {
  id: FilterId;
  category: FilterCategory;
  group: string;
  rule: FilterRule;
  /** Rank window applied when the filter is first switched on. */
  defaultMin: number;
  defaultMax: number;
}

const OPP = "Opponent Matchup Ranks";
const ZONES = "Half-Court Zone & Shot Defense";
const WORKLOAD = "Player Workload & Volume";
const SPLITS = "Schedule & Roster Splits";

function rank(id: FilterId, category: FilterCategory, group: string, metric: OppRankMetric, defaultMin: number): FilterDef {
  return { id, category, group, rule: { kind: "oppRank", metric }, defaultMin, defaultMax: 30 };
}

export const FILTER_DEFS: readonly FilterDef[] = [
  rank("dvp", "opp", OPP, "dvp", 18),
  rank("pnr", "opp", OPP, "pnr", 20),
  rank("opp_pts", "opp", OPP, "defRtg", 15),
  rank("opp_pace", "opp", OPP, "pace", 10),
  rank("def_iso", "opp", OPP, "iso", 16),
  rank("def_trans", "opp", OPP, "transition", 18),
  rank("opp_fta", "opp", OPP, "ftRate", 15),
  rank("opp_reb", "opp", OPP, "rebAllowed", 10),

  rank("zone_atb3", "zones", ZONES, "zoneAtb3", 18),
  rank("zone_ra", "zones", ZONES, "zoneRim", 15),
  rank("zone_paint", "zones", ZONES, "paintPts", 15),
  rank("shot_pullup", "zones", ZONES, "pullUp", 16),
  rank("shot_cs", "zones", ZONES, "catchShoot", 15),
  rank("zone_c3", "zones", ZONES, "corner3", 15),

  { id: "min_34", category: "workload", group: WORKLOAD, rule: { kind: "minStat", stat: "min", threshold: 34 }, defaultMin: 1, defaultMax: 30 },
  { id: "fga_20", category: "workload", group: WORKLOAD, rule: { kind: "minStat", stat: "fga", threshold: 20 }, defaultMin: 1, defaultMax: 30 },
  { id: "usg_30", category: "workload", group: WORKLOAD, rule: { kind: "minStat", stat: "usg", threshold: 30 }, defaultMin: 1, defaultMax: 30 },

  { id: "h2h", category: "splits", group: SPLITS, rule: { kind: "headToHead" }, defaultMin: 1, defaultMax: 30 },
  { id: "home_split", category: "splits", group: SPLITS, rule: { kind: "home" }, defaultMin: 1, defaultMax: 30 },
  { id: "away_split", category: "splits", group: SPLITS, rule: { kind: "away" }, defaultMin: 1, defaultMax: 30 },
  { id: "without", category: "splits", group: SPLITS, rule: { kind: "withoutTeammate" }, defaultMin: 1, defaultMax: 30 },
  { id: "rest_1plus", category: "splits", group: SPLITS, rule: { kind: "rested" }, defaultMin: 1, defaultMax: 30 },
];

const DEFS_BY_ID = new Map<string, FilterDef>(FILTER_DEFS.map((def) => [def.id, def]));

export function getFilterDef(id: string): FilterDef | undefined {
  return DEFS_BY_ID.get(id);
}

export function hasRankRange(def: FilterDef): boolean {
  return def.rule.kind === "oppRank";
}

/** A filter the user has switched on. min/max only matter for rank filters. */
export interface ActiveFilter {
  id: FilterId;
  min: number;
  max: number;
}

/** Everything about the player and tonight's game that filters depend on. */
export interface FilterContext {
  playerLastName: string;
  matchupPosition: MatchupPosition;
  opponentAbbr: string;
  opponentNickname: string;
  /** The player's home arena, for the home-split label. */
  homeVenueName: string | null;
  /** Tonight's opponent's ranks, shown on each rank filter. */
  upcomingOppRanks: OppRanks;
  /** A teammate ruled out tonight. Without one, the "without" filter is not offered. */
  teammateOut: { id: string; shortName: string; lastName: string; impactNote: string | null } | null;
  /** Full season log, used for the "10/12 Gms" badges. */
  seasonLog: readonly PlayerGameLogEntry[];
  seasonZones: readonly ShotZoneSplit[];
  seasonShotTypes: readonly ShotTypeSplit[];
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

export function matchesFilter(game: PlayerGameLogEntry, filter: ActiveFilter, ctx: FilterContext): boolean {
  const def = getFilterDef(filter.id);
  if (!def) return true;
  const rule = def.rule;
  switch (rule.kind) {
    case "oppRank": {
      const value = game.oppRanks[rule.metric];
      return value >= filter.min && value <= filter.max;
    }
    case "minStat":
      return game[rule.stat] >= rule.threshold;
    case "headToHead":
      return game.opponentAbbr === ctx.opponentAbbr;
    case "home":
      return game.isHome;
    case "away":
      return !game.isHome;
    case "withoutTeammate":
      return ctx.teammateOut !== null && game.teammatesOut.includes(ctx.teammateOut.id);
    case "rested":
      return game.restDays >= 1;
  }
}

/** Games that satisfy every active filter. */
export function applyFilters(
  games: readonly PlayerGameLogEntry[],
  filters: readonly ActiveFilter[],
  ctx: FilterContext,
): PlayerGameLogEntry[] {
  if (filters.length === 0) return [...games];
  return games.filter((game) => filters.every((filter) => matchesFilter(game, filter, ctx)));
}

// ---------------------------------------------------------------------------
// State transitions (pure, so the URL stays the single source of truth)
// ---------------------------------------------------------------------------

function clampRank(value: number): number {
  return Math.min(30, Math.max(1, Math.round(value)));
}

export function toggleFilter(filters: readonly ActiveFilter[], id: FilterId): ActiveFilter[] {
  if (filters.some((f) => f.id === id)) return filters.filter((f) => f.id !== id);
  const def = getFilterDef(id);
  if (!def) return [...filters];
  return [...filters, { id, min: def.defaultMin, max: def.defaultMax }];
}

export function removeFilter(filters: readonly ActiveFilter[], id: FilterId): ActiveFilter[] {
  return filters.filter((f) => f.id !== id);
}

/**
 * Sets the rank window of a filter, switching it on if needed.
 * The handles can meet but never cross: min is kept at least one below max.
 */
export function setFilterRange(filters: readonly ActiveFilter[], id: FilterId, min: number, max: number): ActiveFilter[] {
  const def = getFilterDef(id);
  if (!def || !hasRankRange(def)) return [...filters];
  let lo = clampRank(Math.min(min, max));
  let hi = clampRank(Math.max(min, max));
  if (lo === hi) {
    if (hi < 30) hi += 1;
    else lo -= 1;
  }
  const next: ActiveFilter = { id, min: lo, max: hi };
  return filters.some((f) => f.id === id) ? filters.map((f) => (f.id === id ? next : f)) : [...filters, next];
}

export function applyRankPreset(filters: readonly ActiveFilter[], id: FilterId, preset: RankPreset): ActiveFilter[] {
  const { min, max } = RANK_PRESETS[preset];
  return setFilterRange(filters, id, min, max);
}

// ---------------------------------------------------------------------------
// URL form: "dvp:18-30,home_split"
// ---------------------------------------------------------------------------

export function serializeFilters(filters: readonly ActiveFilter[]): string {
  return filters
    .map((filter) => {
      const def = getFilterDef(filter.id);
      return def && hasRankRange(def) ? `${filter.id}:${filter.min}-${filter.max}` : filter.id;
    })
    .join(",");
}

/** Unknown ids and malformed ranges are dropped rather than raising. */
export function parseFilters(raw: string): ActiveFilter[] {
  const result: ActiveFilter[] = [];
  for (const token of raw.split(",")) {
    const [id, range] = token.trim().split(":");
    const def = getFilterDef(id);
    if (!def || result.some((f) => f.id === def.id)) continue;
    let min = def.defaultMin;
    let max = def.defaultMax;
    if (range && hasRankRange(def)) {
      const match = /^(\d{1,2})-(\d{1,2})$/.exec(range);
      if (match) {
        min = clampRank(Number(match[1]));
        max = clampRank(Number(match[2]));
        if (min > max) [min, max] = [max, min];
        if (min === max) {
          if (max < 30) max += 1;
          else min -= 1;
        }
      }
    }
    result.push({ id: def.id, min, max });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Catalog: definitions resolved into labels for one player and game
// ---------------------------------------------------------------------------

export interface FilterCatalogItem {
  id: FilterId;
  category: FilterCategory;
  group: string;
  name: string;
  /** Compact name for the active-filter chips. */
  shortName: string;
  /** Right-hand badge: tonight's opponent rank, or how many games qualify. */
  badge: string;
  /** Tonight's opponent's rank on the filter's metric, for colouring the badge. Null for non-rank filters. */
  oppRank: number | null;
  description: string;
  hasRange: boolean;
  defaultMin: number;
  defaultMax: number;
}

const POSITION_PLURAL: Record<MatchupPosition, string> = {
  PG: "Point Guards",
  SG: "Shooting Guards",
  SF: "Small Forwards",
  PF: "Power Forwards",
  C: "Centers",
};

function share(splits: readonly { share: number }[], pick: (index: number) => boolean): number {
  return splits.reduce((sum, split, index) => (pick(index) ? sum + split.share : sum), 0);
}

function plural(count: number): string {
  return `${count} Gm${count === 1 ? "" : "s"}`;
}

export function buildFilterCatalog(ctx: FilterContext): FilterCatalogItem[] {
  const { playerLastName: who, opponentAbbr: opp, seasonLog } = ctx;
  const total = seasonLog.length;
  const count = (id: FilterId) => {
    const def = getFilterDef(id)!;
    const filter = { id, min: def.defaultMin, max: def.defaultMax };
    return seasonLog.filter((game) => matchesFilter(game, filter, ctx)).length;
  };
  const oppRank = (metric: OppRankMetric) => `${opp} #${ctx.upcomingOppRanks[metric]}`;
  const zoneShare = (zone: string) => share(ctx.seasonZones, (i) => ctx.seasonZones[i].zone === zone);
  const typeShare = (type: string) => share(ctx.seasonShotTypes, (i) => ctx.seasonShotTypes[i].type === type);
  const cornerShare = zoneShare("lc3") + zoneShare("rc3");

  const text: Record<FilterId, { name: string; shortName: string; badge: string; description: string } | null> = {
    dvp: {
      name: `Def vs Position (${ctx.matchupPosition})`,
      shortName: `Def vs ${ctx.matchupPosition}`,
      badge: oppRank("dvp"),
      description: `Opponent points allowed to ${POSITION_PLURAL[ctx.matchupPosition]}`,
    },
    pnr: {
      name: "Def vs PnR Ball Handler",
      shortName: "PnR Def",
      badge: oppRank("pnr"),
      description: "Pick-and-roll ball handler defense rank",
    },
    opp_pts: {
      name: "Opp Def Rating (DefRtg)",
      shortName: "Opp DefRtg",
      badge: oppRank("defRtg"),
      description: "Overall team defensive efficiency rank",
    },
    opp_pace: {
      name: "Opponent Pace Rank",
      shortName: "Opp Pace",
      badge: oppRank("pace"),
      description: "Possessions per 48 minutes",
    },
    def_iso: {
      name: "Def vs Isolation",
      shortName: "Iso Def",
      badge: oppRank("iso"),
      description: "Points per possession allowed in isolation",
    },
    def_trans: {
      name: "Def vs Transition",
      shortName: "Transition Def",
      badge: oppRank("transition"),
      description: "Fast-break and early offense defense rank",
    },
    opp_fta: {
      name: "Opp Free Throw Rate Allowed",
      shortName: "Opp FT Rate",
      badge: oppRank("ftRate"),
      description: "Opponent foul and free-throw frequency rank",
    },
    opp_reb: {
      name: "Opp Rebounds Allowed",
      shortName: "Opp Reb Rank",
      badge: oppRank("rebAllowed"),
      description: "Total rebounds allowed per game",
    },
    zone_atb3: {
      name: "Def vs Above Break 3",
      shortName: "Above Break 3",
      badge: oppRank("zoneAtb3"),
      description: `${zoneShare("atb3")}% of ${who} shots come from above the break`,
    },
    zone_ra: {
      name: "Def vs Restricted Area (Rim)",
      shortName: "Rim Def",
      badge: oppRank("zoneRim"),
      description: `${zoneShare("rim")}% of ${who} shots come at the rim`,
    },
    zone_paint: {
      name: "Opp Paint Points Allowed",
      shortName: "Paint Def",
      badge: oppRank("paintPts"),
      description: "Points in the paint allowed per game",
    },
    shot_pullup: {
      name: "Def vs Pull-Up Jumpers",
      shortName: "Pull-Up Def",
      badge: oppRank("pullUp"),
      description: `${typeShare("pullUp")}% of ${who} shots are pull-up jumpers`,
    },
    shot_cs: {
      name: "Def vs Catch & Shoot",
      shortName: "Catch & Shoot",
      badge: oppRank("catchShoot"),
      description: `${typeShare("catchShoot")}% of ${who} shots are catch-and-shoot`,
    },
    zone_c3: {
      name: "Def vs Corner Threes",
      shortName: "Corner 3 Def",
      badge: oppRank("corner3"),
      description: `${cornerShare}% of ${who} shots come from the corners`,
    },
    min_34: {
      name: "34+ Minutes Played",
      shortName: "34+ MIN",
      badge: `${count("min_34")}/${total} Gms`,
      description: "Excludes early blowout or foul-trouble games",
    },
    fga_20: {
      name: "20+ Field Goal Attempts",
      shortName: "20+ FGA",
      badge: `${count("fga_20")}/${total} Gms`,
      description: "High shot-volume games only",
    },
    usg_30: {
      name: "30%+ Usage Rate",
      shortName: "30%+ USG",
      badge: `${count("usg_30")}/${total} Gms`,
      description: `Games where ${who} commands 30%+ usage`,
    },
    h2h: {
      name: `Head-to-Head vs ${ctx.opponentNickname}`,
      shortName: `H2H vs ${opp}`,
      badge: plural(count("h2h")),
      description: `Direct matchups against ${ctx.opponentNickname} this season`,
    },
    home_split: {
      name: ctx.homeVenueName ? `Home Games Only (${ctx.homeVenueName})` : "Home Games Only",
      shortName: "Home Only",
      badge: plural(count("home_split")),
      description: ctx.homeVenueName ? `Games played at ${ctx.homeVenueName}` : "Games played at home",
    },
    away_split: {
      name: "Road Games Only (Away)",
      shortName: "Away Only",
      badge: plural(count("away_split")),
      description: "Games played on the road",
    },
    without: ctx.teammateOut
      ? {
          name: `Without ${ctx.teammateOut.shortName}`,
          shortName: `No ${ctx.teammateOut.lastName}`,
          badge: `${count("without")}/${total} Gms`,
          description: ctx.teammateOut.impactNote
            ? `${ctx.teammateOut.lastName} is OUT tonight (${ctx.teammateOut.impactNote})`
            : `${ctx.teammateOut.lastName} is OUT tonight`,
        }
      : null,
    rest_1plus: {
      name: "1+ Days Rest (Non-B2B)",
      shortName: "1+ Days Rest",
      badge: `${count("rest_1plus")}/${total} Gms`,
      description: "Excludes the second night of back-to-backs",
    },
  };

  const items: FilterCatalogItem[] = [];
  for (const def of FILTER_DEFS) {
    const labels = text[def.id];
    if (!labels) continue;
    items.push({
      id: def.id,
      category: def.category,
      group: def.group,
      hasRange: hasRankRange(def),
      oppRank: def.rule.kind === "oppRank" ? ctx.upcomingOppRanks[def.rule.metric] : null,
      defaultMin: def.defaultMin,
      defaultMax: def.defaultMax,
      ...labels,
    });
  }
  return items;
}

export const FILTER_CATEGORY_TABS: readonly { id: FilterCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "opp", label: "Matchup" },
  { id: "zones", label: "Zones" },
  { id: "workload", label: "Volume" },
  { id: "splits", label: "Splits" },
];

/** Catalog items matching a search string and category, grouped in catalog order. */
export function groupCatalog(
  catalog: readonly FilterCatalogItem[],
  query: string,
  category: FilterCategory | "all",
): { name: string; items: FilterCatalogItem[] }[] {
  const needle = query.trim().toLowerCase();
  const groups: { name: string; items: FilterCatalogItem[] }[] = [];
  for (const item of catalog) {
    if (category !== "all" && item.category !== category) continue;
    if (needle && !item.name.toLowerCase().includes(needle) && !item.shortName.toLowerCase().includes(needle)) continue;
    let group = groups.find((g) => g.name === item.group);
    if (!group) {
      group = { name: item.group, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}
