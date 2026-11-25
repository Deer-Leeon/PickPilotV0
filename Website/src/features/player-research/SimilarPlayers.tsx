import { PlayerAvatar } from "@/components/media/PlayerAvatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { InsetRow } from "@/components/ui/InsetRow";
import type { PositionGroup, SimilarPlayerComp } from "@/data/types";
import { cn } from "@/lib/cn";
import { formatMonthDay, formatSigned } from "@/lib/format";
import { FAVORABLE_HIT_RATE, formatHitRate, formatSample } from "@/lib/research/hitRate";
import { summarizeComps } from "@/lib/research/similar";
import { flashKey, standOutTargets } from "@/lib/research/standOuts/targets";

export const POSITION_GROUP_LABELS: Record<PositionGroup, string> = {
  guards: "Guards",
  wings: "Forwards",
  bigs: "Centers",
};

interface SimilarPlayersProps {
  comps: readonly SimilarPlayerComp[];
  positionGroup: PositionGroup;
  opponentNickname: string;
}

const signedPercent = (fraction: number, digits = 0) => `${formatSigned(fraction * 100, digits)}%`;
const toneClass = (positive: boolean) => (positive ? "text-good-fg" : "text-bad-fg");

/** How comparable players did against their own points line when they faced tonight's opponent. */
export function SimilarPlayers({ comps, positionGroup, opponentNickname }: SimilarPlayersProps) {
  const summary = summarizeComps(comps);
  const { averageDiff, averageDiffPct, hitRate } = summary;

  return (
    <Card className="space-y-4 p-4 sm:p-5" {...flashKey(standOutTargets.similar)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-fg">
          Similar {POSITION_GROUP_LABELS[positionGroup]} vs. {opponentNickname}
        </h3>
        {averageDiff !== null && averageDiffPct !== null ? (
          <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-inset px-3.5 py-2 font-mono text-xs">
            <div className="flex items-baseline gap-1">
              <dt className="text-[10px] text-fg-subtle">AVG DIFF:</dt>
              <dd className={cn("font-bold", toneClass(averageDiff > 0))}>{formatSigned(averageDiff)} PTS</dd>
            </div>
            <div className="flex items-baseline gap-1">
              <dt className="text-[10px] text-fg-subtle">DIFF %:</dt>
              <dd className={cn("font-bold", toneClass(averageDiffPct > 0))}>{signedPercent(averageDiffPct, 1)}</dd>
            </div>
            <div className="flex items-baseline gap-1">
              <dt className="text-[10px] text-fg-subtle">HIT RATE:</dt>
              <dd className={cn("font-bold", toneClass((hitRate.rate ?? 0) >= FAVORABLE_HIT_RATE))}>
                {formatHitRate(hitRate)} ({formatSample(hitRate)})
              </dd>
            </div>
          </dl>
        ) : null}
      </div>

      {summary.rows.length === 0 ? (
        <EmptyState
          title="No comparable games yet"
          description={`No similar player has faced the ${opponentNickname} with a posted points line this season.`}
          className="rounded-xl bg-inset py-8"
        />
      ) : (
        <ul className="space-y-2 text-xs">
          {summary.rows.map((row) => (
            <InsetRow key={`${row.date}:${row.playerName}`} density="compact">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="w-12 shrink-0 font-mono text-[10px] text-fg-subtle">{formatMonthDay(row.date)}</span>
                <PlayerAvatar name={row.playerName} headshotKey={row.headshotKey} className="size-6" />
                <span className="truncate font-medium text-fg">
                  {row.playerName} <span className="font-mono text-fg-subtle">({row.teamAbbr})</span>
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2.5 font-mono sm:gap-4">
                <span className="hidden text-fg-muted sm:inline">Line {row.line}</span>
                <span className="font-bold text-fg">{row.actual} PTS</span>
                <Badge tone={row.hit ? "good" : "bad"} className="font-bold">
                  {formatSigned(row.diff)} ({signedPercent(row.diffPct)})
                </Badge>
              </div>
            </InsetRow>
          ))}
        </ul>
      )}
    </Card>
  );
}
