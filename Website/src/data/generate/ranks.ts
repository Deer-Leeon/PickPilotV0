import type { MatchupPosition, OppRanks, StatWindow, TeamProfile, TeamStatKey, TeamWindowProfile } from "@/data/types";
import { clamp, createRng } from "./rng";

/**
 * League-wide rankings.
 *
 * Each metric is a 1-30 ordering of all teams: pinned values come first and
 * the remaining ranks are dealt out with a seed, so no two teams share a rank.
 *
 * The mock keeps one ranking per metric for the whole season. The real
 * database stores a snapshot per date so a filter on a past game uses the
 * rank as it stood that day (see team_rank_snapshot in docs/DATABASE.md).
 */

export type RankTable = Record<string, number>;
export type RankTables = Record<string, RankTable>;

/** Ranks of each team's defense against a kind of offense. 1 is toughest. */
const DEFENSE_METRICS = [
  "dvp_PG",
  "dvp_SG",
  "dvp_SF",
  "dvp_PF",
  "dvp_C",
  "pnr",
  "defRtg",
  "pace",
  "iso",
  "transition",
  "ftRate",
  "rebAllowed",
  "zoneAtb3",
  "zoneRim",
  "zoneMid",
  "zoneLc3",
  "zoneRc3",
  "zonePaint",
  "paintPts",
  "corner3",
  "pullUp",
  "catchShoot",
  "spotUp",
  "postUp",
] as const;

/** Ranks of each team's own production. 1 is best. */
const TEAM_METRICS = [
  "offRtg",
  "threesMade",
  "rebounding",
  "ballSecurity",
  "offPts",
  "offFgPct",
  "offFg3Pct",
  "offAst",
  "defPts",
  "defFgPct",
  "defFg3Pct",
  "defAst",
  "defTov",
] as const;

export function buildRankTable(metric: string, teams: readonly string[], pins: Record<string, number> = {}): RankTable {
  const taken = new Set(Object.values(pins));
  const freeRanks = teams.map((_, index) => index + 1).filter((rank) => !taken.has(rank));
  const dealt = createRng(`rank:${metric}`).shuffle(freeRanks);
  const table: RankTable = {};
  let next = 0;
  for (const team of teams) {
    table[team] = pins[team] ?? dealt[next++];
  }
  return table;
}

export function buildRankTables(teams: readonly string[], pins: Record<string, Record<string, number>>): RankTables {
  const tables: RankTables = {};
  for (const metric of [...DEFENSE_METRICS, ...TEAM_METRICS]) {
    tables[metric] = buildRankTable(metric, teams, pins[metric]);
  }
  return tables;
}

/** The opponent ranks a matchup filter can read, for one opponent and one player position. */
export function oppRanksFor(tables: RankTables, opponentAbbr: string, position: MatchupPosition): OppRanks {
  const rank = (metric: string) => tables[metric][opponentAbbr];
  return {
    dvp: rank(`dvp_${position}`),
    pnr: rank("pnr"),
    defRtg: rank("defRtg"),
    pace: rank("pace"),
    iso: rank("iso"),
    transition: rank("transition"),
    ftRate: rank("ftRate"),
    rebAllowed: rank("rebAllowed"),
    zoneAtb3: rank("zoneAtb3"),
    zoneRim: rank("zoneRim"),
    paintPts: rank("paintPts"),
    pullUp: rank("pullUp"),
    catchShoot: rank("catchShoot"),
    corner3: rank("corner3"),
  };
}

// ---------------------------------------------------------------------------
// Team comparison profiles
// ---------------------------------------------------------------------------

/** Turns a league rank into a believable per-game value. Rank 1 is always the best number. */
const VALUE_FROM_RANK: Record<"offense" | "defense", Record<TeamStatKey, (rank: number) => number>> = {
  offense: {
    pts: (r) => 122.0 - (r - 1) * 0.52,
    fgPct: (r) => 50.6 - (r - 1) * 0.21,
    fg3Pct: (r) => 40.2 - (r - 1) * 0.22,
    reb: (r) => 47.5 - (r - 1) * 0.24,
    ast: (r) => 30.5 - (r - 1) * 0.25,
    tov: (r) => 11.0 + (r - 1) * 0.16,
    pace: (r) => 103.5 - (r - 1) * 0.24,
  },
  defense: {
    pts: (r) => 105.5 + (r - 1) * 0.5,
    fgPct: (r) => 43.8 + (r - 1) * 0.2,
    fg3Pct: (r) => 33.2 + (r - 1) * 0.2,
    reb: (r) => 40.5 + (r - 1) * 0.24,
    ast: (r) => 22.5 + (r - 1) * 0.25,
    tov: (r) => 16.8 - (r - 1) * 0.16,
    pace: (r) => 103.5 - (r - 1) * 0.24,
  },
};

const OFFENSE_SOURCE: Record<TeamStatKey, string> = {
  pts: "offPts",
  fgPct: "offFgPct",
  fg3Pct: "offFg3Pct",
  reb: "rebounding",
  ast: "offAst",
  tov: "ballSecurity",
  pace: "pace",
};

const DEFENSE_SOURCE: Record<TeamStatKey, string> = {
  pts: "defPts",
  fgPct: "defFgPct",
  fg3Pct: "defFg3Pct",
  reb: "rebAllowed",
  ast: "defAst",
  tov: "defTov",
  pace: "pace",
};

/** Recent-form windows wander from the season rank: a little over five games, more over three. */
const WINDOW_SPREAD: Record<StatWindow, number> = { season: 0, l5: 3, l3: 4.5 };

const round1 = (value: number) => Math.round(value * 10) / 10;

function buildWindowProfile(tables: RankTables, abbr: string, window: StatWindow): TeamWindowProfile {
  const rng = createRng(`profile:${abbr}:${window}`);
  const spread = WINDOW_SPREAD[window];
  const cache = new Map<string, number>();
  // One rank per underlying metric, so the radar and the stat bars agree.
  const rank = (metric: string): number => {
    const cached = cache.get(metric);
    if (cached !== undefined) return cached;
    const season = tables[metric][abbr];
    const value = spread === 0 ? season : clamp(Math.round(rng.normal(season, spread)), 1, 30);
    cache.set(metric, value);
    return value;
  };

  const side = (kind: "offense" | "defense", source: Record<TeamStatKey, string>) => {
    const entries = (Object.keys(source) as TeamStatKey[]).map((key) => {
      const r = rank(source[key]);
      return [key, { value: round1(VALUE_FROM_RANK[kind][key](r)), rank: r }] as const;
    });
    return Object.fromEntries(entries) as TeamWindowProfile["offense"];
  };

  return {
    radar: {
      off: rank("offRtg"),
      def: rank("defRtg"),
      pace: rank("pace"),
      threes: rank("threesMade"),
      reb: rank("rebounding"),
      tov: rank("ballSecurity"),
    },
    offense: side("offense", OFFENSE_SOURCE),
    defense: side("defense", DEFENSE_SOURCE),
  };
}

export function buildTeamProfile(tables: RankTables, abbr: string): TeamProfile {
  return {
    season: buildWindowProfile(tables, abbr, "season"),
    l5: buildWindowProfile(tables, abbr, "l5"),
    l3: buildWindowProfile(tables, abbr, "l3"),
  };
}
