import type { StatId } from "@/data/types";

/** The counting stats a box score row must carry to derive every stat family. */
export interface BoxScoreStats {
  pts: number;
  reb: number;
  ast: number;
  threes: number;
}

export interface StatFamily {
  id: StatId;
  /** Tab label: "Points", "Pts+Reb". */
  label: string;
  /** Compact label used in lines and chips: "PTS", "R+A". */
  shortLabel: string;
  /** Box score fields that are summed to get the value. Empty for derived stats. */
  components: (keyof BoxScoreStats)[];
}

/** Tab order follows the prototype. */
export const STAT_IDS = ["PTS", "AST", "REB", "3PM", "PA", "PR", "RA", "PRA", "DD"] as const satisfies readonly StatId[];

export const STAT_FAMILIES: Record<StatId, StatFamily> = {
  PTS: { id: "PTS", label: "Points", shortLabel: "PTS", components: ["pts"] },
  AST: { id: "AST", label: "Assists", shortLabel: "AST", components: ["ast"] },
  REB: { id: "REB", label: "Rebounds", shortLabel: "REB", components: ["reb"] },
  "3PM": { id: "3PM", label: "Threes", shortLabel: "3PM", components: ["threes"] },
  PA: { id: "PA", label: "Pts+Ast", shortLabel: "P+A", components: ["pts", "ast"] },
  PR: { id: "PR", label: "Pts+Reb", shortLabel: "P+R", components: ["pts", "reb"] },
  RA: { id: "RA", label: "Reb+Ast", shortLabel: "R+A", components: ["reb", "ast"] },
  PRA: { id: "PRA", label: "Pts+Reb+Ast", shortLabel: "PRA", components: ["pts", "reb", "ast"] },
  DD: { id: "DD", label: "Double-Double", shortLabel: "DD", components: [] },
};

export function isStatId(value: string): value is StatId {
  return (STAT_IDS as readonly string[]).includes(value);
}

/** True when at least two of points, rebounds and assists reached ten. */
export function isDoubleDouble(game: BoxScoreStats): boolean {
  return [game.pts, game.reb, game.ast].filter((v) => v >= 10).length >= 2;
}

/**
 * The value a game produced for a stat family.
 * Double-double is 1 or 0 so it can be compared to a 0.5 line like any other prop.
 */
export function getStatValue(game: BoxScoreStats, stat: StatId): number {
  if (stat === "DD") return isDoubleDouble(game) ? 1 : 0;
  return STAT_FAMILIES[stat].components.reduce((sum, key) => sum + game[key], 0);
}

/** "28.5 PTS", "14.5 R+A" */
export function formatPropLine(line: number, stat: StatId): string {
  return `${line} ${STAT_FAMILIES[stat].shortLabel}`;
}

/** "Jayson Tatum Over 28.5 PTS" */
export function formatPropTitle(playerName: string, side: "Over" | "Under", line: number, stat: StatId): string {
  return `${playerName} ${side} ${formatPropLine(line, stat)}`;
}
