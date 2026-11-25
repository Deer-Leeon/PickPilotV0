import type { Game } from "@/data/types";
import { formatRecord, formatTipTime } from "@/lib/format";
import { formatOdds, formatSpread, impliedProbability } from "@/lib/research/odds";

/**
 * The Broadcast concept screen: tonight's slate condensed to one hero game.
 * All of it is computed from the same `Game` rows the Games board renders;
 * nothing here is typed in.
 */

export interface BroadcastTeam {
  abbr: string;
  fullName: string;
  city: string;
  record: string;
  spreadLine: string;
  spreadPrice: string;
  moneylinePrice: string;
  /** Implied win probability for the moneyline, percent. */
  winProbability: number;
}

export interface BroadcastGame {
  id: string;
  tipTime: string;
  network: string;
  venue: string;
  spreadSummary: string;
  totalSummary: string;
  away: BroadcastTeam;
  home: BroadcastTeam;
  /** Which side the spread favours. */
  favouriteAbbr: string;
  /** The hero's one-line stand-out. Null when the game is too close to call. */
  call: string | null;
}

export interface BroadcastStripRow {
  gameId: string;
  label: string;
  tipTime: string;
  spreadLine: string;
}

const winProbability = (price: number) => Math.round(impliedProbability(price) * 100);

function teamView(
  game: Game,
  side: "away" | "home",
): BroadcastTeam {
  const entry = game[side];
  const spread = game.markets.spread[side];
  const moneyline = game.markets.moneyline[side];
  return {
    abbr: entry.team.abbr,
    fullName: entry.team.fullName,
    city: entry.team.city,
    record: formatRecord(entry.record),
    spreadLine: formatSpread(spread.line ?? 0),
    spreadPrice: formatOdds(spread.price),
    moneylinePrice: formatOdds(moneyline.price),
    winProbability: winProbability(moneyline.price),
  };
}

/** The hero game: tonight's game with the widest spread, tip-off order breaking ties. */
export function pickHeroGame(games: readonly Game[]): Game | null {
  let hero: Game | null = null;
  for (const game of games) {
    if (game.status !== "scheduled") continue;
    if (!hero || Math.abs(game.markets.spread.home.line ?? 0) > Math.abs(hero.markets.spread.home.line ?? 0)) {
      hero = game;
    }
  }
  return hero ?? games[0] ?? null;
}

/** The one-line stand-out under the hero matchup, computed from the odds. */
export function broadcastCall(game: Game): string | null {
  const { spread, moneyline } = game.markets;
  const line = spread.home.line;
  if (line === null) return null;

  // The story is the gap between the two moneyline probabilities.
  const homePct = winProbability(moneyline.home.price);
  const awayPct = winProbability(moneyline.away.price);
  const favourite = line < 0 ? game.home.team : game.away.team;
  const totalLine = game.markets.total.over.line;
  const points = Math.abs(line);

  if (line === 0) {
    return `Pick'em: the books rate this a coin flip, with the total at ${totalLine}`;
  }
  if (points >= 6) {
    return `${favourite.abbr} is a ${points}-point favourite — the widest gap on tonight's board`;
  }
  if (points <= 2) {
    return `A ${points}-point spread: the slimmest separation on the board, total at ${totalLine}`;
  }
  return `${favourite.abbr} by ${points} · the moneyline prices this ${Math.max(homePct, awayPct)}% to ${Math.min(homePct, awayPct)}%`;
}

export function toBroadcastGame(game: Game): BroadcastGame {
  const away = teamView(game, "away");
  const home = teamView(game, "home");
  const line = game.markets.spread.home.line ?? 0;
  const total = game.markets.total.over;
  return {
    id: game.id,
    tipTime: formatTipTime(game.startsAt),
    network: game.network,
    venue: game.venue.name,
    spreadSummary: `${line < 0 ? home.city : away.city} ${formatSpread(-line)} favourite` || "Pick'em",
    totalSummary: `Over/under ${total.line ?? 0}`,
    away,
    home,
    favouriteAbbr: line < 0 ? home.abbr : away.abbr,
    call: broadcastCall(game),
  };
}

export function toStripRows(games: readonly Game[]): BroadcastStripRow[] {
  return games.map((game) => ({
    gameId: game.id,
    label: `${game.away.team.abbr} @ ${game.home.team.abbr}`,
    tipTime: formatTipTime(game.startsAt),
    spreadLine: formatSpread(game.markets.spread.home.line ?? 0),
  }));
}
