import Link from "next/link";
import { TeamLogo } from "@/components/media/TeamLogo";
import { ClockIcon } from "@/components/shell/icons";
import type { Game, MarketSide } from "@/data/types";
import { boardLeg, type BoardMarket, type BoardSide } from "@/features/slip/legs";
import { formatRecord, formatTipTime } from "@/lib/format";
import { formatOdds, formatSpread } from "@/lib/research/odds";
import { flashKey, standOutTargets } from "@/lib/research/standOuts/targets";
import { routes } from "@/lib/routes";
import { MarketCell } from "./MarketCell";

interface GameCardProps {
  league: string;
  game: Game;
}

/**
 * One game on the board: both teams with spread, moneyline and total.
 * The whole card opens the game; the odds cells sit above that link and add
 * to the slip instead.
 */
export function GameCard({ league, game }: GameCardProps) {
  const { markets } = game;

  const cell = (market: BoardMarket, side: BoardSide, data: MarketSide, primary: string, secondary: string) => {
    const leg = boardLeg(league, game, market, side);
    return leg ? <MarketCell primary={primary} secondary={secondary} isBest={data.isBest} leg={leg} /> : null;
  };

  const teamRow = (side: "away" | "home") => {
    const { team, record } = game[side];
    const spread = markets.spread[side];
    const moneyline = markets.moneyline[side];
    const totalSide = side === "away" ? "over" : "under";
    const total = markets.total[totalSide];
    return (
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-2 sm:grid-cols-2">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3" {...flashKey(standOutTargets.team(team.id))}>
          <TeamLogo team={team} className="size-9" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-fg">
              <span className="sm:hidden">{team.nickname}</span>
              <span className="hidden sm:inline">{team.fullName}</span>
            </div>
            <div className="font-mono text-[11px] text-fg-muted">{formatRecord(record)}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {cell("spread", side, spread, formatSpread(spread.line ?? 0), formatOdds(spread.price))}
          {cell("moneyline", side, moneyline, formatOdds(moneyline.price), "ML")}
          {cell("total", totalSide, total, `${totalSide === "over" ? "O" : "U"} ${total.line}`, formatOdds(total.price))}
        </div>
      </div>
    );
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-card shadow-lg transition hover:bg-raised">
      {/* Ambient glow in the away team's colour */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-64 opacity-25"
        style={{ background: `radial-gradient(circle at 0% 50%, ${game.away.team.color}, transparent 75%)` }}
      />

      <div className="relative p-4 sm:px-5">
        {/* No dividers: the two teams read as one block, the tip time sits below with a wider gap. */}
        <div className="space-y-3">
          {teamRow("away")}
          {teamRow("home")}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono text-[11px] text-fg-muted">
            <ClockIcon className="size-3.5 text-fg-subtle" />
            <span>{formatTipTime(game.startsAt)}</span>
            <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px]">{game.network}</span>
          </div>
          {/* The link's ::after covers the card, so the whole card is clickable. */}
          <Link
            href={routes.game(league, game.id)}
            aria-label={`Research ${game.away.team.fullName} at ${game.home.team.fullName}`}
            className="flex select-none items-center gap-1 text-xs font-medium text-fg-soft transition after:absolute after:inset-0 group-hover:text-fg"
          >
            <span>Research</span>
            <span aria-hidden="true" className="text-fg-muted transition group-hover:translate-x-0.5">
              ›
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
