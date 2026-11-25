import Link from "next/link";
import { PlayerAvatar } from "@/components/media/PlayerAvatar";
import { TeamLogo } from "@/components/media/TeamLogo";
import { GradeBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { LeaderRow } from "@/data/types";
import { AddToSlipButton } from "@/features/slip/AddToSlipButton";
import { leaderLeg } from "@/features/slip/legs";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";
import { FAVORABLE_HIT_RATE } from "@/lib/research/hitRate";
import { flashKey, standOutTargets } from "@/lib/research/standOuts/targets";
import type { RankedLeader } from "@/lib/research/leaders";
import { formatOdds } from "@/lib/research/odds";
import { routes } from "@/lib/routes";

interface LeadersTableProps {
  league: string;
  leaders: readonly RankedLeader[];
}

/**
 * One column template shared by the header and every row, so they always line up.
 *
 * It follows the page column's width, not the screen's. A narrower column gets
 * tighter columns and no Matchup column (MATCHUP_CELL hides it, and the matchup
 * moves under the name), so names and prop lines keep the room they need.
 */
const COLUMNS = cn(
  "gap-x-2 grid-cols-[2.25rem_minmax(0,1.5fr)_minmax(0,1.2fr)_4.25rem_6rem_6.5rem_2.75rem_2.25rem]",
  "@5xl:gap-x-3 @5xl:grid-cols-[3rem_minmax(0,1.5fr)_4.5rem_minmax(0,1.2fr)_5rem_10rem_7.5rem_3.5rem_2.25rem]",
);
const MATCHUP_CELL = "hidden @5xl:inline";

const hrefFor = (league: string, row: LeaderRow) =>
  row.target.kind === "player"
    ? routes.player(league, row.target.playerId, { stat: row.target.stat })
    : routes.game(league, row.target.gameId, "lines");

function Identity({ row, size }: { row: LeaderRow; size: string }) {
  return row.kind === "player" ? (
    <PlayerAvatar name={row.name} headshotKey={row.headshotKey} className={size} />
  ) : (
    <TeamLogo team={row.team} className={cn(size, "rounded-lg p-1")} />
  );
}

function LastFive({ results }: { results: readonly boolean[] }) {
  const hits = results.filter(Boolean).length;
  return (
    <span role="img" aria-label={`${hits} of the last ${results.length} hit`} className="flex items-center gap-1">
      {results.map((hit, index) => (
        <span key={index} className={cn("size-2.5 rounded-xs", hit ? "bg-good-fg" : "bg-bad")} />
      ))}
    </span>
  );
}

function HitRateBar({ row }: { row: LeaderRow }) {
  const rate = row.sample > 0 ? row.hits / row.sample : 0;
  const favorable = rate >= FAVORABLE_HIT_RATE;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-mono text-xs">
        <span className={cn("font-bold", favorable ? "text-good-fg" : "text-bad-fg")}>{formatPercent(rate)}</span>
        <span className="text-[11px] text-fg-muted">
          {row.hits}/{row.sample}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-inset">
        <div className={cn("h-full rounded-full", favorable ? "bg-good" : "bg-bad")} style={{ width: `${rate * 100}%` }} />
      </div>
    </div>
  );
}

function Odds({ row }: { row: LeaderRow }) {
  return (
    <span className="whitespace-nowrap rounded-lg bg-good/10 px-2.5 py-1 font-mono text-xs font-semibold text-good-fg">
      {formatOdds(row.price)} ({row.book})
    </span>
  );
}

/**
 * Tonight's props and team lines ranked by hit rate. A table where the page
 * column is wide enough for one and a list of cards where it is not. The whole
 * row opens the research behind it; the slip button sits above that link.
 */
export function LeadersTable({ league, leaders }: LeadersTableProps) {
  return (
    <>
      {/* Wide column: table. No header band and no row lines: spacing and the hover fill keep rows apart. */}
      <Card className="hidden overflow-hidden pb-2 shadow-xl @3xl:block">
        <div className={cn("grid items-center px-4 pb-2 pt-4 font-mono text-[10px] uppercase text-fg-subtle", COLUMNS)}>
          <span>Rank</span>
          <span>Player / Team</span>
          <span className={MATCHUP_CELL}>Matchup</span>
          <span>Prop Line</span>
          <span>Last 5</span>
          <span>Hit Rate</span>
          <span className="text-right">Best Odds</span>
          <span className="text-center">Edge</span>
          <span className="sr-only">Slip</span>
        </div>
        <ol className="text-xs">
          {leaders.map(({ rank, row }) => (
            <li key={row.id} className={cn("relative grid items-center px-4 py-3 transition hover:bg-white/[0.03]", COLUMNS)} {...flashKey(standOutTargets.leader(row.id))}>
              <span className="font-mono text-fg-muted">#{rank}</span>
              <div className="flex min-w-0 items-center gap-3">
                <Identity row={row} size="size-8" />
                <div className="min-w-0">
                  <Link href={hrefFor(league, row)} className="block truncate font-bold text-fg after:absolute after:inset-0">
                    {row.name}
                  </Link>
                  <div className="truncate font-mono text-[11px] text-fg-muted">
                    {row.team.abbr}
                    <span className="@5xl:hidden"> · {row.matchupLabel}</span>
                  </div>
                </div>
              </div>
              <span className={cn("whitespace-nowrap font-mono text-fg-soft", MATCHUP_CELL)}>{row.matchupLabel}</span>
              <span className="truncate font-mono font-bold text-fg">{row.propLabel}</span>
              <LastFive results={row.lastFive} />
              <HitRateBar row={row} />
              <span className="text-right">
                <Odds row={row} />
              </span>
              <span className="text-center">{row.grade ? <GradeBadge grade={row.grade} className="px-2 py-1 text-[11px]" /> : <span className="text-fg-faint">—</span>}</span>
              <AddToSlipButton variant="icon" leg={leaderLeg(league, row)} className="relative z-10" />
            </li>
          ))}
        </ol>
      </Card>

      {/* Narrow column: cards */}
      <ol className="space-y-3 @3xl:hidden">
        {leaders.map(({ rank, row }) => (
          <li key={row.id} {...flashKey(standOutTargets.leader(row.id))}>
            <Card className="relative space-y-3 p-3.5 transition hover:bg-raised">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-6 shrink-0 font-mono text-xs text-fg-muted">#{rank}</span>
                  <Identity row={row} size="size-9" />
                  <div className="min-w-0">
                    <Link href={hrefFor(league, row)} className="block truncate text-sm font-bold text-fg after:absolute after:inset-0">
                      {row.name}
                    </Link>
                    <div className="font-mono text-[11px] text-fg-muted">
                      {row.team.abbr} · {row.matchupLabel}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {row.grade ? <GradeBadge grade={row.grade} className="px-2 py-1 text-[11px]" /> : null}
                  <AddToSlipButton variant="icon" leg={leaderLeg(league, row)} className="relative z-10" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-mono text-xs font-bold text-fg">{row.propLabel}</span>
                <Odds row={row} />
              </div>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
                <LastFive results={row.lastFive} />
                <HitRateBar row={row} />
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </>
  );
}
