import type { MatchupPosition, PlayerGameLogEntry, StatId } from "@/data/types";
import type { BaseAverages } from "@/data/fixtures/nba/rosters";
import type { PinnedGame } from "@/data/fixtures/nba/tatum";
import { STAT_FAMILIES, getStatValue, type BoxScoreStats } from "@/lib/research/stats";
import { oppRanksFor, type RankTables } from "./ranks";
import { clamp, createRng, type Rng } from "./rng";
import type { TeamGame } from "./schedule";

const round1 = (value: number) => Math.round(value * 10) / 10;

interface GameLogOptions {
  playerId: string;
  matchupPosition: MatchupPosition;
  base: BaseAverages;
  schedule: readonly TeamGame[];
  /** Indexes into the schedule the player sat out. */
  missed: ReadonlySet<number>;
  /** Per schedule index: injury ids of teammates who did not play. */
  teammatesOut: readonly string[][];
  tables: RankTables;
  /** Forces exactly `hits` games over `line` on one stat, so headline hit rates are stable. */
  target?: { stat: StatId; line: number; hits: number };
}

interface Row extends BoxScoreStats {
  scheduleIndex: number;
  min: number;
}

/** Moves a row's stat to an exact value by nudging the box score fields behind it. */
function setStat(row: Row, stat: StatId, value: number): void {
  const components = STAT_FAMILIES[stat].components;
  if (components.length === 0) return;
  let delta = value - getStatValue(row, stat);
  let turn = 0;
  let guard = 0;
  while (delta !== 0 && guard < 400) {
    const key = components[turn % components.length];
    if (delta > 0) {
      row[key] += 1;
      delta -= 1;
    } else if (row[key] > 0) {
      row[key] -= 1;
      delta += 1;
    }
    turn += 1;
    guard += 1;
  }
}

/** Makes points and threes agree: a player cannot score fewer points than his threes are worth. */
function reconcile(row: Row, lockedStat: StatId | undefined): void {
  if (row.pts >= row.threes * 3) return;
  const pointsLocked = lockedStat !== undefined && STAT_FAMILIES[lockedStat].components.includes("pts");
  if (pointsLocked) row.threes = Math.floor(row.pts / 3);
  else row.pts = row.threes * 3 + 1;
}

function forceHitCount(rows: Row[], target: NonNullable<GameLogOptions["target"]>, rng: Rng): void {
  const { stat, line } = target;
  const wanted = clamp(target.hits, 0, rows.length);
  const swing = Math.max(1, Math.round(line * 0.12));
  const isOver = (row: Row) => getStatValue(row, stat) > line;
  const distance = (row: Row) => Math.abs(getStatValue(row, stat) - line);

  let guard = 0;
  while (guard < 100) {
    const hits = rows.filter(isOver);
    if (hits.length === wanted) break;
    if (hits.length > wanted) {
      // Pull the narrowest win back under the line.
      const row = [...hits].sort((a, b) => distance(a) - distance(b))[0];
      setStat(row, stat, Math.max(0, Math.floor(line) - rng.int(0, swing)));
    } else {
      // Push the nearest miss over the line.
      const row = rows.filter((r) => !isOver(r)).sort((a, b) => distance(a) - distance(b))[0];
      setStat(row, stat, Math.ceil(line) + (Number.isInteger(line) ? 1 : 0) + rng.int(0, swing));
    }
    guard += 1;
  }
  for (const row of rows) reconcile(row, stat);
}

interface Shooting {
  fgm: number;
  fga: number;
  fg3m: number;
  fg3a: number;
  ftm: number;
  fta: number;
}

/** Builds a shooting line that adds up to the points and threes already chosen. */
function deriveShooting(pts: number, threes: number, base: BaseAverages, rng: Rng): Shooting {
  const fg3m = threes;
  const remaining = pts - fg3m * 3;
  const ftShare = clamp(rng.normal(base.pts >= 20 ? 0.27 : 0.2, 0.08), 0, 0.6);
  let ftm = Math.round(remaining * ftShare);
  // Whatever is left after free throws must be made of two-point baskets.
  if ((remaining - ftm) % 2 !== 0) ftm += 1;
  const twos = (remaining - ftm) / 2;

  const pct3 = clamp(rng.normal(0.37, 0.07), 0.22, 0.62);
  const pct2 = clamp(rng.normal(0.53, 0.07), 0.36, 0.8);
  const pctFt = clamp(rng.normal(0.82, 0.08), 0.5, 1);

  const fg3a = fg3m > 0 ? Math.max(fg3m, Math.round(fg3m / pct3)) : rng.int(0, Math.round(base.threes * 2.2));
  const twoAttempts = twos > 0 ? Math.max(twos, Math.round(twos / pct2)) : rng.int(0, 3);
  const fta = ftm > 0 ? Math.max(ftm, Math.round(ftm / pctFt)) : rng.chance(0.25) ? 2 : 0;

  return { fgm: twos + fg3m, fga: twoAttempts + fg3a, fg3m, fg3a, ftm, fta };
}

/**
 * A player's completed games, oldest first.
 *
 * Minutes come first, production scales with minutes and with how soft the
 * opponent is against the player's position, and the shooting line is derived
 * last so that every row adds up (points = 2s + 3s + free throws).
 */
export function buildGameLog(options: GameLogOptions): PlayerGameLogEntry[] {
  const { playerId, matchupPosition, base, schedule, missed, teammatesOut, tables, target } = options;
  const rng = createRng(`log:${playerId}`);

  const rows: Row[] = [];
  schedule.forEach((game, scheduleIndex) => {
    if (missed.has(scheduleIndex)) return;
    const min = Math.round(clamp(rng.normal(base.min, 2.6), Math.max(4, base.min - 8), Math.min(44, base.min + 7)));
    const load = min / base.min;
    // Rank 30 defenses give up about 6% more than average, rank 1 about 6% less.
    const dvp = tables[`dvp_${matchupPosition}`][game.opponentAbbr];
    const softness = 1 + ((dvp - 15.5) / 15.5) * 0.06;
    const draw = (mean: number, sd: number) => Math.max(0, Math.round(rng.normal(mean, sd)));

    rows.push({
      scheduleIndex,
      min,
      pts: draw(base.pts * load * softness, base.pts * 0.22 + 1.2),
      reb: draw(base.reb * load, base.reb * 0.3 + 0.8),
      ast: draw(base.ast * load, base.ast * 0.32 + 0.7),
      threes: base.threes === 0 ? 0 : draw(base.threes * load, base.threes * 0.45 + 0.5),
    });
  });

  // Shift each stat by a whole number so the season average lands on the seed.
  for (const key of ["pts", "reb", "ast"] as const) {
    const mean = rows.reduce((sum, row) => sum + row[key], 0) / Math.max(1, rows.length);
    const shift = Math.round(base[key] - mean);
    if (shift !== 0) for (const row of rows) row[key] = Math.max(0, row[key] + shift);
  }

  for (const row of rows) reconcile(row, undefined);
  if (target) forceHitCount(rows, target, rng);

  const expectedFga = base.pts * 0.78;
  const usageBase = 10 + base.pts * 0.7;

  return rows.map((row) => {
    const game = schedule[row.scheduleIndex];
    const shooting = deriveShooting(row.pts, row.threes, base, rng);
    return {
      id: `${playerId}:${game.date}`,
      date: game.date,
      opponentAbbr: game.opponentAbbr,
      isHome: game.isHome,
      restDays: game.restDays,
      min: row.min,
      pts: row.pts,
      reb: row.reb,
      ast: row.ast,
      threes: row.threes,
      ...shooting,
      pf: clamp(Math.round(rng.normal(2.2, 1.1)), 0, 5),
      usg: round1(clamp(usageBase + (shooting.fga - expectedFga) * 0.45 + rng.normal(0, 1), 6, 42)),
      oppRanks: oppRanksFor(tables, game.opponentAbbr, matchupPosition),
      teammatesOut: teammatesOut[row.scheduleIndex] ?? [],
    };
  });
}

/** Turns hand-pinned games (Tatum) into log rows. */
export function buildPinnedGameLog(
  playerId: string,
  matchupPosition: MatchupPosition,
  games: readonly PinnedGame[],
  teammatesOut: readonly string[][],
  tables: RankTables,
): PlayerGameLogEntry[] {
  return games.map((game, index) => ({
    id: `${playerId}:${game.date}`,
    date: game.date,
    opponentAbbr: game.opp,
    isHome: game.isHome,
    restDays: game.rest,
    min: game.min,
    pts: game.pts,
    reb: game.reb,
    ast: game.ast,
    threes: game.threes,
    fgm: game.fg[0],
    fga: game.fg[1],
    fg3m: game.fg3[0],
    fg3a: game.fg3[1],
    ftm: game.ft[0],
    fta: game.ft[1],
    pf: game.pf,
    usg: game.usg,
    oppRanks: oppRanksFor(tables, game.opp, matchupPosition),
    teammatesOut: teammatesOut[index] ?? [],
  }));
}
