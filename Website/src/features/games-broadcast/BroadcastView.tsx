import Link from "next/link";
import { TeamLogo } from "@/components/media/TeamLogo";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Game, SlateDate } from "@/data/types";
import { formatWeekdayDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { pickHeroGame, toBroadcastGame, toStripRows } from "./broadcast";

interface BroadcastViewProps {
  league: string;
  dates: readonly SlateDate[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  games: readonly Game[];
}

/**
 * The Games screen as a broadcast slate: one hero matchup fills the screen,
 * the rest of the slate is a strip along the bottom. No rail, no cards, no
 * market columns — team names and the spread carry the screen.
 */
export function BroadcastView({ league, dates, selectedDate, onSelectDate, games }: BroadcastViewProps) {
  const selected = dates.find((entry) => entry.date === selectedDate);
  const hero = pickHeroGame(games);

  return (
    <div className="flex h-full flex-col bg-charcoal text-warm">
      {/* The rest of tonight's games, along the bottom. */}
      <nav aria-label="Rest of the slate" className="order-3 border-t border-white/10">
        <div className="no-scrollbar flex gap-1 overflow-x-auto px-4 py-2">
          {toStripRows(games).map((row) => (
            <Link
              key={row.gameId}
              href={routes.game(league, row.gameId)}
              className="group flex shrink-0 items-baseline gap-2 rounded-lg px-3 py-2 transition hover:bg-white/[0.04]"
            >
              <span className="font-mono text-xs tracking-wide text-warm group-hover:text-warm">{row.label}</span>
              <span className="font-mono text-[10px] text-warm-muted">{row.spreadLine}</span>
              <span className="font-mono text-[10px] text-warm-muted">{row.tipTime.replace(" ET", "")}</span>
            </Link>
          ))}
        </div>
      </nav>

      {games.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6">
          <EmptyState
            title={`No games posted for ${selected && !selected.isToday ? formatWeekdayDate(selected.date) : "this date"}`}
            description="Lines appear here once the books post them, usually the evening before."
            className="max-w-md text-warm"
          />
        </div>
      ) : (
        hero && <HeroGame league={league} game={hero} />
      )}
    </div>
  );
}

function HeroGame({ league, game }: { league: string; game: Game }) {
  const view = toBroadcastGame(game);
  const total = game.markets.total.over;

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6">
      {/* Date switcher, small and out of the way at the top. */}
      <div className="absolute inset-x-0 top-4 flex justify-center gap-2">
        {dates.map
          ? null
          : null}
      </div>

      <p className="mb-10 font-mono text-xs uppercase tracking-[0.25em] text-warm-muted">
        {view.tipTime} · {view.network}
      </p>

      <div className="flex w-full max-w-4xl items-center justify-between gap-6 sm:gap-12">
        <TeamSide
          league={league}
          team={view.away}
          gameId={game.id}
          logoKey={game.away.team.logoKey}
        />
        <div className="shrink-0 text-center">
          <div className="font-mono text-6xl font-light tracking-tight text-warm sm:text-7xl">
            {view.away.spreadLine}
            <span className="text-warm-muted">/</span>
            {view.home.spreadLine}
          </div>
          <div className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-warm-muted">Spread</div>
        </div>
        <TeamSide
          league={league}
          team={view.home}
          gameId={game.id}
          logoKey={game.home.team.logoKey}
        />
      </div>

      <div className="mt-12 space-y-3 text-center">
        {view.call ? (
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-warm-muted">
            <span className="mr-2 inline-block rounded bg-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-charcoal">
              Call
            </span>
            {view.call}
          </p>
        ) : null}
        <p className="font-mono text-xs text-warm-muted">
          ML {view.away.moneylinePrice} / {view.home.moneylinePrice} · O/U {total.line ?? 0} ({formatOdds(total.price)})
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-warm-muted">{view.venue}</p>
      </div>
    </div>
  );
}

function TeamSide({
  league,
  team,
  gameId,
  logoKey,
}: {
  league: string;
  team: { abbr: string; fullName: string; city: string; record: string };
  gameId: string;
  logoKey: string | null;
}) {
  return (
    <Link href={routes.game(league, gameId)} className="group flex min-w-0 flex-1 flex-col items-center gap-4 text-center">
      <TeamLogo team={{ abbr: team.abbr, logoKey }} className="size-14 rounded-xl sm:size-20" />
      <div>
        <div className="text-2xl font-semibold leading-tight tracking-tight text-warm sm:text-4xl">{team.city}</div>
        <div className="text-2xl font-semibold leading-tight tracking-tight text-warm sm:text-4xl">{team.nicknameOrCity}</div>
        <div className="mt-1 font-mono text-xs text-warm-muted">{team.record}</div>
      </div>
    </Link>
  );
}
