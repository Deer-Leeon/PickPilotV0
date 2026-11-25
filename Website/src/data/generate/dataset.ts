import type {
  Game,
  GameLines,
  InjuryReportEntry,
  League,
  MatchupPosition,
  Player,
  PlayerGameLogEntry,
  PlayerProp,
  PlayerShotProfile,
  Position,
  PositionGroup,
  SimilarPlayerComp,
  Team,
  TeamProfile,
  UpcomingGameContext,
} from "@/data/types";
import { headshotKeyFor } from "@/data/fixtures/nba/headshots";
import { NBA, SLATE_DATE, SLATE_DATES } from "@/data/fixtures/nba/league";
import { RANK_PINS, TREND_PINS } from "@/data/fixtures/nba/pins";
import { NBA_ROSTERS, type BaseAverages, type PlayerSeed } from "@/data/fixtures/nba/rosters";
import { NBA_INJURIES, NBA_SLATE } from "@/data/fixtures/nba/slate";
import {
  TATUM_COMPS,
  TATUM_GAMES,
  TATUM_ID,
  TATUM_PLAY_TYPES,
  TATUM_PROPS,
  TATUM_SHOT_TYPES,
  TATUM_UPCOMING,
  TATUM_ZONES,
} from "@/data/fixtures/nba/tatum";
import { NBA_TEAMS, NBA_TEAM_ABBRS } from "@/data/fixtures/nba/teams";
import { buildGameLog, buildPinnedGameLog } from "./gameLogs";
import { buildGame, buildGameLines, buildTeamTrends, type TeamTrends } from "./lines";
import { buildProps, gradeProp } from "./props";
import { buildRankTables, buildTeamProfile, oppRanksFor, type RankTables } from "./ranks";
import { addDays, createRng, slugify } from "./rng";
import { buildSchedule, restBeforeSlate, type TeamGame } from "./schedule";
import { buildShotProfile } from "./shotProfile";

/**
 * The whole mock world, built once per process from the fixtures and the
 * seeded generator. Only src/data/repository.ts reads it.
 */
export interface Dataset {
  league: League;
  slateDate: string;
  slateDates: string[];
  /** Keyed by upper-case abbreviation. */
  teams: Map<string, Team>;
  games: Game[];
  /** Tonight's game for a team abbreviation. */
  gameByTeam: Map<string, Game>;
  players: Map<string, Player>;
  /** Team abbreviation -> players in depth order. */
  rosters: Map<string, Player[]>;
  baseAverages: Map<string, BaseAverages>;
  gameLogs: Map<string, PlayerGameLogEntry[]>;
  props: Map<string, PlayerProp[]>;
  upcoming: Map<string, UpcomingGameContext>;
  shotProfiles: Map<string, PlayerShotProfile>;
  similar: Map<string, SimilarPlayerComp[]>;
  injuries: Map<string, InjuryReportEntry[]>;
  teamProfiles: Map<string, TeamProfile>;
  trends: Map<string, TeamTrends>;
  gameLines: Map<string, GameLines>;
  rankTables: RankTables;
}

const GROUP_BY_POSITION: Record<Position, PositionGroup> = {
  PG: "guards",
  SG: "guards",
  G: "guards",
  SF: "wings",
  PF: "wings",
  F: "wings",
  C: "bigs",
};

/** Bench players are listed as G or F; matchup ranks need one of the five positions. */
function matchupPositionOf(seed: PlayerSeed): MatchupPosition {
  if (seed.position === "G") return seed.base.ast >= 3 ? "PG" : "SG";
  if (seed.position === "F") return seed.base.reb >= 5 ? "PF" : "SF";
  return seed.position;
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

const round1 = (value: number) => Math.round(value * 10) / 10;
const roundHalf = (value: number) => Math.round(value * 2) / 2;

function buildDataset(): Dataset {
  const teams = new Map(NBA_TEAMS.map((team) => [team.abbr, team]));
  const rankTables = buildRankTables(NBA_TEAM_ABBRS, RANK_PINS);
  const games = NBA_SLATE.map((seed) => buildGame(seed, teams));

  const gameByTeam = new Map<string, Game>();
  for (const game of games) {
    gameByTeam.set(game.away.team.abbr, game);
    gameByTeam.set(game.home.team.abbr, game);
  }

  // --- Injuries ---------------------------------------------------------------
  const injuries = new Map<string, InjuryReportEntry[]>();
  const missedLast = new Map<string, number | "all">();
  for (const seed of NBA_INJURIES) {
    const entry: InjuryReportEntry = {
      id: `inj-${slugify(seed.playerName)}`,
      teamId: seed.team.toLowerCase(),
      playerName: seed.playerName,
      position: seed.position,
      status: seed.status,
      injury: seed.injury,
      impactNote: seed.impactNote ?? null,
      headshotKey: headshotKeyFor(seed.playerName),
    };
    injuries.set(seed.team, [...(injuries.get(seed.team) ?? []), entry]);
    if (seed.status === "OUT" && seed.missedLastGames !== undefined) missedLast.set(entry.id, seed.missedLastGames);
  }

  // --- Schedules --------------------------------------------------------------
  const schedules = new Map<string, TeamGame[]>();
  for (const game of games) {
    for (const side of [game.away, game.home]) {
      const abbr = side.team.abbr;
      const opponent = side === game.away ? game.home.team.abbr : game.away.team.abbr;
      if (abbr === "BOS") {
        schedules.set(
          abbr,
          TATUM_GAMES.map((g) => ({ date: g.date, opponentAbbr: g.opp, isHome: g.isHome, restDays: g.rest })),
        );
        continue;
      }
      schedules.set(
        abbr,
        buildSchedule({
          team: abbr,
          gamesPlayed: side.record.wins + side.record.losses,
          tonightOpponent: opponent,
          allTeams: NBA_TEAM_ABBRS,
          slateDate: SLATE_DATE,
          // New York opened in Boston, which is Tatum's first game.
          opener: abbr === "NYK" ? { date: TATUM_GAMES[0].date, opponentAbbr: "BOS", isHome: false } : undefined,
        }),
      );
    }
  }

  /** For each of a team's games, the injured teammates who sat out. */
  const teammatesOutFor = (abbr: string): string[][] => {
    const schedule = schedules.get(abbr) ?? [];
    return schedule.map((_, index) =>
      (injuries.get(abbr) ?? [])
        .filter((entry) => {
          const missed = missedLast.get(entry.id);
          if (missed === undefined) return false;
          return missed === "all" || index >= schedule.length - missed;
        })
        .map((entry) => entry.id),
    );
  };

  // --- Players, game logs, props ---------------------------------------------
  const players = new Map<string, Player>();
  const rosters = new Map<string, Player[]>();
  const baseAverages = new Map<string, BaseAverages>();
  const gameLogs = new Map<string, PlayerGameLogEntry[]>();
  const props = new Map<string, PlayerProp[]>();
  const upcoming = new Map<string, UpcomingGameContext>();
  const shotProfiles = new Map<string, PlayerShotProfile>();

  for (const roster of NBA_ROSTERS) {
    const abbr = roster.team;
    const game = gameByTeam.get(abbr);
    const schedule = schedules.get(abbr);
    if (!game || !schedule) continue;
    const isHome = game.home.team.abbr === abbr;
    const opponentAbbr = isHome ? game.away.team.abbr : game.home.team.abbr;
    const teammatesOut = teammatesOutFor(abbr);
    const outTonight = (injuries.get(abbr) ?? []).filter((entry) => entry.status === "OUT").map((entry) => entry.id);
    const list: Player[] = [];

    const seeds = [
      ...roster.starters.map((seed, index) => ({ seed, role: "starter" as const, depthOrder: index })),
      ...roster.bench.map((seed, index) => ({ seed, role: "bench" as const, depthOrder: roster.starters.length + index })),
    ];

    for (const { seed, role, depthOrder } of seeds) {
      const player: Player = {
        id: slugify(seed.name),
        leagueId: "nba",
        teamId: abbr.toLowerCase(),
        name: seed.name,
        position: seed.position,
        matchupPosition: matchupPositionOf(seed),
        positionGroup: GROUP_BY_POSITION[seed.position],
        role,
        depthOrder,
        headshotKey: headshotKeyFor(seed.name),
      };
      const isTatum = player.id === TATUM_ID;
      list.push(player);
      players.set(player.id, player);
      baseAverages.set(player.id, seed.base);

      // Game log
      let log: PlayerGameLogEntry[];
      if (isTatum) {
        log = buildPinnedGameLog(player.id, player.matchupPosition, TATUM_GAMES, teammatesOut, rankTables);
      } else {
        const missed = new Set(
          createRng(`missed:${player.id}`)
            .shuffle(schedule.map((_, index) => index))
            .slice(0, seed.gamesMissed ?? 0),
        );
        log = buildGameLog({
          playerId: player.id,
          matchupPosition: player.matchupPosition,
          base: seed.base,
          schedule,
          missed,
          teammatesOut,
          tables: rankTables,
          target: seed.featured,
        });
      }
      gameLogs.set(player.id, log);

      // Props
      if (isTatum) {
        props.set(
          player.id,
          TATUM_PROPS.map((prop) => ({
            playerId: player.id,
            gameId: game.id,
            stat: prop.stat,
            line: prop.line,
            over: { price: prop.over, book: prop.overBook },
            under: { price: prop.under, book: prop.underBook },
            grade: gradeProp(log, prop.stat, prop.line, prop.over),
            isFeatured: prop.stat === "PTS",
          })),
        );
      } else {
        props.set(player.id, buildProps({ playerId: player.id, gameId: game.id, log, featured: seed.featured }));
      }

      // Tonight
      const lastFive = log.slice(-5);
      upcoming.set(player.id, {
        gameId: game.id,
        date: SLATE_DATE,
        opponentAbbr,
        isHome,
        restDays: restBeforeSlate(schedule, SLATE_DATE),
        projectedMin: isTatum ? TATUM_UPCOMING.projectedMin : roundHalf(average(lastFive.map((g) => g.min))),
        projectedFga: isTatum ? TATUM_UPCOMING.projectedFga : roundHalf(average(lastFive.map((g) => g.fga))),
        oppRanks: oppRanksFor(rankTables, opponentAbbr, player.matchupPosition),
        teammatesOut: outTonight,
      });

      // Shot profile
      shotProfiles.set(
        player.id,
        buildShotProfile({
          playerId: player.id,
          positionGroup: player.positionGroup,
          base: seed.base,
          seasonPts: round1(average(log.map((g) => g.pts))),
          seasonFga: round1(average(log.map((g) => g.fga))),
          opponentAbbr,
          tables: rankTables,
          pinned: isTatum ? { zones: TATUM_ZONES, shotTypes: TATUM_SHOT_TYPES, playTypes: TATUM_PLAY_TYPES } : undefined,
        }),
      );
    }
    rosters.set(abbr, list);
  }

  // --- Similar players (needs everyone's points line) --------------------------
  const similar = new Map<string, SimilarPlayerComp[]>();
  const pointsLine = (playerId: string) => props.get(playerId)?.find((prop) => prop.stat === "PTS")?.line ?? null;

  for (const player of players.values()) {
    if (player.id === TATUM_ID) {
      similar.set(
        player.id,
        TATUM_COMPS.map((comp) => ({ ...comp, headshotKey: headshotKeyFor(comp.playerName) })),
      );
      continue;
    }
    const ownTeam = player.teamId.toUpperCase();
    const opponentAbbr = upcoming.get(player.id)!.opponentAbbr;
    const ownPoints = baseAverages.get(player.id)!.pts;
    const rng = createRng(`similar:${player.id}`);

    const candidates = [...players.values()]
      .filter((other) => {
        const team = other.teamId.toUpperCase();
        const line = pointsLine(other.id);
        return other.positionGroup === player.positionGroup && team !== ownTeam && team !== opponentAbbr && line !== null && line >= 4.5;
      })
      .sort((a, b) => Math.abs(baseAverages.get(a.id)!.pts - ownPoints) - Math.abs(baseAverages.get(b.id)!.pts - ownPoints))
      .slice(0, 8);

    let date = SLATE_DATE;
    const comps = rng
      .shuffle(candidates)
      .slice(0, 5)
      .map((other): SimilarPlayerComp => {
        date = addDays(date, -rng.int(2, 5));
        const line = pointsLine(other.id)!;
        const dvp = rankTables[`dvp_${other.matchupPosition}`][opponentAbbr];
        const lift = ((dvp - 15.5) / 15.5) * 0.1 * line;
        return {
          date,
          playerName: other.name,
          teamAbbr: other.teamId.toUpperCase(),
          headshotKey: other.headshotKey,
          line,
          actual: Math.max(0, Math.round(rng.normal(line + 0.5 + lift, line * 0.2 + 1.5))),
        };
      });
    similar.set(player.id, comps);
  }

  // --- Team profiles, trends and game lines -----------------------------------
  const teamProfiles = new Map<string, TeamProfile>();
  const trends = new Map<string, TeamTrends>();
  for (const game of games) {
    for (const side of [game.away, game.home]) {
      const abbr = side.team.abbr;
      teamProfiles.set(abbr, buildTeamProfile(rankTables, abbr));
      trends.set(abbr, buildTeamTrends(abbr, side.record.wins, side.record.losses, TREND_PINS[abbr]));
    }
  }
  const gameLines = new Map(games.map((game) => [game.id, buildGameLines(game, trends)]));

  return {
    league: NBA,
    slateDate: SLATE_DATE,
    slateDates: SLATE_DATES,
    teams,
    games,
    gameByTeam,
    players,
    rosters,
    baseAverages,
    gameLogs,
    props,
    upcoming,
    shotProfiles,
    similar,
    injuries,
    teamProfiles,
    trends,
    gameLines,
    rankTables,
  };
}

let cached: Dataset | undefined;

export function getDataset(): Dataset {
  cached ??= buildDataset();
  return cached;
}
