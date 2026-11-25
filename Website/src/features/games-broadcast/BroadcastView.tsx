import Link from "next/link";
import { TeamLogo } from "@/components/media/TeamLogo";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Game, SlateDate } from "@/data/types";
import { formatWeekdayDate } from "@/lib/format";
import { formatOdds } from "@/lib/research/odds";
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
  const rest = games.filter((game) => game.id !== hero?.id);

  return (
    <div className="flex h-full flex-col bg-charcoal text-warm">
      {games.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6">
          <EmptyState
            title={`No games posted for ${selected && !selected.isToday ? formatWeekdayDate(selected.date) : "this date"}`}
            description="Lines appear here once the books post them, usually the evening before."
            className="max-w-md"
          />
        </div>
      ) : (
        hero && <HeroGame league={league} game={hero} dates={dates} selectedDate={selectedDate} onSelectDate={onSelectDate} />
      )}

      {/* The rest of tonight's games, along the bottom. */}
      {rest.length > 0 && (
      <nav aria-label="Rest of the slate" className="shrink-0 border-t border-white/10">
        <div className="no-scrollbar flex gap-1 overflow-x-auto px-4 py-2">
          {toStripRows(rest).map((row) => (
            <Link
              key={row.gameId}
              href={routes.game(league, row.gameId)}
              className="group flex shrink-0 items-baseline gap-2 rounded-lg px-3 py-2 transition hover:bg-white/[0.04]"
            >
              <span className="font-mono text-xs tracking-wide text-warm">{row.label}</span>
              <span className="font-mono text-[10px] text-warm-muted">{row.spreadLine}</span>
              <span className="font-mono text-[10px] text-warm-muted">{row.tipTime.replace(" ET", "")}</span>
            </Link>
          ))}
        </div>
      </nav>
      )}
    </div>
  );
}

function HeroGame({
  league,
  game,
  dates,
  selectedDate,
  onSelectDate,
}: {
  league: string;
  game: Game;
  dates: readonly SlateDate[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const view = toBroadcastGame(game);
  const total = game.markets.total.over;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-6">
      {/* The date, alone at the top; a switcher only when there is more than one date. */}
      <div className="absolute inset-x-0 top-6 flex justify-center">
        {dates.length > 1 ? (
          <div className="flex gap-4">
            {dates.map((entry) => {
              const active = entry.date === selectedDate;
              return (
                <button
                  key={entry.date}
                  type="button"
                  aria-label={entry.isToday ? "Today" : formatWeekdayDate(entry.date)}
                  onClick={() => onSelectDate(entry.date)}
                  className={`font-mono text-[11px] uppercase tracking-[0.2em] transition ${
                    active ? "text-accent" : "text-warm-muted hover:text-warm"
                  }`}
                >
                  {entry.isToday ? "Today" : formatWeekdayDate(entry.date)}
                </button>
              );
            })}
          </div>
        ) : (
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-warm-muted">
            {dates[0] && (dates[0].isToday ? "Today" : formatWeekdayDate(dates[0].date))}
          </span>
        )}
      </div>

      <p className="mb-10 font-mono text-xs uppercase tracking-[0.25em] text-warm-muted">
        {view.tipTime} · {view.network}
      </p>

      {/* Team names and the spread: the largest type on the screen. */}
      <div className="flex w-full max-w-5xl items-center justify-between gap-6 sm:gap-12">
        <TeamSide league={league} team={view.away} gameId={game.id} logoKey={game.away.team.logoKey} />
        <div className="shrink-0 text-center">
          <div className="font-mono text-6xl font-light tracking-tight text-warm sm:text-8xl">
            {view.away.spreadLine}
            <span className="mx-1 text-warm-muted/50">/</span>
            {view.home.spreadLine}
          </div>
          <div className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-warm-muted">Spread</div>
        </div>
        <TeamSide league={league} team={view.home} gameId={game.id} logoKey={game.home.team.logoKey} />
      </div>

      {/* The stand-out: one line under the hero matchup. */}
      <div className="mt-14 space-y-4 text-center">
        {view.call ? (
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-warm-muted">
            <span className="mr-2 inline-block rounded bg-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-charcoal">
              Call
            </span>
            {view.call}
          </p>
        ) : null}
        {/* Moneyline and total sit under the spread, smaller. */}
        <p className="font-mono text-sm text-warm">
          ML {view.away.moneylinePrice} <span className="text-warm-muted">/</span> {view.home.moneylinePrice}
          <span className="mx-3 text-warm-muted">·</span>
          O/U {total.line ?? 0} <span className="text-warm-muted">({formatOdds(total.price)})</span>
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-warm-muted">{view.venue}</p>
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
  team: { abbr: string; city: string; nickname: string; record: string };
  gameId: string;
  logoKey: string | null;
}) {
  return (
    <Link href={routes.game(league, gameId)} className="group flex min-w-0 flex-1 flex-col items-center gap-5 text-center">
      <TeamLogo team={{ abbr: team.abbr, logoKey }} className="size-14 rounded-xl border-white/10 sm:size-20" />
      <div className="min-w-0">
        {/* Full team name stacked: city above nickname, the largest type on the screen. */}
        <div className="truncate text-2xl font-semibold leading-tight tracking-tight text-warm sm:text-5xl">{team.city}</div>
        <div className="truncate text-2xl font-semibold leading-tight tracking-tight text-warm sm:text-5xl">{team.nickname}</div>
        <div className="mt-2 font-mono text-xs text-warm-muted">{team.record}</div>
      </div>
    </Link>
  );
}
