import type { MatchupPosition, OppRanks } from "@/data/types";
import { isSoftMatchup } from "./matchup";

/**
 * Scales for the hit-rate bar chart and its trend-line overlay.
 * Everything returns fractions of the plot height (0 = baseline, 1 = top),
 * so the chart component only has to turn them into percentages.
 */

/** Rounds an axis up to a tidy maximum with some headroom above the data. */
export function niceAxisMax(maxValue: number, line: number): number {
  const target = Math.max(maxValue, line, 1) * 1.18;
  if (target <= 2) return 2;
  const step = target <= 12 ? 2 : target <= 24 ? 4 : target <= 70 ? 5 : 10;
  return Math.ceil(target / step) * step;
}

/** Bar height as a fraction of the plot. Zero still shows a sliver so the bar is visible. */
export function barFraction(value: number, axisMax: number): number {
  if (axisMax <= 0) return 0;
  return Math.min(1, Math.max(0.035, value / axisMax));
}

export function lineFraction(line: number, axisMax: number): number {
  if (axisMax <= 0) return 0;
  return Math.min(1, Math.max(0, line / axisMax));
}

// --- Trend-line overlay ----------------------------------------------------

export const TREND_METRICS = ["oppDef", "pnr", "min", "fga", "none"] as const;
export type TrendMetric = (typeof TREND_METRICS)[number];

export const TREND_METRIC_LABELS: Record<TrendMetric, string> = {
  oppDef: "Opp Def",
  pnr: "PnR",
  min: "MIN",
  fga: "FGA",
  none: "Off",
};

export interface TrendPointSource {
  oppRanks: OppRanks;
  min: number;
  fga: number;
}

export function trendValue(game: TrendPointSource, metric: Exclude<TrendMetric, "none">): number {
  switch (metric) {
    case "oppDef":
      return game.oppRanks.dvp;
    case "pnr":
      return game.oppRanks.pnr;
    case "min":
      return game.min;
    case "fga":
      return game.fga;
  }
}

export interface TrendScale {
  metric: Exclude<TrendMetric, "none">;
  /** Legend text, e.g. "Opp Def vs PF". */
  label: string;
  isRank: boolean;
  min: number;
  max: number;
  /** Right-hand axis labels, top to bottom. */
  axis: [string, string, string];
  format: (value: number) => string;
  /** Emerald when true, red when false. */
  isFavorable: (value: number) => boolean;
}

/**
 * Builds the right-hand scale for a trend metric.
 * Ranks always span 1-30 with the softest defense at the top. Minutes and shot
 * attempts span the sample's own range and are favourable at or above the
 * season average.
 */
export function buildTrendScale(
  metric: Exclude<TrendMetric, "none">,
  values: readonly number[],
  seasonAverage: number,
  position: MatchupPosition,
): TrendScale {
  if (metric === "oppDef" || metric === "pnr") {
    return {
      metric,
      label: metric === "oppDef" ? `Opp Def vs ${position}` : "Opp PnR Def",
      isRank: true,
      min: 1,
      max: 30,
      axis: ["#30 Soft", "#15 Avg", "#1 Tough"],
      format: (value) => `#${value}`,
      isFavorable: isSoftMatchup,
    };
  }
  const unit = metric === "min" ? "MIN" : "FGA";
  const lo = Math.floor((Math.min(...values, seasonAverage) - 3) / 2) * 2;
  const hi = Math.ceil((Math.max(...values, seasonAverage) + 3) / 2) * 2;
  const min = Math.max(0, lo);
  const max = Math.max(min + 4, hi);
  return {
    metric,
    label: metric === "min" ? "Minutes Played" : "Field Goal Attempts",
    isRank: false,
    min,
    max,
    axis: [`${max} ${unit}`, `${Math.round((min + max) / 2)} ${unit}`, `${min} ${unit}`],
    format: (value) => (metric === "min" ? `${value}m` : `${value}`),
    isFavorable: (value) => value >= seasonAverage,
  };
}

/** Position of a trend point as a fraction of the plot height, kept off the edges. */
export function trendFraction(value: number, scale: Pick<TrendScale, "min" | "max">): number {
  const span = scale.max - scale.min;
  if (span <= 0) return 0.5;
  return Math.min(0.9, Math.max(0.1, (value - scale.min) / span));
}
