import type { BookId, Game, GameLineOffer, LeaderRow, StatId } from "@/data/types";
import { formatTipTime } from "@/lib/format";
import { formatSpread } from "@/lib/research/odds";
import { STAT_FAMILIES } from "@/lib/research/stats";
import { routes } from "@/lib/routes";
import type { SlipLeg } from "./slipStore";

/**
 * Builders for slip legs. Every screen that can add to the slip goes through
 * these, so ids, wording and links stay the same wherever a pick comes from.
 */

const matchupLabel = (game: Game) => `${game.away.team.abbr} @ ${game.home.team.abbr}`;

interface PropLegInput {
  league: string;
  playerId: string;
  playerName: string;
  stat: StatId;
  line: number;
  side: "over" | "under";
  price: number;
  book: BookId | null;
  /** "vs NYK" or "@ BOS" */
  matchup: string;
  hits?: number | null;
  sample?: number | null;
}

export function propLeg(input: PropLegInput): SlipLeg {
  const side = input.side === "over" ? "Over" : "Under";
  return {
    id: `prop:${input.playerId}:${input.stat}:${input.side}:${input.line}`,
    title: `${input.playerName} ${side} ${input.line} ${STAT_FAMILIES[input.stat].shortLabel}`,
    subtitle: input.matchup,
    price: input.price,
    book: input.book,
    hits: input.hits ?? null,
    sample: input.sample ?? null,
    href: routes.player(input.league, input.playerId, { stat: input.stat }),
  };
}

export type BoardMarket = "spread" | "moneyline" | "total";
export type BoardSide = "away" | "home" | "over" | "under";

/** A leg for one cell on a game card. Shares its id with the matching offer on the game lines page. */
export function boardLeg(league: string, game: Game, market: BoardMarket, side: BoardSide): SlipLeg | null {
  const subtitle = `${matchupLabel(game)} · ${formatTipTime(game.startsAt)}`;
  const href = routes.game(league, game.id, "lines");
  const base = { id: `${game.id}:${market}:${side}`, subtitle, hits: null, sample: null, href };

  if (market === "total" && (side === "over" || side === "under")) {
    const cell = game.markets.total[side];
    return { ...base, title: `${matchupLabel(game)} ${side === "over" ? "Over" : "Under"} ${cell.line}`, price: cell.price, book: cell.book };
  }
  if (side !== "away" && side !== "home") return null;
  const team = game[side].team;
  if (market === "spread") {
    const cell = game.markets.spread[side];
    return { ...base, title: `${team.nickname} ${formatSpread(cell.line ?? 0)} Spread`, price: cell.price, book: cell.book };
  }
  if (market === "moneyline") {
    const cell = game.markets.moneyline[side];
    return { ...base, title: `${team.nickname} Moneyline`, price: cell.price, book: cell.book };
  }
  return null;
}

/** A leg for an offer on the game lines page, with the trend behind it. */
export function offerLeg(league: string, game: Game, offer: GameLineOffer): SlipLeg {
  return {
    id: offer.id,
    title: offer.slipTitle,
    subtitle: `${matchupLabel(game)} · ${offer.trend.wins}-${offer.trend.losses} ${offer.trend.label}`,
    price: offer.price,
    book: offer.book,
    hits: offer.trend.wins,
    sample: offer.trend.wins + offer.trend.losses,
    href: routes.game(league, game.id, "lines"),
  };
}

/** A leg for a row on the leaders page. */
export function leaderLeg(league: string, row: LeaderRow): SlipLeg {
  return {
    id: row.id,
    title: row.slipTitle,
    subtitle: row.kind === "player" ? row.matchupLabel : row.slipSubtitle,
    price: row.price,
    book: row.book,
    hits: row.hits,
    sample: row.sample,
    href:
      row.target.kind === "player"
        ? routes.player(league, row.target.playerId, { stat: row.target.stat })
        : routes.game(league, row.target.gameId, "lines"),
  };
}
