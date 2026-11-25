import { beforeAll, describe, expect, it } from "vitest";
import { getPlayerResearch } from "@/data/repository";
import type { PlayerGameLogEntry, PlayerResearch, StatId } from "@/data/types";
import { formatOrdinal } from "@/lib/format";
import { buildFilterContext } from "../context";
import { buildFilterCatalog, type ActiveFilter } from "../filters";
import { isSoftMatchup, isToughMatchup } from "../matchup";
import type { SampleWindow } from "../sample";
import { buildResearchView } from "../view";
import { playerStandOuts } from "./player";
import { FIGURE_MAX_LENGTH, STAND_OUT_LIMIT } from "./standOut";
import { standOutTargets } from "./targets";

let tatum: PlayerResearch;
let brunson: PlayerResearch;

beforeAll(async () => {
  tatum = (await getPlayerResearch("nba", "jayson-tatum"))!;
  brunson = (await getPlayerResearch("nba", "jalen-brunson"))!;
});

/** Stand-outs for a player exactly as the page would ask for them. */
function run(research: PlayerResearch, stat: StatId = "PTS", sample: SampleWindow = "season", filters: ActiveFilter[] = []) {
  const ctx = buildFilterContext(research);
  const view = buildResearchView(research, { stat, sample, filters, trend: "none" }, ctx);
  return playerStandOuts({ research, view, sample, filterCount: filters.length, catalog: buildFilterCatalog(ctx) });
}

/** Every finding, not just the ones that fit in the list: the limit is tested on its own. */
const find = (found: ReturnType<typeof run>, id: string) => found.find((item) => item.id === id);

/** A copy of the log where each game scores what the test says. */
function withPoints(log: readonly PlayerGameLogEntry[], points: (index: number) => number): PlayerGameLogEntry[] {
  return log.map((game, index) => ({ ...game, pts: points(index) }));
}

describe("playerStandOuts", () => {
  it("reports the hit rate the page shows for the stat and sample on screen", () => {
    expect(find(run(tatum), "hit-rate")).toMatchObject({
      tone: "good",
      subject: "Over 28.5 PTS",
      figure: "67%",
      text: "Hit 8 of 12 this season",
      targets: [standOutTargets.hitRate, standOutTargets.chart],
    });
  });

  it("follows the stat and the sample window on screen", () => {
    expect(find(run(tatum, "AST", "l5"), "hit-rate")).toMatchObject({
      tone: "good",
      subject: "Over 5.5 AST",
      figure: "80%",
      text: "Hit 4 of 5 over the last 5",
    });
  });

  it("follows the filters on screen and says how many are on", () => {
    const filters: ActiveFilter[] = [{ id: "home_split", min: 1, max: 30 }];
    const view = buildResearchView(tatum, { stat: "PTS", sample: "season", filters, trend: "none" }, buildFilterContext(tatum));
    // Guards the test itself: the home games must differ from the season for this to prove anything.
    expect(view.hitRate.total).toBeLessThan(tatum.gameLog.length);
    const found = find(run(tatum, "PTS", "season", filters), "hit-rate");
    expect(found?.figure).toBe(`${Math.round(view.hitRate.rate! * 100)}%`);
    expect(found?.text).toBe(`Hit ${view.hitRate.hits} of ${view.hitRate.total} matching games this season · 1 filter on`);
  });

  it("says nothing about the hit rate when no games match, rather than calling it 0%", () => {
    // Head-to-head road games against a team Boston has only hosted cannot exist.
    const none: ActiveFilter[] = [
      { id: "home_split", min: 1, max: 30 },
      { id: "away_split", min: 1, max: 30 },
    ];
    expect(find(run(tatum, "PTS", "season", none), "hit-rate")).toBeUndefined();
  });

  it("sorts tonight's opponent ranks into soft and tough, softest and toughest first", () => {
    // Brunson faces Boston, which is soft in some places and tough in others.
    const found = run(brunson);
    const ranked = buildFilterCatalog(buildFilterContext(brunson)).filter((item) => item.oppRank !== null);
    const softest = ranked.filter((item) => isSoftMatchup(item.oppRank!)).sort((a, b) => b.oppRank! - a.oppRank!)[0];
    const toughest = ranked.filter((item) => isToughMatchup(item.oppRank!)).sort((a, b) => a.oppRank! - b.oppRank!)[0];
    expect(softest).toBeDefined();
    expect(toughest).toBeDefined();

    const matchup = found.filter((item) => item.id.startsWith("opp:"));
    expect(matchup.find((item) => item.tone === "good")).toMatchObject({
      id: `opp:${softest.id}`,
      subject: softest.name,
      figure: formatOrdinal(softest.oppRank!),
      targets: [standOutTargets.filter(softest.id), standOutTargets.filtersButton],
    });
    expect(matchup.find((item) => item.tone === "bad")).toMatchObject({
      id: `opp:${toughest.id}`,
      subject: toughest.name,
      figure: formatOrdinal(toughest.oppRank!),
    });
    expect(matchup.find((item) => item.tone === "bad")?.text).toBe("BOS · tough matchup tonight");
    // Nothing in the middle of the league is called out.
    for (const item of matchup) {
      const rank = ranked.find((entry) => `opp:${entry.id}` === item.id)!.oppRank!;
      expect(item.tone === "good" ? isSoftMatchup(rank) : isToughMatchup(rank)).toBe(true);
    }
  });

  it("calls a player hot when the last five are well above the season", () => {
    const hot = { ...tatum, gameLog: withPoints(tatum.gameLog, (index) => (index >= tatum.gameLog.length - 5 ? 40 : 20)) };
    expect(find(run(hot), "form")).toMatchObject({ tone: "good" });
    const cold = { ...tatum, gameLog: withPoints(tatum.gameLog, (index) => (index >= tatum.gameLog.length - 5 ? 10 : 30)) };
    expect(find(run(cold), "form")).toMatchObject({ tone: "bad" });
    const level = { ...tatum, gameLog: withPoints(tatum.gameLog, () => 25) };
    expect(find(run(level), "form")).toBeUndefined();
  });

  it("has no form for a stat that is a yes or no each night", () => {
    const hot = { ...tatum, gameLog: withPoints(tatum.gameLog, (index) => (index >= tatum.gameLog.length - 5 ? 40 : 20)) };
    expect(find(run(hot, "DD"), "form")).toBeUndefined();
  });

  it("flags the second night of a back-to-back, and only that", () => {
    expect(find(run({ ...tatum, upcoming: { ...tatum.upcoming, restDays: 0 } }), "rest")).toMatchObject({ tone: "bad" });
    expect(find(run({ ...tatum, upcoming: { ...tatum.upcoming, restDays: 1 } }), "rest")).toBeUndefined();
  });

  it("compares the games a ruled-out teammate missed with the games he played", () => {
    const out = tatum.teammateOut!;
    // He missed the first four games, in which the player scored far more.
    const gameLog = withPoints(tatum.gameLog, (index) => (index < 4 ? 36 : 24)).map((game, index) => ({
      ...game,
      teammatesOut: index < 4 ? [out.id] : [],
    }));
    const split = find(run({ ...tatum, gameLog }), "teammate-out");
    expect(split).toMatchObject({ tone: "good", subject: "Without Porzingis", figure: "+12.0" });
    expect(split?.text).toBe(`36.0 PTS in 4 games without him · 24.0 in ${gameLog.length - 4} with`);
  });

  it("has no split when the teammate has missed every game", () => {
    const out = tatum.teammateOut!;
    const gameLog = tatum.gameLog.map((game) => ({ ...game, teammatesOut: [out.id] }));
    expect(find(run({ ...tatum, gameLog }), "teammate-out")).toBeUndefined();
  });

  it("reports how similar players fared only when the record is clear", () => {
    const comp = tatum.similar[0];
    const comps = (results: boolean[]) => results.map((hit) => ({ ...comp, line: 20, actual: hit ? 25 : 15 }));
    // The other findings are cleared out of the way so the limit cannot hide this one.
    const quiet = { ...tatum, props: [], teammateOut: null };
    expect(find(run({ ...quiet, similar: comps([true, true, true, false]) }), "similar")).toMatchObject({
      tone: "good",
      figure: "3/4",
      text: `Went over their points line against ${tatum.opponent.abbr}`,
      targets: [standOutTargets.similar],
    });
    expect(find(run({ ...quiet, similar: comps([true, false]) }), "similar")).toBeUndefined();
    expect(find(run({ ...quiet, similar: [] }), "similar")).toBeUndefined();
  });

  it("stays within the limit and never links away from the page", () => {
    for (const stat of ["PTS", "REB", "AST", "PRA", "DD"] as const) {
      const found = run(tatum, stat, "l10");
      expect(found.filter((item) => item.tone === "good").length).toBeLessThanOrEqual(STAND_OUT_LIMIT);
      expect(found.filter((item) => item.tone === "bad").length).toBeLessThanOrEqual(STAND_OUT_LIMIT);
      expect(found.every((item) => item.href === null)).toBe(true);
      // The figure is the glanceable part of the row, so it has to fit the column.
      expect(found.every((item) => item.figure === null || item.figure.length <= FIGURE_MAX_LENGTH)).toBe(true);
    }
  });
});
