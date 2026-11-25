import Link from "next/link";
import { PlayerAvatar } from "@/components/media/PlayerAvatar";
import { TeamLogo } from "@/components/media/TeamLogo";
import { PageColumn } from "@/components/shell/PageColumn";
import { GradeBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { GameRoster, RotationPlayer, SlateGamePlayers } from "@/data/types";
import { formatTipTime } from "@/lib/format";
import { formatOdds } from "@/lib/research/odds";
import { formatPropLine } from "@/lib/research/stats";
import { flashKey, standOutTargets } from "@/lib/research/standOuts/targets";
import { routes } from "@/lib/routes";

interface PlayerIndexProps {
  league: string;
  slate: readonly SlateGamePlayers[];
}

function PlayerRow({ league, entry }: { league: string; entry: RotationPlayer }) {
  const { player, featuredProp } = entry;
  return (
    <li>
      <Link
        href={routes.player(league, player.id, featuredProp ? { stat: featuredProp.stat } : undefined)}
        {...flashKey(standOutTargets.player(player.id))}
        className="flex items-center justify-between gap-2 rounded-xl bg-inset px-2.5 py-2 transition hover:bg-raised"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <PlayerAvatar name={player.name} headshotKey={player.headshotKey} className="size-7" />
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold text-fg">
              {player.name} <span className="font-mono text-[10px] font-normal text-fg-subtle">{player.position}</span>
            </span>
            <span className="block font-mono text-[10px] text-fg-muted">
              {featuredProp ? `${formatPropLine(featuredProp.line, featuredProp.stat)} · ${formatOdds(featuredProp.over.price)}` : "No props posted"}
            </span>
          </span>
        </span>
        {featuredProp ? <GradeBadge grade={featuredProp.grade} /> : null}
      </Link>
    </li>
  );
}

function TeamColumn({ league, roster }: { league: string; roster: GameRoster }) {
  return (
    <section className="min-w-0">
      <h3 className="mb-2 flex items-center gap-2 text-xs font-bold tracking-tight text-fg">
        <TeamLogo team={roster.team} className="size-5 rounded-md p-0.5" />
        {roster.team.fullName}
      </h3>
      <ul className="space-y-1.5">
        {[...roster.starters, ...roster.bench].map((entry) => (
          <PlayerRow key={entry.player.id} league={league} entry={entry} />
        ))}
      </ul>
    </section>
  );
}

/** Every player on tonight's slate, grouped by game: the way into prop research. */
export function PlayerIndex({ league, slate }: PlayerIndexProps) {
  return (
    <PageColumn>
      <header>
        <h1 className="text-xl font-bold tracking-tight text-fg">Player Props</h1>
        <p className="mt-1 text-xs text-fg-muted">
          Tonight&apos;s rotations with each player&apos;s featured line and grade. Pick a player to open their research.
        </p>
      </header>

      {slate.length === 0 ? (
        <Card>
          <EmptyState title="No games tonight" description="Player props appear here once the slate is posted." />
        </Card>
      ) : (
        slate.map(({ game, rosters }) => (
          <Card key={game.id} className="p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold tracking-tight text-fg">
                {game.away.team.nickname} <span className="font-normal text-fg-subtle">@</span> {game.home.team.nickname}
                <span className="ml-2.5 font-mono text-[11px] font-normal text-fg-muted">{formatTipTime(game.startsAt)}</span>
              </h2>
              <Link
                href={routes.game(league, game.id, "players")}
                className="shrink-0 whitespace-nowrap font-mono text-xs text-fg-muted transition hover:text-fg"
              >
                Full Rotation →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <TeamColumn league={league} roster={rosters.away} />
              <TeamColumn league={league} roster={rosters.home} />
            </div>
          </Card>
        ))
      )}
    </PageColumn>
  );
}
