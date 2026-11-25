import type { BookId, Game, GameLineOffer, GameLines, MarketSide, Team, TrendRecord } from "@/data/types";
import { BOOKS, SLATE_DATE } from "@/data/fixtures/nba/league";
import type { GameSeed } from "@/data/fixtures/nba/slate";
import { formatSpread } from "@/lib/research/odds";
import { clamp, createRng } from "./rng";

export type TrendKey = "su" | "ats" | "over" | "h1Ats" | "q1Over";

/** Per-game results for each trend, oldest first. true = the team covered / the game went over. */
export type TeamTrends = Record<TrendKey, boolean[]>;

type TrendPins = Partial<Record<Exclude<TrendKey, "su">, [number, number]>>;

/**
 * Game-by-game trend results for a team. The win counts are pinned where the
 * prototype shows them and seeded otherwise; the order of wins and losses is
 * seeded so "last five" has something to show.
 */
export function buildTeamTrends(abbr: string, wins: number, losses: number, pins: TrendPins = {}): TeamTrends {
  const games = wins + losses;
  const rng = createRng(`trends:${abbr}`);
  const results = (count: number) => rng.shuffle(Array.from({ length: games }, (_, index) => index < count));
  const seeded = (key: Exclude<TrendKey, "su">) => {
    const pinned = pins[key];
    // A pin only applies when it adds up to the games the team has played.
    if (pinned && pinned[0] + pinned[1] === games) return results(pinned[0]);
    return results(clamp(Math.round(rng.normal(games * 0.5, 1.6)), 1, games - 1));
  };
  return {
    su: results(wins),
    ats: seeded("ats"),
    over: seeded("over"),
    h1Ats: seeded("h1Ats"),
    q1Over: seeded("q1Over"),
  };
}

export function trendRecord(results: readonly boolean[], label: string, invert = false): TrendRecord {
  const wins = results.filter(Boolean).length;
  const losses = results.length - wins;
  return invert ? { wins: losses, losses: wins, label } : { wins, losses, label };
}

/** The NYK @ BOS books are fixed to match the prototype. Other games are seeded. */
const BOOK_PINS: Record<string, { spread?: [BookId, BookId]; total?: [BookId, BookId] }> = {
  "nyk-bos": { spread: ["FD", "DK"], total: ["MGM", "PIN"] },
};

export function buildGame(seed: GameSeed, teams: ReadonlyMap<string, Team>): Game {
  const away = teams.get(seed.away)!;
  const home = teams.get(seed.home)!;
  const id = `${away.id}-${home.id}`;
  const rng = createRng(`books:${id}`);
  const pair = (pinned?: [BookId, BookId]): [BookId, BookId] => {
    const [first, second] = rng.shuffle(BOOKS);
    return pinned ?? [first, second];
  };
  const [spreadAwayBook, spreadHomeBook] = pair(BOOK_PINS[id]?.spread);
  const [mlAwayBook, mlHomeBook] = pair();
  const [overBook, underBook] = pair(BOOK_PINS[id]?.total);

  const side = (line: number | null, price: number, book: BookId, isBest: boolean): MarketSide => ({ line, price, book, isBest });

  return {
    id,
    leagueId: "nba",
    date: SLATE_DATE,
    startsAt: seed.startsAt,
    status: "scheduled",
    network: seed.network,
    venue: home.venue ?? { name: `${home.city} Arena`, city: home.city },
    away: { team: away, record: { wins: seed.awayRecord[0], losses: seed.awayRecord[1] } },
    home: { team: home, record: { wins: seed.homeRecord[0], losses: seed.homeRecord[1] } },
    markets: {
      spread: {
        away: side(-seed.spread.line, seed.spread.awayPrice, spreadAwayBook, seed.spread.best === "away"),
        home: side(seed.spread.line, seed.spread.homePrice, spreadHomeBook, seed.spread.best === "home"),
      },
      moneyline: {
        away: side(null, seed.moneyline.awayPrice, mlAwayBook, seed.moneyline.best === "away"),
        home: side(null, seed.moneyline.homePrice, mlHomeBook, seed.moneyline.best === "home"),
      },
      total: {
        over: side(seed.total.line, seed.total.overPrice, overBook, seed.total.best === "over"),
        under: side(seed.total.line, seed.total.underPrice, underBook, seed.total.best === "under"),
      },
    },
  };
}

/** Rounds to the nearest line ending in .5, the way books post derivative markets. */
function toHalfLine(value: number): number {
  return Math.round(value - 0.5) + 0.5;
}

const DERIVATIVE_PRICES = [-115, -112, -110, -110, -108, -105];

export function buildGameLines(game: Game, trends: ReadonlyMap<string, TeamTrends>): GameLines {
  const { away, home, markets } = game;
  const awayTrends = trends.get(away.team.abbr)!;
  const homeTrends = trends.get(home.team.abbr)!;
  const matchup = `${away.team.abbr} @ ${home.team.abbr}`;
  const rng = createRng(`lines:${game.id}`);

  const spreadOffer = (sideKey: "away" | "home"): GameLineOffer => {
    const { team } = game[sideKey];
    const market = markets.spread[sideKey];
    const line = formatSpread(market.line ?? 0);
    return {
      id: `${game.id}:spread:${sideKey}`,
      gameId: game.id,
      market: "spread",
      side: sideKey,
      title: `${team.abbr} ${team.nickname} ${line}`,
      slipTitle: `${team.nickname} ${line} Spread`,
      price: market.price,
      book: market.book,
      trend: trendRecord((sideKey === "away" ? awayTrends : homeTrends).ats, "ATS"),
      isBest: market.isBest,
    };
  };

  const totalOffer = (sideKey: "over" | "under"): GameLineOffer => {
    const market = markets.total[sideKey];
    const word = sideKey === "over" ? "Over" : "Under";
    return {
      id: `${game.id}:total:${sideKey}`,
      gameId: game.id,
      market: "total",
      side: sideKey,
      title: `${word} ${market.line} Points`,
      slipTitle: `${matchup} ${word} ${market.line}`,
      price: market.price,
      book: market.book,
      trend: trendRecord(homeTrends.over, "O/U", sideKey === "under"),
      isBest: market.isBest,
    };
  };

  const moneylineOffer = (sideKey: "away" | "home"): GameLineOffer => {
    const { team } = game[sideKey];
    const market = markets.moneyline[sideKey];
    return {
      id: `${game.id}:moneyline:${sideKey}`,
      gameId: game.id,
      market: "moneyline",
      side: sideKey,
      title: `${team.abbr} ${team.nickname} ML`,
      slipTitle: `${team.nickname} Moneyline`,
      price: market.price,
      book: market.book,
      trend: trendRecord((sideKey === "away" ? awayTrends : homeTrends).su, "SU"),
      isBest: market.isBest,
    };
  };

  // Derivatives: the favourite's first-half spread and the first-quarter total.
  const homeSpread = markets.spread.home.line ?? 0;
  const favourite: "away" | "home" = homeSpread <= 0 ? "home" : "away";
  const favouriteTeam = game[favourite].team;
  const halfLine = -toHalfLine(Math.abs(homeSpread) / 2);
  const quarterTotal = toHalfLine((markets.total.over.line ?? 0) / 4);
  const pinned = game.id === "nyk-bos";

  const derivatives: GameLineOffer[] = [
    {
      id: `${game.id}:h1_spread:${favourite}`,
      gameId: game.id,
      market: "h1_spread",
      side: favourite,
      title: `${favouriteTeam.abbr} 1st Half ${formatSpread(halfLine)}`,
      slipTitle: `${favouriteTeam.nickname} 1H ${formatSpread(halfLine)}`,
      price: pinned ? -110 : rng.pick(DERIVATIVE_PRICES),
      book: pinned ? "FD" : rng.pick(BOOKS),
      trend: trendRecord((favourite === "away" ? awayTrends : homeTrends).h1Ats, "1H ATS"),
      isBest: false,
    },
    {
      id: `${game.id}:q1_total:over`,
      gameId: game.id,
      market: "q1_total",
      side: "over",
      title: `1st Quarter Over ${quarterTotal}`,
      slipTitle: `${matchup} 1Q Over ${quarterTotal}`,
      price: pinned ? -108 : rng.pick(DERIVATIVE_PRICES),
      book: pinned ? "DK" : rng.pick(BOOKS),
      trend: trendRecord(homeTrends.q1Over, "1Q O/U"),
      isBest: false,
    },
  ];

  return {
    gameId: game.id,
    consensusTotal: markets.total.over.line ?? 0,
    spread: [spreadOffer("away"), spreadOffer("home")],
    total: [totalOffer("over"), totalOffer("under")],
    derivatives,
    moneyline: [moneylineOffer("away"), moneylineOffer("home")],
  };
}
