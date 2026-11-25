"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { StatId, UpcomingGameContext } from "@/data/types";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/format";
import { TREND_METRICS, TREND_METRIC_LABELS, type TrendMetric } from "@/lib/research/chart";
import { SAMPLE_WINDOWS, sampleLabel, type SampleWindow } from "@/lib/research/sample";
import { flashKey, standOutTargets } from "@/lib/research/standOuts/targets";
import { STAT_FAMILIES } from "@/lib/research/stats";
import type { ChartBar, ChartModel } from "@/lib/research/view";

interface HitRateChartProps {
  stat: StatId;
  /** The prop line the bars are measured against. */
  line: number;
  chart: ChartModel;
  upcoming: UpcomingGameContext;
  seasonGames: number;
  sample: SampleWindow;
  onSampleChange: (sample: SampleWindow) => void;
  trend: TrendMetric;
  onTrendChange: (trend: TrendMetric) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
  /** The active-filter chips, rendered between the controls and the chart. */
  filterBar?: ReactNode;
}

/** Height of tonight's placeholder bar, as a fraction of the plot. */
const UPCOMING_BAR = 0.72;
/** Past this many columns the chart scrolls sideways on phones instead of squeezing. */
const MAX_FITTED_COLUMNS = 8;

const barLabel = (bar: ChartBar, stat: StatId) => (stat === "DD" ? (bar.value === 1 ? "Yes" : "No") : String(bar.value));
const venue = (isHome: boolean) => (isHome ? "vs" : "@");

function BarTooltip({ bar, stat, style }: { bar: ChartBar; stat: StatId; style: CSSProperties }) {
  const { game } = bar;
  return (
    <div
      role="status"
      style={style}
      className="pointer-events-none absolute -top-12 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-lg bg-active px-2.5 py-1.5 font-mono text-[10px] shadow-2xl sm:left-(--tip-left)"
    >
      <div className="font-bold text-fg">
        {formatShortDate(game.date)} {venue(game.isHome)} {game.opponentAbbr}: {barLabel(bar, stat)} {STAT_FAMILIES[stat].shortLabel}{" "}
        <span className={bar.hit ? "text-good-fg" : "text-bad-fg"}>({bar.hit ? "HIT" : "MISS"})</span>
      </div>
      <div className="mt-0.5 text-fg-soft">
        {game.min} MIN · {game.fgm}-{game.fga} FG · {game.fg3m}-{game.fg3a} 3PT · {game.ftm}-{game.fta} FT
      </div>
      <div className="text-fg-muted">
        Opp Def: #{game.oppRanks.dvp} · PnR: #{game.oppRanks.pnr} · {game.pf} PF
      </div>
    </div>
  );
}

/**
 * The page's main chart: one bar per game for the selected stat, green when
 * it beat the line and red when it did not, with tonight's game as a dashed
 * placeholder. An optional trend line plots a second number per game
 * (opponent defense rank, minutes, shot attempts) on the right-hand axis.
 */
export function HitRateChart({
  stat,
  line,
  chart,
  upcoming,
  seasonGames,
  sample,
  onSampleChange,
  trend,
  onTrendChange,
  hasFilters,
  onClearFilters,
  filterBar,
}: HitRateChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const { bars, axisMax } = chart;
  const columns = bars.length + 1;

  // On phones a long sample scrolls sideways. Start at the right-hand end,
  // where the most recent games and tonight's matchup are.
  useEffect(() => {
    const element = scroller.current;
    if (element) element.scrollLeft = element.scrollWidth;
  }, [columns, stat]);
  const activeBar = activeIndex !== null ? bars[activeIndex] : undefined;
  const showTrend = chart.trend !== null;
  const isYesNo = stat === "DD";

  // Gutters either side of the plot: the left axis, and the right axis when the trend line is on.
  const plotInset = showTrend ? "left-9 right-14" : "left-9 right-3";
  const gutters = showTrend ? "5.75rem" : "3rem";
  const tipLeft =
    activeIndex === null
      ? undefined
      : `clamp(8rem, calc(2.25rem + (100% - ${gutters}) * ${((activeIndex + 0.5) / columns).toFixed(4)}), calc(100% - 8rem))`;

  return (
    <Card className="p-4 shadow-lg sm:p-5" {...flashKey(standOutTargets.chart)}>
      <div className={cn("flex flex-wrap items-center justify-between gap-2", hasFilters ? "pb-2.5" : "pb-4")}>
        <SegmentedControl
          label="Sample window"
          value={sample}
          onChange={onSampleChange}
          options={SAMPLE_WINDOWS.map((window) => ({ value: window, label: sampleLabel(window, seasonGames) }))}
        />
        <div role="radiogroup" aria-label="Trend line" className="flex items-center gap-1.5 font-mono text-[11px]">
          <span aria-hidden="true" className="hidden uppercase text-fg-subtle sm:inline">
            Trend Line:
          </span>
          {TREND_METRICS.map((metric) => {
            const active = metric === trend;
            return (
              <button
                key={metric}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onTrendChange(metric)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 transition",
                  active ? "bg-white font-semibold text-black" : "bg-inset text-fg-muted hover:bg-active hover:text-fg-soft",
                )}
              >
                {TREND_METRIC_LABELS[metric]}
              </button>
            );
          })}
        </div>
      </div>

      {filterBar}

      {bars.length === 0 ? (
        <EmptyState
          className="h-64 rounded-xl bg-inset"
          title="No games match"
          description={
            hasFilters
              ? "No game in this sample passes every active filter. Widen a rank window, remove a filter or use a longer sample."
              : "There are no completed games in this sample yet."
          }
          action={
            hasFilters ? (
              <Button size="sm" onClick={onClearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="relative h-64 select-none rounded-xl bg-inset">
          {/* Left axis: the stat */}
          {isYesNo ? null : (
            <div aria-hidden="true" className="absolute bottom-9 left-2 top-6 flex flex-col justify-between font-mono text-[10px] text-fg-subtle">
              <span>{axisMax}</span>
              <span>{Math.round(axisMax / 2)}</span>
              <span>0</span>
            </div>
          )}

          {/* Right axis: the trend metric */}
          {chart.trend ? (
            <div
              aria-hidden="true"
              className="absolute bottom-9 right-2 top-6 flex flex-col justify-between text-right font-mono text-[10px] text-fg-muted"
            >
              <span className={chart.trend.scale.isRank ? "text-good-fg/80" : undefined}>{chart.trend.scale.axis[0]}</span>
              <span>{chart.trend.scale.axis[1]}</span>
              <span className={chart.trend.scale.isRank ? "text-bad-fg/80" : undefined}>{chart.trend.scale.axis[2]}</span>
            </div>
          ) : null}

          <div ref={scroller} className={cn("no-scrollbar absolute inset-y-0 overflow-x-auto", plotInset)}>
            <div
              className="relative h-full sm:min-w-0!"
              style={{ minWidth: columns > MAX_FITTED_COLUMNS ? `${columns * 2.75}rem` : undefined }}
            >
              {/* Plot: bars, prop line and trend line share this box, so heights line up exactly. */}
              <div className="absolute inset-x-0 bottom-9 top-6">
                <div
                  className="pointer-events-none absolute inset-x-0 z-20 border-t border-dashed border-white/80"
                  style={{ bottom: `${chart.lineFraction * 100}%` }}
                >
                  <span className="absolute -top-5 left-0 rounded bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none text-black shadow">
                    {isYesNo ? "DD" : line}
                  </span>
                </div>

                <div className="relative z-10 flex h-full">
                  {bars.map((bar, index) => (
                    <div key={bar.game.id} className="flex h-full min-w-0 flex-1 items-end justify-center px-1">
                      <button
                        type="button"
                        aria-label={`${formatShortDate(bar.game.date)} ${venue(bar.game.isHome)} ${bar.game.opponentAbbr}: ${barLabel(bar, stat)} ${STAT_FAMILIES[stat].shortLabel}, ${bar.hit ? "hit" : "miss"}`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        onFocus={() => setActiveIndex(index)}
                        onBlur={() => setActiveIndex(null)}
                        onClick={() => setActiveIndex(index)}
                        style={{ height: `${bar.fraction * 100}%` }}
                        className={cn(
                          "flex w-full max-w-11 flex-col items-center justify-end rounded-t-lg pb-1.5 shadow transition-colors",
                          bar.hit ? "bg-good/90 hover:bg-good-fg" : "bg-bad/85 hover:bg-bad-fg",
                        )}
                      >
                        <span className="font-mono text-xs font-bold text-white drop-shadow">{barLabel(bar, stat)}</span>
                      </button>
                    </div>
                  ))}
                  <div className="flex h-full min-w-0 flex-1 items-end justify-center px-1" {...flashKey(standOutTargets.tonight)}>
                    <div
                      style={{ height: `${UPCOMING_BAR * 100}%` }}
                      className="flex w-full max-w-11 flex-col items-center justify-end rounded-t-lg border border-dashed border-good/40 bg-good/[0.06] pb-2"
                    >
                      <span className="font-mono text-[9px] font-bold uppercase text-good-fg">Tonight</span>
                    </div>
                  </div>
                </div>

                {chart.trend ? (
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
                      <polyline
                        points={chart.trend.points
                          .map((point, index) => `${(((index + 0.5) / columns) * 100).toFixed(2)},${((1 - point.fraction) * 100).toFixed(2)}`)
                          .join(" ")}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                    {chart.trend.points.map((point, index) => (
                      <div
                        key={index}
                        className="absolute flex -translate-x-1/2 translate-y-1/2 flex-col items-center"
                        style={{ left: `${((index + 0.5) / columns) * 100}%`, bottom: `${point.fraction * 100}%` }}
                      >
                        {/* No outline on the label: its fill and shadow lift it off the bars. The dot below carries green or red. */}
                        <span
                          className={cn(
                            "absolute bottom-full mb-1 whitespace-nowrap rounded bg-active px-1.5 py-0.5 font-mono text-[9.5px] font-bold leading-tight shadow",
                            point.isUpcoming ? "text-good-fg" : "text-fg",
                          )}
                        >
                          {point.text}
                        </span>
                        <span
                          className={cn(
                            "rounded-full border-[2.5px] bg-inset",
                            point.favorable ? "border-good" : "border-bad",
                            point.isUpcoming ? "size-3" : "size-2.5",
                          )}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Opponent and date under each bar */}
              <div className="absolute inset-x-0 bottom-1 flex h-7">
                {bars.map((bar) => (
                  <div key={bar.game.id} className="min-w-0 flex-1 text-center font-mono leading-tight">
                    <div className="text-[10px] font-medium text-fg-soft">{bar.game.opponentAbbr}</div>
                    <div className="text-[9px] text-fg-subtle">{formatShortDate(bar.game.date)}</div>
                  </div>
                ))}
                <div className="min-w-0 flex-1 text-center font-mono leading-tight">
                  <div className="text-[10px] font-bold text-good-fg">{upcoming.opponentAbbr}</div>
                  <div className="text-[9px] text-fg-subtle">{formatShortDate(upcoming.date)}</div>
                </div>
              </div>
            </div>
          </div>

          {activeBar ? <BarTooltip bar={activeBar} stat={stat} style={{ "--tip-left": tipLeft } as CSSProperties} /> : null}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-fg-muted">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="w-3 border-t border-dashed border-white" /> Prop Line ({line})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-xs bg-good" /> Over Hit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-xs bg-bad" /> Under Miss
          </span>
          {chart.trend ? (
            <span className="flex items-center gap-1.5 text-fg-soft">
              <span className="inline-block size-2.5 rounded-full border-2 border-good-fg" /> {chart.trend.scale.label}
            </span>
          ) : null}
        </div>
        <span className="text-fg-subtle">
          <span className="hidden sm:inline">Hover</span>
          <span className="sm:hidden">Tap</span> any bar for boxscore splits
        </span>
      </div>
    </Card>
  );
}
