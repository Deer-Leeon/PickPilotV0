import { FAVORABLE_HIT_RATE } from "../hitRate";

/**
 * Stand-outs: the handful of things on a page that are clearly good or
 * clearly bad. Every page has its own function in this folder that reads the
 * data the page already shows and returns a short list, strongest first.
 *
 * "Good" favours the Over or is a team strength. "Bad" works against the
 * Over, is a team weakness, or is a player who is unavailable. Anything in
 * between is left out: a stand-out has to be far enough from average to say so.
 *
 * A stand-out is read at a glance: one figure, who it is about, and a few
 * words on what the figure measures. It also names what it points at on the
 * page, so the panel can show where it is.
 */
export type StandOutTone = "good" | "bad";

export interface StandOut {
  /** Stable key. Two findings about the same thing share an id, so only the first is kept. */
  id: string;
  tone: StandOutTone;
  /** Who or what it is about: "Jayson Tatum", "BOS offense". */
  subject: string;
  /**
   * The one figure that makes it stand out, computed from the data and at most
   * FIGURE_MAX_LENGTH characters: "82%", "A-", "29th", "+3.8", "OUT".
   * Null when the finding has no single figure.
   */
  figure: string | null;
  /** What the figure measures and the numbers behind it, in a few words. */
  text: string;
  /** Where to research it. Null when the page on screen already shows it. */
  href: string | null;
  /** What it points at on the page, as keys from `targets.ts`: the exact spot first, then wider ones to fall back on. */
  targets: readonly string[];
}

/** The longest figure the panel has room for. */
export const FIGURE_MAX_LENGTH = 5;

/** How many good and how many bad stand-outs a page lists. */
export const STAND_OUT_LIMIT = 4;

/** A hit rate or trend needs this many results behind it before it is called out. */
export const MIN_STAND_OUT_SAMPLE = 5;

/** The mirror of FAVORABLE_HIT_RATE: at or below this, the Over has clearly been missing. */
export const UNFAVORABLE_HIT_RATE = 0.45;

/** Good at or above the favourable rate, bad at or below its mirror, otherwise nothing to say. */
export function hitRateTone(hits: number, total: number, minSample = MIN_STAND_OUT_SAMPLE): StandOutTone | null {
  if (total < minSample || total <= 0) return null;
  const rate = hits / total;
  if (rate >= FAVORABLE_HIT_RATE) return "good";
  return rate <= UNFAVORABLE_HIT_RATE ? "bad" : null;
}

/** A recent average has to move this share of the season average, and this many units, to count as hot or cold. */
export const FORM_MIN_RATIO = 0.15;
export const FORM_MIN_CHANGE = 1;

export interface FormSwing {
  /** recent - season */
  change: number;
  tone: StandOutTone;
}

/**
 * Whether a recent average is far enough from the season average to call the
 * player hot (good) or cold (bad). Null when it is not, or when either
 * average is missing: a player with no games has no form.
 */
export function formSwing(recent: number | null, season: number | null): FormSwing | null {
  if (recent === null || season === null || season <= 0) return null;
  const change = recent - season;
  if (Math.abs(change) < FORM_MIN_CHANGE || Math.abs(change) / season < FORM_MIN_RATIO) return null;
  return { change, tone: change > 0 ? "good" : "bad" };
}

/**
 * Builds a page's final list from its kinds of finding.
 *
 * Each kind arrives sorted strongest first. The kinds take turns, in the order
 * given, so one kind cannot crowd out the others, and each tone stops at the
 * limit. Good comes first in the result, then bad.
 */
export function pickStandOuts(kinds: readonly (readonly StandOut[])[], limit = STAND_OUT_LIMIT): StandOut[] {
  const pick = (tone: StandOutTone): StandOut[] => {
    const queues = kinds.map((kind) => kind.filter((item) => item.tone === tone));
    const picked: StandOut[] = [];
    const seen = new Set<string>();
    const longest = Math.max(0, ...queues.map((queue) => queue.length));
    for (let turn = 0; turn < longest && picked.length < limit; turn += 1) {
      for (const queue of queues) {
        const item = queue[turn];
        if (!item || seen.has(item.id) || picked.length >= limit) continue;
        seen.add(item.id);
        picked.push(item);
      }
    }
    return picked;
  };
  return [...pick("good"), ...pick("bad")];
}
