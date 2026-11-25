import { describe, expect, it } from "vitest";
import { computeHitRate } from "@/lib/research/hitRate";
import { getStatValue } from "@/lib/research/stats";
import { NBA_ROSTERS } from "./fixtures/nba/rosters";
import { buildRankTable } from "./generate/ranks";
import { createRng } from "./generate/rng";
import { toWholeShares } from "./generate/shotProfile";
import {
  getGame,
  getGameInjuries,
  getGameLines,
  getGameMatchup,
  getLeaders,
  getLeague,
  getNavIndex,
  getPlayerResearch,
  getSlate,
  getSlateDates,
  getSlatePlayers,
  listGameIds,
  listPlayerIds,
} from "./repository";

/**
 * The mock data is generated, so these tests check that it is internally
 * consistent: every box score adds up, every ranking is a real 1-30 ordering,
 * and the numbers pinned from the prototype come out exactly.
 */

describe("seeded generator", () => {
  it("gives the same sequence for the same seed", () => {
    const a = createRng("seed");
    const b = createRng("seed");
    expect([a.next(), a.next(), a.int(1, 30)]).toEqual([b.next(), b.next(), b.int(1, 30)]);
    expect(createRng("other").next()).not.toBe(createRng("seed").next());
  });

  it("deals each rank exactly once and respects pins", () => {
    const teams = Array.from({ length: 30 }, (_, i) => `T${i}`);
    const table = buildRankTable("metric", teams, { T3: 24, T9: 1 });
    expect(table.T3).toBe(24);
    expect(table.T9).toBe(1);
    expect(Object.values(table).sort((x, y) => x - y)).toEqual(teams.map((_, i) => i + 1));
  });

  it("rounds shares to whole numbers that total 100", () => {
    expect(toWholeShares([1, 1, 1]).reduce((s, v) => s + v, 0)).toBe(100);
    expect(toWholeShares([39, 28, 12, 8, 7, 6])).toEqual([39, 28, 12, 8, 7, 6]);
  });
});

describe("slate", () => {
  it("has six games on the slate date and none on other dates", async () => {
    const dates = await getSlateDates("nba");
    expect(dates).toHaveLength(6);
    expect(dates[0]).toMatchObject({ date: "2026-11-13", isToday: true, gameCount: 6 });
    expect(dates.slice(1).every((d) => d.gameCount === 0)).toBe(true);
    expect(await getSlate("nba")).toHaveLength(6);
    expect(await getSlate("nba", "2026-11-14")).toEqual([]);
  });

  it("keeps the prototype's markets for New York at Boston", async () => {
    const game = await getGame("nba", "nyk-bos");
    expect(game?.venue.name).toBe("TD Garden");
    expect(game?.markets.spread.away).toMatchObject({ line: 4.5, price: -108, isBest: true });
    expect(game?.markets.spread.home).toMatchObject({ line: -4.5, price: -112, isBest: false });
    expect(game?.markets.moneyline.away.price).toBe(164);
    expect(game?.markets.total.under).toMatchObject({ line: 224.5, price: -105, isBest: true });
  });

  it("returns nothing for unknown leagues, games and players", async () => {
    expect(await getLeague("nfl")).toBeNull();
    expect(await getSlate("nfl")).toEqual([]);
    expect(await getGame("nba", "aaa-bbb")).toBeNull();
    expect(await getGameMatchup("nba", "aaa-bbb")).toBeNull();
    expect(await getPlayerResearch("nba", "nobody")).toBeNull();
  });
});

describe("players", () => {
  it("has 96 players with unique ids, eight per team", async () => {
    const ids = await listPlayerIds("nba");
    expect(ids).toHaveLength(96);
    expect(new Set(ids).size).toBe(96);
    const groups = await getSlatePlayers("nba");
    for (const { rosters } of groups) {
      for (const side of [rosters.away, rosters.home]) {
        expect(side.starters).toHaveLength(5);
        expect(side.bench).toHaveLength(3);
      }
    }
  });

  it("builds box scores that add up", async () => {
    for (const id of await listPlayerIds("nba")) {
      const research = await getPlayerResearch("nba", id);
      expect(research, id).not.toBeNull();
      for (const game of research!.gameLog) {
        const label = `${id} ${game.date}`;
        expect(game.pts, label).toBe((game.fgm - game.fg3m) * 2 + game.fg3m * 3 + game.ftm);
        expect(game.threes, label).toBe(game.fg3m);
        expect(game.fga, label).toBeGreaterThanOrEqual(game.fgm);
        expect(game.fg3a, label).toBeGreaterThanOrEqual(game.fg3m);
        expect(game.fgm, label).toBeGreaterThanOrEqual(game.fg3m);
        expect(game.fta, label).toBeGreaterThanOrEqual(game.ftm);
        expect(game.min, label).toBeGreaterThan(0);
        for (const rank of Object.values(game.oppRanks)) {
          expect(rank).toBeGreaterThanOrEqual(1);
          expect(rank).toBeLessThanOrEqual(30);
        }
      }
      // Oldest first, all before the slate.
      const dates = research!.gameLog.map((g) => g.date);
      expect([...dates].sort(), id).toEqual(dates);
      expect(dates[dates.length - 1] < "2026-11-13", id).toBe(true);
    }
  });

  it("honours every pinned featured-prop hit count", async () => {
    for (const roster of NBA_ROSTERS) {
      for (const seed of [...roster.starters, ...roster.bench]) {
        if (!seed.featured) continue;
        const id = seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const research = await getPlayerResearch("nba", id);
        const prop = research!.props.find((p) => p.isFeatured)!;
        expect(prop, seed.name).toMatchObject({ stat: seed.featured.stat, line: seed.featured.line });
        expect(prop.over.price, seed.name).toBe(seed.featured.price);
        const rate = computeHitRate(
          research!.gameLog.map((g) => getStatValue(g, prop.stat)),
          prop.line,
        );
        expect(rate.hits, seed.name).toBe(Math.min(seed.featured.hits, research!.gameLog.length));
      }
    }
  });

  it("gives every player exactly one featured prop and shot shares that total 100", async () => {
    for (const id of await listPlayerIds("nba")) {
      const research = (await getPlayerResearch("nba", id))!;
      expect(research.props.filter((p) => p.isFeatured), id).toHaveLength(1);
      for (const scope of ["season", "l5"] as const) {
        const total = (rows: { share: number }[]) => rows.reduce((sum, row) => sum + row.share, 0);
        expect(total(research.shotProfile.zones[scope]), id).toBe(100);
        expect(total(research.shotProfile.shotTypes[scope]), id).toBe(100);
        expect(total(research.shotProfile.playTypes[scope]), id).toBe(100);
      }
      expect(research.similar.length, id).toBe(5);
    }
  });

  it("keeps Tatum's page as designed", async () => {
    const tatum = (await getPlayerResearch("nba", "jayson-tatum"))!;
    expect(tatum.gameLog).toHaveLength(12);
    expect(tatum.opponent.abbr).toBe("NYK");
    expect(tatum.isHome).toBe(true);
    expect(tatum.upcoming).toMatchObject({ restDays: 0, projectedMin: 36.5, projectedFga: 21.5 });
    expect(tatum.props.map((p) => p.stat)).toEqual(["PTS", "AST", "REB", "3PM", "PA", "PR", "RA", "PRA", "DD"]);
    expect(tatum.props[0]).toMatchObject({ line: 28.5, over: { price: -106, book: "FD" }, isFeatured: true });
    expect(tatum.teammateOut?.playerName).toBe("Kristaps Porzingis");
    expect(tatum.similar[0]).toMatchObject({ playerName: "Paolo Banchero", line: 24.5, actual: 31 });
    // Share of shots in zones New York defends poorly (rank 20 or worse).
    const soft = tatum.shotProfile.zones.season.filter((z) => z.oppRank >= 20).reduce((sum, z) => sum + z.share, 0);
    expect(soft).toBe(82);
  });
});

describe("game detail", () => {
  it("returns rosters, comparison and injuries for every game", async () => {
    for (const gameId of await listGameIds("nba")) {
      const matchup = await getGameMatchup("nba", gameId);
      expect(matchup?.spotlightPlayer, gameId).not.toBeNull();
      for (const profile of [matchup!.comparison.away, matchup!.comparison.home]) {
        for (const window of ["l3", "l5", "season"] as const) {
          for (const rank of Object.values(profile[window].radar)) {
            expect(rank).toBeGreaterThanOrEqual(1);
            expect(rank).toBeLessThanOrEqual(30);
          }
        }
      }
      expect(await getGameInjuries("nba", gameId)).not.toBeNull();
    }
  });

  it("pins the prototype's radar ranks and trend records", async () => {
    const matchup = (await getGameMatchup("nba", "nyk-bos"))!;
    expect(matchup.comparison.away.season.radar).toMatchObject({ off: 4, def: 19, pace: 27, threes: 6, reb: 5, tov: 3 });
    expect(matchup.comparison.home.season.radar).toMatchObject({ off: 2, def: 3, pace: 15, threes: 1, reb: 13, tov: 8 });

    const lines = (await getGameLines("nba", "nyk-bos"))!;
    expect(lines.spread[0]).toMatchObject({ title: "NYK Knicks +4.5", price: -108, book: "FD", isBest: true });
    expect(lines.spread[0].trend).toMatchObject({ wins: 8, losses: 3, label: "ATS" });
    expect(lines.spread[1].trend).toMatchObject({ wins: 5, losses: 7 });
    expect(lines.total[0].trend).toMatchObject({ wins: 7, losses: 5, label: "O/U" });
    expect(lines.total[1].trend).toMatchObject({ wins: 5, losses: 7 });
    expect(lines.derivatives[0]).toMatchObject({ title: "BOS 1st Half -2.5", price: -110 });
    expect(lines.derivatives[0].trend).toMatchObject({ wins: 9, losses: 3, label: "1H ATS" });
    expect(lines.derivatives[1].title).toBe("1st Quarter Over 56.5");
  });

  it("has an empty injury report for Philadelphia", async () => {
    const injuries = (await getGameInjuries("nba", "cle-phi"))!;
    expect(injuries.home.entries).toEqual([]);
    expect(injuries.away.entries).toHaveLength(1);
  });
});

describe("leaders", () => {
  it("ranks by hit rate and agrees with the player pages", async () => {
    const leaders = await getLeaders("nba");
    expect(leaders.length).toBeGreaterThan(40);
    for (let i = 1; i < leaders.length; i += 1) {
      expect(leaders[i - 1].hits / leaders[i - 1].sample).toBeGreaterThanOrEqual(leaders[i].hits / leaders[i].sample);
    }
    expect(new Set(leaders.map((row) => row.id)).size).toBe(leaders.length);

    const row = leaders.find((r) => r.target.kind === "player" && r.target.playerId === "jayson-tatum" && r.target.stat === "PTS")!;
    expect(row).toMatchObject({ hits: 8, sample: 12, propLabel: "Over 28.5 PTS", matchupLabel: "vs NYK" });
    // 28, 32, 33, 31 and 20 points against a 28.5 line.
    expect(row.lastFive).toEqual([false, true, true, true, false]);
    expect(leaders.some((r) => r.category === "TEAM")).toBe(true);
  });
});

describe("navigation index", () => {
  it("lists every game and player", async () => {
    const nav = await getNavIndex("nba");
    expect(nav.games).toHaveLength(6);
    expect(nav.games[0]).toMatchObject({ id: "nyk-bos", label: "NYK @ BOS" });
    expect(nav.players).toHaveLength(96);
    expect(nav.todayGameCount).toBe(6);
  });
});
