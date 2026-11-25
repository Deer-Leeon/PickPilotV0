import { cn } from "@/lib/cn";
import { formatAverage, formatSigned } from "@/lib/format";
import { FAVORABLE_HIT_RATE, formatHitRate, formatSample, type HitRate } from "@/lib/research/hitRate";
import { flashKey, standOutTargets } from "@/lib/research/standOuts/targets";
import type { StripStat } from "@/lib/research/view";

interface StatStripProps {
  hitRate: HitRate;
  stats: readonly StripStat[];
}

/**
 * Hit rate on the selected prop, then the player's averages over the games on
 * screen. The small figure beside an average is its difference from the full
 * season, and only shows when a sample window or filter is narrowing the games.
 */
export function StatStrip({ hitRate, stats }: StatStripProps) {
  const rateClass = hitRate.rate === null ? "text-fg-muted" : hitRate.rate >= FAVORABLE_HIT_RATE ? "text-good-fg" : "text-bad-fg";

  return (
    <dl className="no-scrollbar flex w-full items-center gap-4 overflow-x-auto rounded-xl bg-inset px-4 py-2 font-mono sm:inline-flex sm:w-auto sm:max-w-full sm:gap-5">
      {/* Extra room instead of a divider between the hit rate and the averages. */}
      <div className="shrink-0 pr-2 sm:pr-3" {...flashKey(standOutTargets.hitRate)}>
        <dt className="text-[9px] uppercase text-fg-subtle">Hit Rate</dt>
        <dd className={cn("whitespace-nowrap text-xs font-bold", rateClass)}>
          {formatHitRate(hitRate)} ({formatSample(hitRate)})
        </dd>
      </div>
      {stats.map((stat) => (
        <div key={stat.key} className="shrink-0">
          <dt className="text-[9px] text-fg-subtle">{stat.label}</dt>
          <dd className="whitespace-nowrap text-xs font-bold text-fg">
            {stat.value === null ? "—" : `${formatAverage(stat.value)}${stat.suffix}`}
            {stat.delta !== null ? (
              <span
                title="Compared with the full-season average"
                className={cn("ml-1 text-[10px]", stat.delta > 0.04 ? "text-good-fg" : stat.delta < -0.04 ? "text-bad-fg" : "text-fg-subtle")}
              >
                {formatSigned(stat.delta)}
                {stat.suffix}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
