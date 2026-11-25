/**
 * Values pinned to match the prototype. The generator fills in everything
 * else around them, so each league-wide ranking stays a proper 1-30 ordering.
 */

/** Team metric -> { team abbreviation -> league rank }. */
export const RANK_PINS: Record<string, Record<string, number>> = {
  // Defense versus power forwards and pick-and-roll defense, taken from the
  // opponents in Tatum's game log.
  dvp_PF: { NYK: 24, WAS: 29, DET: 19, MIL: 14, IND: 27, CHA: 23, ATL: 28, GSW: 5, BKN: 22 },
  pnr: { NYK: 26, WAS: 28, DET: 21, MIL: 12, IND: 25, CHA: 24, ATL: 29, GSW: 7, BKN: 23 },

  // New York's defensive profile, as shown on Tatum's filters and shot modules.
  defRtg: { NYK: 19, BOS: 3 },
  pace: { NYK: 27, BOS: 15 },
  iso: { NYK: 22 },
  transition: { NYK: 25 },
  ftRate: { NYK: 21 },
  rebAllowed: { NYK: 12 },
  zoneAtb3: { NYK: 25 },
  zoneRim: { NYK: 21 },
  zoneMid: { NYK: 14 },
  zoneLc3: { NYK: 24 },
  zoneRc3: { NYK: 22 },
  zonePaint: { NYK: 18 },
  paintPts: { NYK: 20 },
  corner3: { NYK: 23 },
  pullUp: { NYK: 24 },
  catchShoot: { NYK: 22 },
  spotUp: { NYK: 19 },
  postUp: { NYK: 23 },

  // Team comparison radar for New York at Boston.
  offRtg: { NYK: 4, BOS: 2 },
  threesMade: { NYK: 6, BOS: 1 },
  rebounding: { NYK: 5, BOS: 13 },
  ballSecurity: { NYK: 3, BOS: 8 },
  offPts: { NYK: 8 },
  defPts: { BOS: 4 },
};

/**
 * Team trend records behind the game lines: [wins, losses].
 * Each pair must add up to the team's games played (New York 11, Boston 12, Cleveland 11).
 */
export const TREND_PINS: Record<string, Partial<Record<"ats" | "over" | "h1Ats" | "q1Over", [number, number]>>> = {
  NYK: { ats: [8, 3] },
  BOS: { ats: [5, 7], over: [7, 5], h1Ats: [9, 3], q1Over: [8, 4] },
  CLE: { ats: [9, 2] },
};
