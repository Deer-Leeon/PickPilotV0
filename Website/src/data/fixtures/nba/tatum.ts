import type { BookId, PlayTypeId, ShotTypeId, ShotZoneId, StatId } from "@/data/types";

/**
 * Jayson Tatum is the prototype's featured player. His numbers are kept
 * exactly as designed so his page can be compared side by side with
 * pickpilot_nba_research_ui.html. Every other player is generated.
 */

export const TATUM_ID = "jayson-tatum";

export interface PinnedGame {
  date: string;
  opp: string;
  isHome: boolean;
  rest: number;
  pts: number;
  ast: number;
  reb: number;
  threes: number;
  min: number;
  usg: number;
  /** [made, attempted] */
  fg: [number, number];
  fg3: [number, number];
  ft: [number, number];
  pf: number;
}

/** Boston's first 12 games. Every Celtics player shares this schedule. */
export const TATUM_GAMES: PinnedGame[] = [
  { date: "2026-10-22", opp: "NYK", isHome: true, rest: 2, pts: 37, ast: 10, reb: 4, threes: 8, min: 35, usg: 31.5, fg: [14, 18], fg3: [8, 11], ft: [1, 2], pf: 1 },
  { date: "2026-10-24", opp: "WAS", isHome: false, rest: 1, pts: 25, ast: 6, reb: 11, threes: 3, min: 29, usg: 30.1, fg: [9, 20], fg3: [3, 11], ft: [4, 6], pf: 2 },
  { date: "2026-10-26", opp: "DET", isHome: false, rest: 1, pts: 37, ast: 2, reb: 4, threes: 6, min: 38, usg: 34.2, fg: [12, 26], fg3: [6, 13], ft: [7, 9], pf: 2 },
  { date: "2026-10-28", opp: "MIL", isHome: true, rest: 1, pts: 15, ast: 4, reb: 8, threes: 1, min: 36, usg: 26.4, fg: [5, 16], fg3: [1, 7], ft: [4, 4], pf: 3 },
  { date: "2026-10-30", opp: "IND", isHome: false, rest: 1, pts: 37, ast: 4, reb: 8, threes: 4, min: 41, usg: 33.8, fg: [12, 25], fg3: [4, 11], ft: [9, 11], pf: 4 },
  { date: "2026-11-01", opp: "CHA", isHome: false, rest: 1, pts: 32, ast: 3, reb: 11, threes: 3, min: 35, usg: 31.9, fg: [9, 21], fg3: [3, 9], ft: [11, 13], pf: 2 },
  { date: "2026-11-02", opp: "CHA", isHome: false, rest: 0, pts: 29, ast: 3, reb: 7, threes: 1, min: 34, usg: 30.4, fg: [8, 19], fg3: [1, 9], ft: [12, 14], pf: 1 },
  { date: "2026-11-04", opp: "ATL", isHome: false, rest: 1, pts: 28, ast: 9, reb: 6, threes: 5, min: 31, usg: 31.0, fg: [10, 21], fg3: [5, 11], ft: [3, 4], pf: 2 },
  { date: "2026-11-06", opp: "GSW", isHome: true, rest: 1, pts: 32, ast: 2, reb: 4, threes: 5, min: 37, usg: 31.2, fg: [10, 20], fg3: [5, 10], ft: [7, 9], pf: 2 },
  { date: "2026-11-08", opp: "BKN", isHome: true, rest: 1, pts: 33, ast: 6, reb: 9, threes: 5, min: 42, usg: 32.6, fg: [11, 24], fg3: [5, 13], ft: [6, 7], pf: 2 },
  { date: "2026-11-10", opp: "MIL", isHome: false, rest: 1, pts: 31, ast: 6, reb: 12, threes: 4, min: 40, usg: 31.8, fg: [10, 21], fg3: [4, 12], ft: [7, 8], pf: 3 },
  { date: "2026-11-12", opp: "ATL", isHome: true, rest: 1, pts: 20, ast: 8, reb: 6, threes: 2, min: 37, usg: 28.5, fg: [6, 19], fg3: [2, 9], ft: [6, 6], pf: 2 },
];

/** Tonight's projection for the dashed bar on the chart. */
export const TATUM_UPCOMING = { projectedMin: 36.5, projectedFga: 21.5 };

export const TATUM_PROPS: { stat: StatId; line: number; over: number; overBook: BookId; under: number; underBook: BookId }[] = [
  { stat: "PTS", line: 28.5, over: -106, overBook: "FD", under: -114, underBook: "DK" },
  { stat: "AST", line: 5.5, over: -118, overBook: "DK", under: -102, underBook: "FD" },
  { stat: "REB", line: 8.5, over: -104, overBook: "MGM", under: -116, underBook: "DK" },
  { stat: "3PM", line: 3.5, over: 108, overBook: "FD", under: -132, underBook: "CZR" },
  { stat: "PA", line: 34.5, over: -108, overBook: "DK", under: -112, underBook: "FD" },
  { stat: "PR", line: 36.5, over: -110, overBook: "FD", under: -110, underBook: "MGM" },
  { stat: "RA", line: 13.5, over: -115, overBook: "CZR", under: -105, underBook: "PIN" },
  { stat: "PRA", line: 42.5, over: -106, overBook: "FD", under: -114, underBook: "DK" },
  { stat: "DD", line: 0.5, over: 135, overBook: "DK", under: -165, underBook: "FD" },
];

export const TATUM_ZONES: { zone: ShotZoneId; share: number; fgPct: number }[] = [
  { zone: "atb3", share: 39, fgPct: 38.4 },
  { zone: "rim", share: 28, fgPct: 68.2 },
  { zone: "mid", share: 12, fgPct: 44.1 },
  { zone: "lc3", share: 8, fgPct: 42.1 },
  { zone: "rc3", share: 7, fgPct: 41.2 },
  { zone: "paint", share: 6, fgPct: 43.5 },
];

export const TATUM_SHOT_TYPES: { type: ShotTypeId; share: number; fga: number; efficiencyPct: number; ppg: number }[] = [
  { type: "pullUp", share: 46, fga: 9.7, efficiencyPct: 54.2, ppg: 13.8 },
  { type: "rim", share: 28, fga: 5.9, efficiencyPct: 66.4, ppg: 8.2 },
  { type: "catchShoot", share: 26, fga: 5.5, efficiencyPct: 61.8, ppg: 8.2 },
];

export const TATUM_PLAY_TYPES: { type: PlayTypeId; share: number; ppg: number; ppp: number }[] = [
  { type: "pnrHandler", share: 29, ppg: 8.8, ppp: 1.14 },
  { type: "iso", share: 24, ppg: 7.3, ppp: 1.09 },
  { type: "transition", share: 19, ppg: 5.7, ppp: 1.28 },
  { type: "spotUp", share: 16, ppg: 4.8, ppp: 1.12 },
  { type: "postUp", share: 12, ppg: 3.6, ppp: 1.05 },
];

/** Forwards who recently faced the Knicks: their points line and what they scored. */
export const TATUM_COMPS: { date: string; playerName: string; teamAbbr: string; line: number; actual: number }[] = [
  { date: "2026-11-08", playerName: "Paolo Banchero", teamAbbr: "ORL", line: 24.5, actual: 31 },
  { date: "2026-11-04", playerName: "Franz Wagner", teamAbbr: "ORL", line: 21.5, actual: 26 },
  { date: "2026-11-01", playerName: "Jalen Johnson", teamAbbr: "ATL", line: 19.5, actual: 23 },
  { date: "2026-10-29", playerName: "Brandon Miller", teamAbbr: "CHA", line: 20.5, actual: 18 },
  { date: "2026-10-25", playerName: "Pascal Siakam", teamAbbr: "IND", line: 20.5, actual: 25 },
];
