import { gradeRank } from "@/lib/research/grades";
import { computeHitRate } from "@/lib/research/hitRate";
import { formatSpread } from "@/lib/research/odds";
import { STAT_FAMILIES, getStatValue } from "@/lib/research/stats";
import { getDataset, type Dataset } from "./generate/dataset";
import type { TrendKey } from "./generate/lines";
import type {
  Game,
  GameInjuries,
  GameLines,
  GameMatchup,
  GameRoster,
  GameRosters,
  LeaderCategory,
  LeaderRow,
  League,
  NavIndex,
  Player,
  PlayerGameLogEntry,
  PlayerResearch,
  RotationPlayer,
  SlateDate,
  SlateGamePlayers,
  StatAverages,
  StatId,
  StatWindow,
} from "./types";

/**
 * The only door between the UI and the data.
 *
 * Pages call these functions and nothing else in src/data. Today they read
 * the in-memory mock dataset. When the backend exists, each body becomes a
 * fetch to the matching endpoint and the signatures stay the same, so no
 * page or component changes. Every function is async for that reason.
 */

function dataset(leagueId: string): Dataset | null {
  const data = getDataset();
  return data.league.id === leagueId ? data : null;
}

const round1 = (value: number) => Math.round(value * 10) / 10;

function averagesOf(log: readonly PlayerGameLogEntry[]): StatAverages {
  const mean = (pick: (game: PlayerGameLogEntry) => number) =>
    log.length === 0 ? 0 : round1(log.reduce((sum, game) => sum + pick(game), 0) / log.length);
  return { pts: mean((g) => g.pts), reb: mean((g) => g.reb), ast: mean((g) => g.ast) };
}

function rotationPlayer(data: Dataset, player: Player): RotationPlayer {
  const log = data.gameLogs.get(player.id) ?? [];
  const featuredProp = data.props.get(player.id)?.find((prop) => prop.isFeatured) ?? null;
  const averages: Record<StatWindow, StatAverages> = {
    l3: averagesOf(log.slice(-3)),
    l5: averagesOf(log.slice(-5)),
    season: averagesOf(log),
  };
  let featuredHits: RotationPlayer["featuredHits"] = null;
  if (featuredProp) {
    const hitRate = computeHitRate(
      log.map((game) => getStatValue(game, featuredProp.stat)),
      featuredProp.line,
    );
    featuredHits = { hits: hitRate.hits, total: hitRate.total };
  }
  return { player, averages, featuredProp, featuredHits };
}

function gameRoster(data: Dataset, abbr: string): GameRoster {
  const players = (data.rosters.get(abbr) ?? []).map((player) => rotationPlayer(data, player));
  return {
    team: data.teams.get(abbr)!,
    starters: players.filter((entry) => entry.player.role === "starter"),
    bench: players.filter((entry) => entry.player.role === "bench"),
    injuries: data.injuries.get(abbr) ?? [],
  };
}

function gameRosters(data: Dataset, game: Game): GameRosters {
  return {
    gameId: game.id,
    lineupStatus: "confirmed",
    away: gameRoster(data, game.away.team.abbr),
    home: gameRoster(data, game.home.team.abbr),
  };
}

function findGame(data: Dataset, gameId: string): Game | null {
  return data.games.find((game) => game.id === gameId) ?? null;
}

// ---------------------------------------------------------------------------
// League and slate
// ---------------------------------------------------------------------------

export async function getLeague(leagueId: string): Promise<League | null> {
  return dataset(leagueId)?.league ?? null;
}

export async function getSlateDates(leagueId: string): Promise<SlateDate[]> {
  const data = dataset(leagueId);
  if (!data) return [];
  return data.slateDates.map((date) => ({
    date,
    isToday: date === data.slateDate,
    gameCount: data.games.filter((game) => game.date === date).length,
  }));
}

/** Games on a date, in tip-off order. Defaults to the current slate. */
export async function getSlate(leagueId: string, date?: string): Promise<Game[]> {
  const data = dataset(leagueId);
  if (!data) return [];
  const target = date ?? data.slateDate;
  return data.games.filter((game) => game.date === target);
}

export async function listGameIds(leagueId: string): Promise<string[]> {
  return dataset(leagueId)?.games.map((game) => game.id) ?? [];
}

export async function listPlayerIds(leagueId: string): Promise<string[]> {
  const data = dataset(leagueId);
  return data ? [...data.players.keys()] : [];
}

// ---------------------------------------------------------------------------
// Game detail
// ---------------------------------------------------------------------------

export async function getGame(leagueId: string, gameId: string): Promise<Game | null> {
  const data = dataset(leagueId);
  return data ? findGame(data, gameId) : null;
}

export async function getGamePlayers(leagueId: string, gameId: string): Promise<GameRosters | null> {
  const data = dataset(leagueId);
  const game = data && findGame(data, gameId);
  return data && game ? gameRosters(data, game) : null;
}

export async function getGameMatchup(leagueId: string, gameId: string): Promise<GameMatchup | null> {
  const data = dataset(leagueId);
  const game = data && findGame(data, gameId);
  if (!data || !game) return null;
  const rosters = gameRosters(data, game);

  // The shortcut opens the starter with the best-graded featured prop.
  const spotlight = [...rosters.home.starters, ...rosters.away.starters]
    .filter((entry) => entry.featuredProp)
    .sort((a, b) => gradeRank(a.featuredProp!.grade) - gradeRank(b.featuredProp!.grade))[0];

  return {
    rosters,
    comparison: {
      away: data.teamProfiles.get(game.away.team.abbr)!,
      home: data.teamProfiles.get(game.home.team.abbr)!,
    },
    spotlightPlayer: spotlight?.player ?? null,
  };
}

export async function getGameLines(leagueId: string, gameId: string): Promise<GameLines | null> {
  return dataset(leagueId)?.gameLines.get(gameId) ?? null;
}

export async function getGameInjuries(leagueId: string, gameId: string): Promise<GameInjuries | null> {
  const data = dataset(leagueId);
  const game = data && findGame(data, gameId);
  if (!data || !game) return null;
  const side = (abbr: string) => ({ team: data.teams.get(abbr)!, entries: data.injuries.get(abbr) ?? [] });
  return { gameId, away: side(game.away.team.abbr), home: side(game.home.team.abbr) };
}

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

export async function getPlayer(leagueId: string, playerId: string): Promise<Player | null> {
  return dataset(leagueId)?.players.get(playerId) ?? null;
}

/** Everything the player research page needs, in one call. */
export async function getPlayerResearch(leagueId: string, playerId: string): Promise<PlayerResearch | null> {
  const data = dataset(leagueId);
  const player = data?.players.get(playerId);
  if (!data || !player) return null;

  const abbr = player.teamId.toUpperCase();
  const game = data.gameByTeam.get(abbr);
  const upcoming = data.upcoming.get(playerId);
  const shotProfile = data.shotProfiles.get(playerId);
  if (!game || !upcoming || !shotProfile) return null;

  const isHome = game.home.team.abbr === abbr;
  const teammateOut =
    (data.injuries.get(abbr) ?? []).find((entry) => entry.status === "OUT" && upcoming.teammatesOut.includes(entry.id)) ?? null;

  return {
    player,
    team: data.teams.get(abbr)!,
    opponent: isHome ? game.away.team : game.home.team,
    game,
    isHome,
    props: data.props.get(playerId) ?? [],
    gameLog: data.gameLogs.get(playerId) ?? [],
    upcoming,
    shotProfile,
    similar: data.similar.get(playerId) ?? [],
    teammateOut,
    rosters: gameRosters(data, game),
  };
}

/** Every player on the slate, grouped by game. */
export async function getSlatePlayers(leagueId: string): Promise<SlateGamePlayers[]> {
  const data = dataset(leagueId);
  if (!data) return [];
  return data.games.map((game) => ({ game, rosters: gameRosters(data, game) }));
}

// ---------------------------------------------------------------------------
// Hit-rate leaders
// ---------------------------------------------------------------------------

const LEADER_CATEGORY: Partial<Record<StatId, LeaderCategory>> = {
  PTS: "PTS",
  REB: "REB",
  AST: "AST",
  "3PM": "3PM",
  PA: "COMBO",
  PR: "COMBO",
  RA: "COMBO",
  PRA: "COMBO",
};

/** Props need a real sample and a meaningful line to be ranked. */
const MIN_LEADER_SAMPLE = 8;
const MIN_LEADER_MINUTES = 20;
const MIN_LEADER_LINE = 1.5;

/**
 * Tonight's props and game lines ranked by season hit rate, best first.
 * Computed from the same game logs the player pages show, so a leader's
 * numbers always match what its research page says.
 */
export async function getLeaders(leagueId: string): Promise<LeaderRow[]> {
  const data = dataset(leagueId);
  if (!data) return [];
  const rows: LeaderRow[] = [];

  for (const player of data.players.values()) {
    const log = data.gameLogs.get(player.id) ?? [];
    const upcoming = data.upcoming.get(player.id);
    const team = data.teams.get(player.teamId.toUpperCase());
    if (!upcoming || !team || log.length < MIN_LEADER_SAMPLE) continue;
    const minutes = log.reduce((sum, game) => sum + game.min, 0) / log.length;
    if (minutes < MIN_LEADER_MINUTES) continue;

    for (const prop of data.props.get(player.id) ?? []) {
      const category = LEADER_CATEGORY[prop.stat];
      if (!category || prop.line < MIN_LEADER_LINE) continue;
      const results = log.map((game) => getStatValue(game, prop.stat) > prop.line);
      const hitRate = computeHitRate(
        log.map((game) => getStatValue(game, prop.stat)),
        prop.line,
      );
      const label = `Over ${prop.line} ${STAT_FAMILIES[prop.stat].shortLabel}`;
      rows.push({
        id: `prop:${player.id}:${prop.stat}:over:${prop.line}`,
        kind: "player",
        category,
        name: player.name,
        team,
        headshotKey: player.headshotKey,
        matchupLabel: `${upcoming.isHome ? "vs" : "@"} ${upcoming.opponentAbbr}`,
        propLabel: label,
        slipTitle: `${player.name} ${label}`,
        slipSubtitle: `${hitRate.hits}/${hitRate.total} this season`,
        hits: hitRate.hits,
        sample: hitRate.total,
        lastFive: results.slice(-5),
        price: prop.over.price,
        book: prop.over.book,
        grade: prop.grade,
        target: { kind: "player", playerId: player.id, stat: prop.stat },
      });
    }
  }

  for (const game of data.games) {
    const lines = data.gameLines.get(game.id);
    if (!lines) continue;
    const matchup = `${game.away.team.abbr} @ ${game.home.team.abbr}`;

    for (const offer of [...lines.spread, ...lines.total]) {
      const isSpread = offer.market === "spread";
      const sideTeam = offer.side === "away" ? game.away.team : game.home.team;
      const team = isSpread ? sideTeam : game.home.team;
      const trendKey: TrendKey = isSpread ? "ats" : "over";
      const raw = data.trends.get(team.abbr)?.[trendKey] ?? [];
      const results = offer.side === "under" ? raw.map((hit) => !hit) : raw;
      const line = isSpread ? formatSpread(game.markets.spread[offer.side as "away" | "home"].line ?? 0) : "";
      rows.push({
        id: offer.id,
        kind: "team",
        category: "TEAM",
        name: isSpread ? sideTeam.fullName : matchup,
        team,
        headshotKey: null,
        matchupLabel: isSpread ? `${offer.side === "home" ? "vs" : "@"} ${(offer.side === "home" ? game.away : game.home).team.abbr}` : "Game total",
        propLabel: isSpread ? `${sideTeam.abbr} ${line} Spread` : offer.title,
        slipTitle: offer.slipTitle,
        slipSubtitle: `${offer.trend.wins}-${offer.trend.losses} ${offer.trend.label}`,
        hits: offer.trend.wins,
        sample: offer.trend.wins + offer.trend.losses,
        lastFive: results.slice(-5),
        price: offer.price,
        book: offer.book,
        grade: null,
        target: { kind: "game", gameId: game.id },
      });
    }
  }

  return rows.sort((a, b) => {
    const rate = b.hits / b.sample - a.hits / a.sample;
    if (rate !== 0) return rate;
    if (b.sample !== a.sample) return b.sample - a.sample;
    return a.id.localeCompare(b.id);
  });
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export async function getNavIndex(leagueId: string): Promise<NavIndex> {
  const data = dataset(leagueId);
  if (!data) return { games: [], players: [], todayGameCount: 0 };
  return {
    games: data.games.map((game) => ({
      id: game.id,
      label: `${game.away.team.abbr} @ ${game.home.team.abbr}`,
      date: game.date,
    })),
    players: [...data.players.values()].map((player) => ({
      id: player.id,
      name: player.name,
      gameId: data.gameByTeam.get(player.teamId.toUpperCase())?.id ?? "",
    })),
    todayGameCount: data.games.filter((game) => game.date === data.slateDate).length,
  };
}
