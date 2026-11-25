import type { SimilarPlayerComp } from "@/data/types";
import { computeHitRate, type HitRate } from "./hitRate";
import { average } from "./sample";

export interface CompResult extends SimilarPlayerComp {
  /** actual - line */
  diff: number;
  /** diff as a fraction of the line */
  diffPct: number;
  hit: boolean;
}

export interface CompSummary {
  rows: CompResult[];
  /** Mean of actual - line, or null with no comps. */
  averageDiff: number | null;
  /** Mean of the per-row percentage differences. */
  averageDiffPct: number | null;
  hitRate: HitRate;
}

/** How comparable players fared against their own lines versus tonight's opponent. */
export function summarizeComps(comps: readonly SimilarPlayerComp[]): CompSummary {
  const rows = comps.map((comp) => {
    const diff = comp.actual - comp.line;
    return { ...comp, diff, diffPct: comp.line > 0 ? diff / comp.line : 0, hit: comp.actual > comp.line };
  });
  return {
    rows,
    averageDiff: average(rows.map((r) => r.diff)),
    averageDiffPct: average(rows.map((r) => r.diffPct)),
    hitRate: computeHitRate(
      rows.map((r) => r.diff),
      0,
    ),
  };
}
