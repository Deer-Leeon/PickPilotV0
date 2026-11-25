import type { InjuryStatus, Position } from "@/data/types";

/**
 * The six games on the sample slate, with the main markets exactly as they
 * appear in the prototype. Tip times are UTC; the slate is the evening of
 * Friday 13 November 2026 in US Eastern time.
 */

export interface GameSeed {
  away: string;
  home: string;
  startsAt: string;
  network: string;
  awayRecord: [wins: number, losses: number];
  homeRecord: [wins: number, losses: number];
  /** line is the home team's spread: -4.5 means the home team is favoured by 4.5. */
  spread: { line: number; awayPrice: number; homePrice: number; best: "away" | "home" };
  moneyline: { awayPrice: number; homePrice: number; best: "away" | "home" };
  total: { line: number; overPrice: number; underPrice: number; best: "over" | "under" };
}

export const NBA_SLATE: GameSeed[] = [
  {
    away: "NYK",
    home: "BOS",
    startsAt: "2026-11-14T00:30:00Z",
    network: "TNT",
    awayRecord: [7, 4],
    // The prototype shows 9-2, but Tatum's log has 12 games. 9-3 keeps the two consistent.
    homeRecord: [9, 3],
    spread: { line: -4.5, awayPrice: -108, homePrice: -112, best: "away" },
    moneyline: { awayPrice: 164, homePrice: -192, best: "away" },
    total: { line: 224.5, overPrice: -110, underPrice: -105, best: "under" },
  },
  {
    away: "LAL",
    home: "MEM",
    startsAt: "2026-11-14T01:00:00Z",
    network: "NBA LP",
    awayRecord: [7, 4],
    homeRecord: [7, 5],
    spread: { line: 1.5, awayPrice: -110, homePrice: -104, best: "home" },
    moneyline: { awayPrice: -122, homePrice: 106, best: "away" },
    total: { line: 231.5, overPrice: -108, underPrice: -112, best: "over" },
  },
  {
    away: "CLE",
    home: "PHI",
    startsAt: "2026-11-14T00:30:00Z",
    network: "NBA LP",
    awayRecord: [11, 0],
    homeRecord: [3, 8],
    spread: { line: 7.5, awayPrice: -106, homePrice: -114, best: "away" },
    moneyline: { awayPrice: -295, homePrice: 245, best: "home" },
    total: { line: 219.5, overPrice: -110, underPrice: -108, best: "under" },
  },
  {
    away: "DAL",
    home: "GSW",
    startsAt: "2026-11-14T03:00:00Z",
    network: "TNT",
    awayRecord: [6, 5],
    homeRecord: [9, 2],
    spread: { line: -2.5, awayPrice: -105, homePrice: -115, best: "away" },
    moneyline: { awayPrice: 124, homePrice: -142, best: "away" },
    total: { line: 233.5, overPrice: -106, underPrice: -114, best: "over" },
  },
  {
    away: "MIN",
    home: "POR",
    startsAt: "2026-11-14T03:00:00Z",
    network: "NBA LP",
    awayRecord: [6, 5],
    homeRecord: [4, 8],
    spread: { line: 9.5, awayPrice: -108, homePrice: -112, best: "away" },
    moneyline: { awayPrice: -410, homePrice: 330, best: "home" },
    total: { line: 218.5, overPrice: -110, underPrice: -106, best: "under" },
  },
  {
    away: "PHX",
    home: "SAC",
    startsAt: "2026-11-14T03:30:00Z",
    network: "NBA LP",
    awayRecord: [8, 3],
    homeRecord: [7, 5],
    spread: { line: -3.5, awayPrice: -110, homePrice: -104, best: "home" },
    moneyline: { awayPrice: 138, homePrice: -158, best: "away" },
    total: { line: 229.5, overPrice: -105, underPrice: -115, best: "over" },
  },
];

export interface InjurySeed {
  team: string;
  playerName: string;
  position: Position;
  status: InjuryStatus;
  injury: string;
  impactNote?: string;
  /**
   * For OUT players: how many of the team's most recent games he missed.
   * "all" means every game this season. Drives the "without" filter.
   */
  missedLastGames?: number | "all";
}

/** Philadelphia has no entry on purpose, so the empty injury state is exercised. */
export const NBA_INJURIES: InjurySeed[] = [
  {
    team: "NYK",
    playerName: "Mitchell Robinson",
    position: "C",
    status: "OUT",
    injury: "Left Ankle Surgery",
    impactNote: "Karl-Anthony Towns +3.8 Reb/G boost",
    missedLastGames: "all",
  },
  {
    team: "BOS",
    playerName: "Kristaps Porzingis",
    position: "C",
    status: "OUT",
    injury: "Left Posterior Tibialis",
    impactNote: "Tatum +3.4% Usage boost",
    missedLastGames: "all",
  },
  { team: "LAL", playerName: "Jarred Vanderbilt", position: "F", status: "OUT", injury: "Right Foot Surgery", missedLastGames: "all" },
  { team: "MEM", playerName: "Marcus Smart", position: "G", status: "QUESTIONABLE", injury: "Right Ankle Sprain" },
  { team: "CLE", playerName: "Isaac Okoro", position: "F", status: "OUT", injury: "Right Shoulder Sprain", missedLastGames: 4 },
  { team: "DAL", playerName: "Dante Exum", position: "G", status: "OUT", injury: "Right Wrist Surgery", missedLastGames: "all" },
  { team: "GSW", playerName: "De'Anthony Melton", position: "G", status: "OUT", injury: "Left Knee Sprain", missedLastGames: 6 },
  { team: "MIN", playerName: "Joe Ingles", position: "F", status: "QUESTIONABLE", injury: "Left Calf Strain" },
  { team: "POR", playerName: "Robert Williams III", position: "C", status: "OUT", injury: "Left Hamstring Strain", missedLastGames: 5 },
  { team: "PHX", playerName: "Ryan Dunn", position: "F", status: "PROBABLE", injury: "Left Ankle Sprain" },
  { team: "SAC", playerName: "Devin Carter", position: "G", status: "OUT", injury: "Left Shoulder Surgery", missedLastGames: "all" },
];
