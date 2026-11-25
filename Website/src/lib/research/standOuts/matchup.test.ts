import { beforeAll, describe, expect, it } from "vitest";
import { getGame, getGameMatchup } from "@/data/repository";
import type { Game, GameMatchup, TeamProfile, TeamStatKey, TeamWindowProfile } from "@/data/types";
import { matchupStandOuts } from "./matchup";
import { STAND_OUT_LIMIT } from "./standOut";

const TEAM_COUNT = 30;
const KEYS: TeamStatKey[] = ["pts", "fgPct", "fg3Pct", "reb", "ast", "tov", "pace"];

/** A team in the middle of the league at everything, with the ranks a test cares about set on top. */
function profile(overrides: { offense?: Partial<Record<TeamStatKey, number>>; defense?: Partial<Record<TeamStatKey, number>> } = {}): TeamWindowProfile {
  const side = (ranks: Partial<Record<TeamStatKey, number>> = {}) =>
    Object.fromEntries(KEYS.map((key) => [key, { value: 100, rank: ranks[key] ?? 15 }])) as TeamWindowProfile["offense"];
  return {
    radar: { off: 15, def: 15, pace: 15, threes: 15, reb: 15, tov: 15 },
    offense: side(overrides.offense),
    defense: side(overrides.defense),
  };
}

const everyWindow = (window: TeamWindowProfile): TeamProfile => ({ l3: window, l5: window, season: window });

let game: Game;
let matchup: GameMatchup;

beforeAll(async () => {
  game = (await getGame("nba", "nyk-bos"))!;
  matchup = (await getGameMatchup("nba", "nyk-bos"))!;
});

/** The real game with its starters' props removed, so only the team findings are left. */
function teamsOnly(away: TeamProfile, home: TeamProfile): GameMatchup {
  const noProps = (roster: GameMatchup["rosters"]["away"]) => ({
    ...roster,
    starters: roster.starters.map((entry) => ({ ...entry, featuredProp: null, featuredHits: null })),
  });
  return {
    ...matchup,
    comparison: { away, home },
    rosters: { ...matchup.rosters, away: noProps(matchup.rosters.away), home: noProps(matchup.rosters.home) },
  };
}

const run = (data: GameMatchup, window: "l3" | "l5" | "season" = "season") =>
  matchupStandOuts({ game, matchup: data, window, teamCount: TEAM_COUNT, league: "nba" });

describe("matchupStandOuts", () => {
  it("finds nothing between two average teams", () => {
    expect(run(teamsOnly(everyWindow(profile()), everyWindow(profile())))).toEqual([]);
  });

  it("calls out a strong offense against a weak defense, and each rank at the edge of the league", () => {
    const found = run(teamsOnly(everyWindow(profile({ offense: { pts: 2 } })), everyWindow(profile({ defense: { pts: 28 } }))));
    expect(found.map((item) => [item.id, item.tone])).toEqual([
      ["gap:NYK:pts", "good"],
      ["rank:NYK:offense:pts", "good"],
      ["rank:BOS:defense:pts", "bad"],
    ]);
    expect(found[0]).toMatchObject({ subject: "NYK offense", figure: "2nd", text: "Points · BOS defense ranks 28th" });
    expect(found[1]).toMatchObject({ subject: "NYK offense", figure: "2nd", text: "Points · 100.0" });
    expect(found[2]).toMatchObject({ subject: "BOS defense", figure: "28th", text: "Points allowed · 100.0" });
  });

  it("points at the stat-bar row in the view where it is shown, then at the card", () => {
    // New York is away. Its offense, and the Boston defense it faces, are both on screen while the away side has the ball.
    const awayAttack = run(teamsOnly(everyWindow(profile({ offense: { pts: 2 } })), everyWindow(profile({ defense: { pts: 28 } }))));
    expect(awayAttack.map((item) => item.targets)).toEqual(Array(3).fill(["stat:away:pts", "comparison"]));
    // Boston's offense and New York's defense are shown the other way round.
    const homeAttack = run(teamsOnly(everyWindow(profile({ defense: { ast: 1 } })), everyWindow(profile({ offense: { ast: 30 } }))));
    expect(homeAttack.map((item) => item.targets)).toEqual(Array(3).fill(["stat:home:ast", "comparison"]));
  });

  it("calls out a weak offense against a strong defense as bad", () => {
    const found = run(teamsOnly(everyWindow(profile({ defense: { reb: 8 } })), everyWindow(profile({ offense: { reb: 24 } }))));
    expect(found).toEqual([expect.objectContaining({ id: "gap:BOS:reb", tone: "bad" })]);
  });

  it("uses the edge of the league, not one place inside it", () => {
    const found = run(teamsOnly(everyWindow(profile({ offense: { ast: 5, reb: 6 }, defense: { ast: 26, reb: 25 } })), everyWindow(profile())));
    expect(found.map((item) => item.id).sort()).toEqual(["rank:NYK:defense:ast", "rank:NYK:offense:ast"]);
  });

  it("never calls out pace", () => {
    const fast = profile({ offense: { pace: 1 }, defense: { pace: 30 } });
    expect(run(teamsOnly(everyWindow(fast), everyWindow(fast)))).toEqual([]);
  });

  it("reads the ranks of the window on screen", () => {
    const hot: TeamProfile = { l3: profile({ offense: { pts: 1 } }), l5: profile(), season: profile() };
    const data = teamsOnly(hot, everyWindow(profile()));
    expect(run(data, "l3").map((item) => item.id)).toEqual(["rank:NYK:offense:pts"]);
    expect(run(data, "season")).toEqual([]);
  });

  it("stays within the limit on real data and links starter props to their research", () => {
    const found = run(matchup);
    expect(found.filter((item) => item.tone === "good").length).toBeLessThanOrEqual(STAND_OUT_LIMIT);
    expect(found.filter((item) => item.tone === "bad").length).toBeLessThanOrEqual(STAND_OUT_LIMIT);
    for (const item of found.filter((entry) => entry.id.startsWith("prop:"))) expect(item.href).toMatch(/^\/nba\/players\//);
  });
});
