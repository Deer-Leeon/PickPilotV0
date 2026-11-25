import type { PlayerGameLogEntry, PlayerProp, PlayerResearch, StatId } from "@/data/types";
import {
  barFraction,
  buildTrendScale,
  lineFraction,
  niceAxisMax,
  trendFraction,
  trendValue,
  type TrendMetric,
  type TrendScale,
} from "./chart";
import { applyFilters, type ActiveFilter, type FilterContext } from "./filters";
import { computeHitRate, isHit, type HitRate } from "./hitRate";
import { average, takeSample, type SampleWindow } from "./sample";
import { STAT_IDS, getStatValue } from "./stats";

/**
 * Turns a player's data plus the page state (stat, sample, filters, trend)
 * into everything the research page draws. Pure, so the same inputs always
 * give the same page and the numbers can be unit tested.
 */

export interface ResearchState {
  stat: StatId;
  sample: SampleWindow;
  filters: readonly ActiveFilter[];
  trend: TrendMetric;
}

/** Stats the player has a posted prop for, in tab order. */
export function availableStats(props: readonly PlayerProp[]): StatId[] {
  return STAT_IDS.filter((stat) => props.some((prop) => prop.stat === stat));
}

/** The stat to show: the requested one if it is posted, else the featured prop, else the first posted. */
export function resolveStat(props: readonly PlayerProp[], requested: StatId | null): StatId {
  if (requested && props.some((prop) => prop.stat === requested)) return requested;
  return props.find((prop) => prop.isFeatured)?.stat ?? availableStats(props)[0] ?? "PTS";
}

// --- Stat strip --------------------------------------------------------------

export interface StripStat {
  key: "pts" | "ast" | "reb" | "threes" | "min" | "usg" | "fga";
  label: string;
  /** Average over the games on screen. Null when no games match. */
  value: number | null;
  /** Difference from the full-season average. Null when the sample is the full season. */
  delta: number | null;
  suffix: string;
}

const STRIP: readonly { key: StripStat["key"]; label: string; suffix: string }[] = [
  { key: "pts", label: "PTS", suffix: "" },
  { key: "ast", label: "AST", suffix: "" },
  { key: "reb", label: "REB", suffix: "" },
  { key: "threes", label: "3PM", suffix: "" },
  { key: "min", label: "MIN", suffix: "" },
  { key: "usg", label: "USG%", suffix: "%" },
  { key: "fga", label: "FGA", suffix: "" },
];

export function buildStatStrip(games: readonly PlayerGameLogEntry[], season: readonly PlayerGameLogEntry[]): StripStat[] {
  const isWholeSeason = games.length === season.length;
  return STRIP.map(({ key, label, suffix }) => {
    const value = average(games.map((game) => game[key]));
    const baseline = average(season.map((game) => game[key]));
    const delta = isWholeSeason || value === null || baseline === null ? null : value - baseline;
    return { key, label, suffix, value, delta };
  });
}

// --- Chart -------------------------------------------------------------------

export interface ChartBar {
  game: PlayerGameLogEntry;
  value: number;
  hit: boolean;
  /** Bar height as a fraction of the plot. */
  fraction: number;
}

export interface TrendPoint {
  /** Height as a fraction of the plot. */
  fraction: number;
  text: string;
  favorable: boolean;
  isUpcoming: boolean;
}

export interface ChartModel {
  axisMax: number;
  lineFraction: number;
  bars: ChartBar[];
  /** One point per bar plus a last one for tonight. Null when the trend line is off. */
  trend: { scale: TrendScale; points: TrendPoint[] } | null;
}

export interface ResearchView {
  stat: StatId;
  /** The posted prop for the stat. Null when the player has no props at all. */
  prop: PlayerProp | null;
  /** Games in the sample window that pass every filter, oldest first. */
  games: PlayerGameLogEntry[];
  /** Size of the sample window before filters. */
  sampleSize: number;
  hitRate: HitRate;
  strip: StripStat[];
  chart: ChartModel;
}

export function buildResearchView(research: PlayerResearch, state: ResearchState, ctx: FilterContext): ResearchView {
  const { gameLog, upcoming, player } = research;
  const prop = research.props.find((item) => item.stat === state.stat) ?? null;
  const line = prop?.line ?? 0;

  const sample = takeSample(gameLog, state.sample);
  const games = applyFilters(sample, state.filters, ctx);
  const values = games.map((game) => getStatValue(game, state.stat));
  const hitRate = computeHitRate(values, line);

  // The axis is set by the whole season, so bars keep their height when the sample or filters change.
  const seasonMax = Math.max(0, ...gameLog.map((game) => getStatValue(game, state.stat)));
  const axisMax = niceAxisMax(seasonMax, line);

  const bars = games.map((game, index) => ({
    game,
    value: values[index],
    hit: isHit(values[index], line),
    fraction: barFraction(values[index], axisMax),
  }));

  let trend: ChartModel["trend"] = null;
  if (state.trend !== "none" && games.length > 0) {
    const metric = state.trend;
    const trendValues = games.map((game) => trendValue(game, metric));
    const seasonAverage = average(gameLog.map((game) => trendValue(game, metric))) ?? 0;
    const scale = buildTrendScale(metric, trendValues, seasonAverage, player.matchupPosition);
    const tonight = trendValue({ oppRanks: upcoming.oppRanks, min: upcoming.projectedMin, fga: upcoming.projectedFga }, metric);
    const toPoint = (value: number, isUpcoming: boolean): TrendPoint => ({
      fraction: trendFraction(value, scale),
      text: scale.format(value),
      favorable: scale.isFavorable(value),
      isUpcoming,
    });
    trend = { scale, points: [...trendValues.map((value) => toPoint(value, false)), toPoint(tonight, true)] };
  }

  return {
    stat: state.stat,
    prop,
    games,
    sampleSize: sample.length,
    hitRate,
    strip: buildStatStrip(games, gameLog),
    chart: { axisMax, lineFraction: lineFraction(line, axisMax), bars, trend },
  };
}
