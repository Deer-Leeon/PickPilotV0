import Link from "next/link";
import { PlayerAvatar } from "@/components/media/PlayerAvatar";
import { TeamLogo } from "@/components/media/TeamLogo";
import { Badge, GradeBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { GameRosters, MatchupPosition, RotationPlayer, StatWindow } from "@/data/types";
import { cn } from "@/lib/cn";
import { formatAverage, lastName } from "@/lib/format";
import { flashKey, standOutTargets } from "@/lib/research/standOuts/targets";
import { routes } from "@/lib/routes";

const POSITIONS: MatchupPosition[] = ["PG", "SG", "SF", "PF", "C"];

interface StartingLineupsProps {
  league: string;
  gameId: string;
  rosters: GameRosters;
  window: StatWindow;
  /** Player to outline in emerald: the one the research shortcut points to. */
  spotlightPlayerId: string | null;
}

interface StarterCardProps {
  league: string;
  entry: RotationPlayer;
  window: StatWindow;
  align: "left" | "right";
  spotlight: boolean;
}

/** One average. In a narrow card the label sits above the number, so a row never wraps for one player only. */
function StarterStat({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex flex-col whitespace-nowrap @sm:flex-row @sm:gap-1">
      <span>{label}</span>
      <strong className="font-semibold text-fg">{formatAverage(value)}</strong>
    </span>
  );
}

function StarterCard({ league, entry, window, align, spotlight }: StarterCardProps) {
  const { player, featuredProp } = entry;
  const averages = entry.averages[window];
  const mirrored = align === "right";

  return (
    <Link
      href={routes.player(league, player.id)}
      {...flashKey(standOutTargets.player(player.id))}
      className={cn(
        // Only the spotlight player is outlined. The border keeps its width so every tile is the same size.
        "flex min-w-0 flex-col justify-between gap-2 rounded-xl border bg-raised px-2 py-2 transition hover:bg-active @sm:px-3.5",
        spotlight ? "border-good/50" : "border-transparent",
      )}
    >
      <div className={cn("flex items-center justify-between gap-1.5 @sm:gap-2", mirrored && "flex-row-reverse")}>
        <div className={cn("flex min-w-0 items-center gap-1.5 @sm:gap-2.5", mirrored && "flex-row-reverse")}>
          <PlayerAvatar name={player.name} headshotKey={player.headshotKey} className="size-7" />
          <span className="truncate text-xs font-semibold text-fg @sm:text-[13px]">
            {/* The full name from the card width where two of the longest fit side by side. */}
            <span className="@[34rem]:hidden">{lastName(player.name)}</span>
            <span className="hidden @[34rem]:inline">{player.name}</span>
          </span>
        </div>
        {featuredProp ? <GradeBadge grade={featuredProp.grade} className="text-[11px]" /> : null}
      </div>
      <div className="flex items-center justify-between gap-1 font-mono text-[10px] text-fg-muted @sm:text-[11px]">
        <StarterStat label="PTS" value={averages.pts} />
        <StarterStat label="REB" value={averages.reb} />
        <StarterStat label="AST" value={averages.ast} />
      </div>
    </Link>
  );
}

/**
 * Both starting fives, position against position, with each starter's averages and prop grade.
 *
 * The card is a size container and its contents follow the card's width, not the
 * screen's: it is as narrow beside the comparison on a laptop as it is on a phone.
 */
export function StartingLineups({ league, gameId, rosters, window, spotlightPlayerId }: StartingLineupsProps) {
  const { away, home } = rosters;
  const out = [...home.injuries, ...away.injuries].filter((entry) => entry.status === "OUT");

  return (
    <Card className="@container flex min-h-0 flex-col px-4 py-4 shadow-lg sm:px-5">
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="whitespace-nowrap text-base font-bold tracking-tight text-fg">Starting Lineups</h2>
          <Badge
            tone={rosters.lineupStatus === "confirmed" ? "good" : "neutral"}
            className="rounded-md px-2 py-1 text-[11px]"
          >
            {rosters.lineupStatus === "confirmed" ? "✓ Confirmed" : "Projected"}
          </Badge>
        </div>
        <Link href={routes.game(league, gameId, "players")} className="whitespace-nowrap font-mono text-xs text-fg-muted transition hover:text-fg">
          <span className="hidden @sm:inline">Full </span>Rotation →
        </Link>
      </div>

      <div className="mb-2 grid shrink-0 grid-cols-[minmax(0,1fr)_1.5rem_minmax(0,1fr)] items-center gap-1.5 px-1 @sm:grid-cols-[minmax(0,1fr)_2.25rem_minmax(0,1fr)] @sm:gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <TeamLogo team={away.team} className="size-5 rounded-md p-0.5" />
          <span className="truncate text-xs font-bold tracking-tight text-fg"><span className="@sm:hidden">{away.team.nickname}</span><span className="hidden @sm:inline">{away.team.fullName}</span></span>
        </div>
        <div className="text-center font-mono text-[10px] uppercase text-fg-subtle">POS</div>
        <div className="flex min-w-0 items-center justify-end gap-2">
          <span className="truncate text-xs font-bold tracking-tight text-fg"><span className="@sm:hidden">{home.team.nickname}</span><span className="hidden @sm:inline">{home.team.fullName}</span></span>
          <TeamLogo team={home.team} className="size-5 rounded-md p-0.5" />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2">
        {POSITIONS.map((position, index) => {
          const awayStarter = away.starters[index];
          const homeStarter = home.starters[index];
          if (!awayStarter || !homeStarter) return null;
          return (
            <div key={position} className="grid flex-1 grid-cols-[minmax(0,1fr)_1.5rem_minmax(0,1fr)] items-stretch gap-1.5 @sm:grid-cols-[minmax(0,1fr)_2.25rem_minmax(0,1fr)] @sm:gap-2">
              <StarterCard
                league={league}
                entry={awayStarter}
                window={window}
                align="left"
                spotlight={awayStarter.player.id === spotlightPlayerId}
              />
              <div className="flex items-center justify-center">
                <span className="font-mono text-[10px] font-bold text-fg-muted @sm:text-[11px]">{position}</span>
              </div>
              <StarterCard
                league={league}
                entry={homeStarter}
                window={window}
                align="right"
                spotlight={homeStarter.player.id === spotlightPlayerId}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex shrink-0 flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <span className="text-fg-muted">Key Injuries Tonight:</span>
        {out.length === 0 ? (
          <span className="text-[11px] text-fg-subtle">None reported</span>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {out.map((entry) => (
              <span key={entry.id} className="rounded bg-bad/10 px-2 py-0.5 text-[11px] text-bad-fg">
                {lastName(entry.playerName)} ({entry.teamId.toUpperCase()} · OUT)
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
