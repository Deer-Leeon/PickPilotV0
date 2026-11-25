import type { BookId, Grade, PlayerGameLogEntry, PlayerProp, StatId } from "@/data/types";
import { BOOKS } from "@/data/fixtures/nba/league";
import type { FeaturedPropSeed } from "@/data/fixtures/nba/rosters";
import { computeHitRate } from "@/lib/research/hitRate";
import { impliedProbability, probabilityToAmerican } from "@/lib/research/odds";
import { STAT_IDS, getStatValue } from "@/lib/research/stats";
import { clamp, createRng, type Rng } from "./rng";

/** Total implied probability of both sides of a two-way market: about 4.5% of vig. */
const TWO_WAY_TOTAL = 1.045;

const STANDARD_PRICES = [-120, -118, -115, -114, -112, -110, -110, -110, -108, -106, -105, -104, -102];
const THREES_PRICES = [-135, -128, -120, -115, -110, -105, 100, 105, 112, 118];

export function otherSidePrice(price: number): number {
  return probabilityToAmerican(TWO_WAY_TOTAL - impliedProbability(price));
}

/**
 * Stand-in for the server's prop grade.
 *
 * The real grade is a model output stored in prop_grade. Here it is simply
 * the gap between the season hit rate and the price's break-even rate, so the
 * mock grades are at least internally consistent. The UI never computes it.
 */
export function gradeFromEdge(hitRatePct: number, price: number): Grade {
  const edge = hitRatePct - impliedProbability(price) * 100;
  if (edge >= 15) return "A";
  if (edge >= 10) return "A-";
  if (edge >= 6) return "B+";
  if (edge >= 1) return "B";
  if (edge >= -9) return "C";
  if (edge >= -17) return "D+";
  if (edge >= -27) return "D";
  return "F";
}

export function gradeProp(log: readonly PlayerGameLogEntry[], stat: StatId, line: number, overPrice: number): Grade {
  const hitRate = computeHitRate(
    log.map((game) => getStatValue(game, stat)),
    line,
  );
  return gradeFromEdge((hitRate.rate ?? 0.5) * 100, overPrice);
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Books post a market only when the player produces enough of the stat. */
function isOffered(stat: StatId, avg: { pts: number; reb: number; ast: number; threes: number }): boolean {
  switch (stat) {
    case "PTS":
      return true;
    case "REB":
      return avg.reb >= 1.8;
    case "AST":
      return avg.ast >= 1.3;
    case "3PM":
      return avg.threes >= 0.8;
    case "PA":
    case "PR":
    case "PRA":
      return avg.pts >= 8;
    case "RA":
      return avg.pts >= 8 || avg.reb + avg.ast >= 6;
    case "DD":
      return (avg.reb >= 7 || avg.ast >= 7) && avg.pts >= 12;
  }
}

/** A half-point line set just under the player's average. */
function lineFromAverage(avg: number): number {
  return Math.max(0.5, Math.round(avg * 0.96 - 0.5) + 0.5);
}

function pickBooks(rng: Rng): [BookId, BookId] {
  const [first, second] = rng.shuffle(BOOKS);
  return [first, second];
}

interface PropOptions {
  playerId: string;
  gameId: string;
  log: readonly PlayerGameLogEntry[];
  featured?: FeaturedPropSeed;
}

export function buildProps({ playerId, gameId, log, featured }: PropOptions): PlayerProp[] {
  const rng = createRng(`props:${playerId}`);
  const avg = {
    pts: average(log.map((g) => g.pts)),
    reb: average(log.map((g) => g.reb)),
    ast: average(log.map((g) => g.ast)),
    threes: average(log.map((g) => g.threes)),
  };

  // Low-scoring big men are known for their rebounding line, everyone else for points.
  const featuredStat: StatId = featured?.stat ?? (avg.pts < 8 && avg.reb >= 4.5 ? "REB" : "PTS");

  const props: PlayerProp[] = [];
  for (const stat of STAT_IDS) {
    const isFeatured = stat === featuredStat;
    if (!isFeatured && !isOffered(stat, avg)) continue;

    const values = log.map((game) => getStatValue(game, stat));
    const pinned = isFeatured ? featured : undefined;
    const [overBook, underBook] = pickBooks(rng);

    let line: number;
    let overPrice: number;
    if (pinned) {
      line = pinned.line;
      overPrice = pinned.price;
    } else if (stat === "DD") {
      line = 0.5;
      // Price a yes/no market off how often it has actually happened.
      const rate = computeHitRate(values, line).rate ?? 0.3;
      overPrice = probabilityToAmerican(clamp(rate * 0.85 + 0.08, 0.08, 0.88));
    } else {
      line = lineFromAverage(average(values));
      overPrice = rng.pick(stat === "3PM" ? THREES_PRICES : STANDARD_PRICES);
    }

    props.push({
      playerId,
      gameId,
      stat,
      line,
      over: { price: overPrice, book: pinned?.book ?? overBook },
      under: { price: otherSidePrice(overPrice), book: underBook },
      grade: gradeProp(log, stat, line, overPrice),
      isFeatured,
    });
  }
  return props;
}
