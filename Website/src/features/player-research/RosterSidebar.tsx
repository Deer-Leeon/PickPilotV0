import Link from "next/link";
import { PlayerAvatar } from "@/components/media/PlayerAvatar";
import { GradeBadge } from "@/components/ui/Badge";
import type { Game, GameRoster, GameRosters, RotationPlayer } from "@/data/types";
import { cn } from "@/lib/cn";
import { formatTipTime } from "@/lib/format";
import { formatPropLine } from "@/lib/research/stats";
import { routes } from "@/lib/routes";

interface RosterListProps {
  league: string;
  rosters: GameRosters;
  activePlayerId: string;
  /** Called when a player is picked, so a sheet can close itself. */
  onNavigate?: () => void;
}

function RosterItem({ league, entry, active, onNavigate }: { league: string; entry: RotationPlayer; active: boolean; onNavigate?: () => void }) {
  const { player, featuredProp } = entry;
  return (
    <li>
      <Link
        href={routes.player(league, player.id, featuredProp ? { stat: featuredProp.stat } : undefined)}
        aria-current={active ? "page" : undefined}
        onClick={onNavigate}
        className={cn(
          // Plain rows; only the player on screen is filled.
          "flex w-full items-center justify-between gap-2 rounded-xl p-2 transition",
          active ? "bg-active text-fg" : "text-fg-soft hover:bg-white/[0.07] hover:text-fg",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <PlayerAvatar name={player.name} headshotKey={player.headshotKey} className="size-7" />
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold">{player.name}</span>
            <span className="block font-mono text-[10px] text-fg-muted">
              {featuredProp ? formatPropLine(featuredProp.line, featuredProp.stat) : player.position}
            </span>
          </span>
        </span>
        {featuredProp ? <GradeBadge grade={featuredProp.grade} /> : null}
      </Link>
    </li>
  );
}

function TeamGroup({ roster, ...rest }: { roster: GameRoster } & Omit<RosterListProps, "rosters">) {
  const item = (entry: RotationPlayer) => (
    <RosterItem
      key={entry.player.id}
      league={rest.league}
      entry={entry}
      active={entry.player.id === rest.activePlayerId}
      onNavigate={rest.onNavigate}
    />
  );
  return (
    <section>
      <h3 className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-fg-subtle">{roster.team.fullName}</h3>
      <ul className="space-y-1">{roster.starters.map(item)}</ul>
      <h4 className="px-2 pb-1 pt-2.5 font-mono text-[9px] uppercase tracking-wider text-fg-faint">Bench</h4>
      <ul className="space-y-1">{roster.bench.map(item)}</ul>
    </section>
  );
}

/** Both rotations of the player's game, the player's own team first. */
export function RosterList({ rosters, activePlayerId, ...rest }: RosterListProps) {
  const inHome = [...rosters.home.starters, ...rosters.home.bench].some((entry) => entry.player.id === activePlayerId);
  const ordered = inHome ? [rosters.home, rosters.away] : [rosters.away, rosters.home];
  return (
    <div className="space-y-4">
      {ordered.map((roster) => (
        <TeamGroup key={roster.team.id} roster={roster} activePlayerId={activePlayerId} {...rest} />
      ))}
    </div>
  );
}

interface RosterSidebarProps extends RosterListProps {
  game: Game;
  className?: string;
}

/** Left column on wide screens: jump between the players of tonight's game. */
export function RosterSidebar({ game, className, ...list }: RosterSidebarProps) {
  return (
    <aside aria-label="Game roster" className={cn("w-60 shrink-0 flex-col bg-panel", className)}>
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 pb-1 pt-3.5">
        <Link
          href={routes.game(list.league, game.id, "players")}
          className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-fg-soft transition hover:text-fg"
        >
          <span aria-hidden="true">←</span>
          <span className="truncate">
            {game.away.team.abbr} @ {game.home.team.abbr} Roster
          </span>
        </Link>
        <span className="shrink-0 font-mono text-[10px] text-fg-subtle">{formatTipTime(game.startsAt).replace(" ET", "")}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2.5">
        <RosterList {...list} />
      </div>
    </aside>
  );
}
