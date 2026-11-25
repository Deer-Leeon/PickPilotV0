export type PropSide = "over" | "under";

export interface HitRate {
  hits: number;
  misses: number;
  /** Results that landed exactly on the line. They are left out of the rate. */
  pushes: number;
  /** hits + misses. Pushes are not part of the denominator. */
  total: number;
  /** 0 to 1, or null when there is nothing to divide by. */
  rate: number | null;
}

export function isHit(value: number, line: number, side: PropSide = "over"): boolean {
  return side === "over" ? value > line : value < line;
}

/**
 * How often a set of results beat a line.
 *
 * Two rules from the blueprint are enforced here and nowhere else:
 * pushes leave the denominator, and an empty sample has no rate (it is not 0%).
 */
export function computeHitRate(values: readonly number[], line: number, side: PropSide = "over"): HitRate {
  let hits = 0;
  let misses = 0;
  let pushes = 0;
  for (const value of values) {
    if (value === line) pushes += 1;
    else if (isHit(value, line, side)) hits += 1;
    else misses += 1;
  }
  const total = hits + misses;
  return { hits, misses, pushes, total, rate: total > 0 ? hits / total : null };
}

/** "67%" or an em dash when the sample is empty. */
export function formatHitRate(hitRate: HitRate): string {
  return hitRate.rate === null ? "—" : `${Math.round(hitRate.rate * 100)}%`;
}

/** "8/12" */
export function formatSample(hitRate: Pick<HitRate, "hits" | "total">): string {
  return `${hitRate.hits}/${hitRate.total}`;
}

/** A hit rate at or above this is shown in emerald, below it in red. */
export const FAVORABLE_HIT_RATE = 0.55;
