import type { RadarAxis, StatWindow, TeamStatKey, TeamWindowProfile } from "@/data/types";

/**
 * Opponent defensive ranks run 1 (toughest) to 30 (softest).
 * From this rank on, a matchup is shown as favourable for the player.
 */
export const SOFT_RANK_THRESHOLD = 20;

export function isSoftMatchup(rank: number): boolean {
  return rank >= SOFT_RANK_THRESHOLD;
}

/** The mirror of the soft threshold: up to this rank, the opponent is among the toughest. */
export const TOUGH_RANK_THRESHOLD = 11;

export function isToughMatchup(rank: number): boolean {
  return rank <= TOUGH_RANK_THRESHOLD;
}

export const RANK_PRESETS = {
  tough: { min: 1, max: 12 },
  all: { min: 1, max: 30 },
  soft: { min: 18, max: 30 },
} as const;

export type RankPreset = keyof typeof RANK_PRESETS;

export const STAT_WINDOWS: readonly StatWindow[] = ["l3", "l5", "season"];

// --- Radar -----------------------------------------------------------------

export const RADAR_AXES: readonly { id: RadarAxis; label: string }[] = [
  { id: "off", label: "OFF" },
  { id: "def", label: "DEF" },
  { id: "pace", label: "PACE" },
  { id: "threes", label: "3PM" },
  { id: "reb", label: "REB" },
  { id: "tov", label: "TOV" },
];

/**
 * Radar scale: the outer ring is rank 1 and every rank below it steps 2.5%
 * toward the centre, so rank 30 still sits a quarter of the way out.
 */
export function rankToRadarScore(rank: number): number {
  return 1 - (rank - 1) * 0.025;
}

// --- Stat bars -------------------------------------------------------------

export type MatchupDirection = "awayOffense" | "homeOffense";

export interface StatBarRow {
  key: TeamStatKey;
  label: string;
  away: { display: string; rank: number; barPct: number };
  home: { display: string; rank: number; barPct: number };
  /** Which side holds the better rank. Pace is context, not an advantage. */
  advantage: "away" | "home" | "none";
}

/** The team stats in display order, with how each is labelled and whether it is a percentage. */
export const STAT_BAR_ROWS: readonly { key: TeamStatKey; label: string; percent: boolean }[] = [
  { key: "pts", label: "Points", percent: false },
  { key: "fgPct", label: "Field-Goal %", percent: true },
  { key: "fg3Pct", label: "Three-Point %", percent: true },
  { key: "reb", label: "Rebounds", percent: false },
  { key: "ast", label: "Assists", percent: false },
  { key: "tov", label: "Turnovers", percent: false },
  { key: "pace", label: "Pace", percent: false },
];

/** "118.2" or "47.3%" */
export function formatTeamStat(value: number, percent: boolean): string {
  return percent ? `${value.toFixed(1)}%` : value.toFixed(1);
}

function rankToBarPct(rank: number): number {
  return Math.round(((31 - rank) / 30) * 100);
}

/**
 * Rows for the stat-bar view: one team's offense against the other's defense.
 * The better league rank takes the advantage.
 */
export function buildStatBarRows(
  away: TeamWindowProfile,
  home: TeamWindowProfile,
  direction: MatchupDirection,
): StatBarRow[] {
  return STAT_BAR_ROWS.map(({ key, label, percent }) => {
    const awayStat = direction === "awayOffense" ? away.offense[key] : away.defense[key];
    const homeStat = direction === "awayOffense" ? home.defense[key] : home.offense[key];
    const display = (value: number) => formatTeamStat(value, percent);
    let advantage: StatBarRow["advantage"] = "none";
    if (key !== "pace" && awayStat.rank !== homeStat.rank) {
      advantage = awayStat.rank < homeStat.rank ? "away" : "home";
    }
    return {
      key,
      label,
      away: { display: display(awayStat.value), rank: awayStat.rank, barPct: rankToBarPct(awayStat.rank) },
      home: { display: display(homeStat.value), rank: homeStat.rank, barPct: rankToBarPct(homeStat.rank) },
      advantage,
    };
  });
}
