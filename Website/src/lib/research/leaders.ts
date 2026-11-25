import type { LeaderCategory, LeaderRow } from "@/data/types";

/** Category filter on the leaders page. "ALL" mixes every category. */
export const LEADER_FILTERS = ["ALL", "PTS", "REB", "AST", "3PM", "COMBO", "TEAM"] as const;
export type LeaderFilter = (typeof LEADER_FILTERS)[number];

export const LEADER_FILTER_LABELS: Record<LeaderFilter, string> = {
  ALL: "All Props",
  PTS: "Points",
  REB: "Rebounds",
  AST: "Assists",
  "3PM": "Threes",
  COMBO: "Combos",
  TEAM: "Team Lines",
};

/** Rows shown per category. */
export const LEADERS_LIMIT = 12;
/** In the mixed view one player or team may hold at most this many rows, so the board is not one name repeated. */
export const MAX_ROWS_PER_NAME = 2;

export interface RankedLeader {
  rank: number;
  row: LeaderRow;
}

/**
 * The board for one category. Expects rows already sorted best first
 * (the repository sorts by hit rate, then sample size).
 */
export function selectLeaders(rows: readonly LeaderRow[], filter: LeaderFilter, limit = LEADERS_LIMIT): RankedLeader[] {
  const picked: LeaderRow[] = [];
  const perName = new Map<string, number>();

  for (const row of rows) {
    if (picked.length >= limit) break;
    if (filter === "ALL") {
      const key = `${row.kind}:${row.name}`;
      const count = perName.get(key) ?? 0;
      if (count >= MAX_ROWS_PER_NAME) continue;
      perName.set(key, count + 1);
    } else if (row.category !== (filter satisfies LeaderCategory)) {
      continue;
    }
    picked.push(row);
  }
  return picked.map((row, index) => ({ rank: index + 1, row }));
}
