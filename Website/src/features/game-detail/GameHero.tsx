import { Suspense } from "react";
import Link from "next/link";
import { TeamLogo } from "@/components/media/TeamLogo";
import { CONTROL_FILL } from "@/components/ui/Button";
import type { Game, GameTeam } from "@/data/types";
import { formatRecord, formatTipTime, formatWeekdayDate } from "@/lib/format";
import { formatOdds, formatSpread } from "@/lib/research/odds";
import { routes } from "@/lib/routes";
import { GameSwitcher, SectionTabs } from "./GameNav";

interface GameHeroProps {
  league: string;
  game: Game;
  /** Every game on the same slate, for the switcher. */
  slate: readonly Game[];
}

function TeamBlock({ side, entry }: { side: "Away" | "Home"; entry: GameTeam }) {
  const isHome = side === "Home";
  return (
    <div className={`flex min-w-0 items-center gap-2.5 sm:gap-3.5 ${isHome ? "flex-row-reverse text-right" : ""}`}>
      <TeamLogo team={entry.team} className="size-10 sm:size-12" />
      <div className="min-w-0">
        <div className="truncate text-base font-bold leading-tight tracking-tight text-fg sm:text-xl">
          {/* The full name only where the page column leaves room for the longest one beside the line. */}
          <span className="@6xl:hidden">{entry.team.nickname}</span>
          <span className="hidden @6xl:inline">{entry.team.fullName}</span>
        </div>
        <div className="mt-0.5 font-mono text-xs text-fg-muted">
          {formatRecord(entry.record)} · {side}
        </div>
      </div>
    </div>
  );
}

/** The banner at the top of every game page: teams, tip time, the main line and the section tabs. */
export function GameHero({ league, game, slate }: GameHeroProps) {
  const { away, home, markets } = game;
  const tipLine = `${formatTipTime(game.startsAt)} · ${formatWeekdayDate(game.date)} · ${game.network}`;
  const consensus = (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-canvas/90 px-3 py-1 font-mono text-[11px] text-fg-soft shadow-inner sm:gap-3 sm:px-4 sm:text-xs">
      <strong className="text-fg">
        {home.team.abbr} {formatSpread(markets.spread.home.line ?? 0)}
      </strong>
      <span className="text-fg-faint">·</span>
      <span>
        O/U <strong className="text-fg">{markets.total.over.line}</strong>
      </span>
      <span className="text-fg-faint">·</span>
      <span>
        ML{" "}
        <strong className="text-fg">
          {formatOdds(markets.moneyline.home.price)} / {formatOdds(markets.moneyline.away.price)}
        </strong>
      </span>
    </span>
  );

  return (
    <header className="relative shrink-0 overflow-hidden rounded-2xl bg-card shadow-xl">
      {/* Ambient glows in each team's colour */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 opacity-25"
        style={{ background: `radial-gradient(circle at 10% 35%, ${away.team.color}, transparent 70%)` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-25"
        style={{ background: `radial-gradient(circle at 90% 35%, ${home.team.color}, transparent 70%)` }}
      />

      <div className="relative px-4 pt-4 sm:px-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Link
            href={routes.games(league)}
            className={`flex shrink-0 select-none items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${CONTROL_FILL}`}
          >
            <span aria-hidden="true">‹</span>
            <span>
              Back<span className="hidden sm:inline"> to Slate</span>
            </span>
          </Link>
          <Suspense fallback={null}>
            <GameSwitcher
              league={league}
              activeGameId={game.id}
              games={slate.map((item) => ({ id: item.id, label: `${item.away.team.abbr}@${item.home.team.abbr}` }))}
            />
          </Suspense>
        </div>

        <h1 className="sr-only">
          {away.team.fullName} at {home.team.fullName}
        </h1>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 py-1.5">
          <TeamBlock side="Away" entry={away} />
          <div className="flex flex-col items-center text-center">
            <div className="hidden font-mono text-xs font-medium text-fg-soft md:block">{tipLine}</div>
            <div className="font-mono text-xs text-fg-subtle md:hidden">@</div>
            <div className="mt-2 hidden md:block">{consensus}</div>
          </div>
          <TeamBlock side="Home" entry={home} />
        </div>

        {/* On phones the tip time and line sit under the teams. */}
        <div className="flex flex-col items-center gap-1.5 pb-1 pt-2 md:hidden">
          <div className="font-mono text-[11px] text-fg-soft">{tipLine}</div>
          {consensus}
        </div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <Suspense fallback={<div className="h-10" />}>
            <SectionTabs league={league} gameId={game.id} />
          </Suspense>
          <div className="hidden shrink-0 py-1 font-mono text-xs text-fg-muted sm:block">
            {game.venue.name} · {game.venue.city}
          </div>
        </div>
      </div>
    </header>
  );
}
