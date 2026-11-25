import { beforeAll, describe, expect, it } from "vitest";
import { getPlayerResearch } from "@/data/repository";
import type { PlayerResearch } from "@/data/types";
import { buildFilterContext } from "./context";
import {
  FILTER_DEFS,
  FILTER_IDS,
  applyFilters,
  applyRankPreset,
  buildFilterCatalog,
  groupCatalog,
  parseFilters,
  removeFilter,
  serializeFilters,
  setFilterRange,
  toggleFilter,
  type FilterContext,
} from "./filters";
import { computeHitRate } from "./hitRate";
import { getStatValue } from "./stats";

/**
 * These tests run against Jayson Tatum's pinned game log, the one data set in
 * the mock that is written by hand, so every expected number can be checked
 * against src/data/fixtures/nba/tatum.ts.
 */
let tatum: PlayerResearch;
let ctx: FilterContext;

beforeAll(async () => {
  const research = await getPlayerResearch("nba", "jayson-tatum");
  if (!research) throw new Error("Tatum fixture missing");
  tatum = research;
  ctx = buildFilterContext(research);
});

const overRate = (games: PlayerResearch["gameLog"], stat: "PTS" | "DD", line: number) =>
  computeHitRate(
    games.map((game) => getStatValue(game, stat)),
    line,
  );

describe("filter definitions", () => {
  it("defines all 22 filters, each with its own rule", () => {
    expect(FILTER_DEFS).toHaveLength(22);
    expect(new Set(FILTER_DEFS.map((def) => def.id)).size).toBe(22);
    expect(FILTER_DEFS.map((def) => def.id)).toEqual([...FILTER_IDS]);

    // No two rank filters read the same opponent metric.
    const metrics = FILTER_DEFS.flatMap((def) => (def.rule.kind === "oppRank" ? [def.rule.metric] : []));
    expect(metrics).toHaveLength(14);
    expect(new Set(metrics).size).toBe(14);
  });
});

describe("Tatum, points over 28.5", () => {
  it("hits 8 of 12 on the season", () => {
    expect(overRate(tatum.gameLog, "PTS", 28.5)).toMatchObject({ hits: 8, total: 12 });
  });

  it("hits 6 of 9 against bottom-13 defenses versus power forwards", () => {
    const games = applyFilters(tatum.gameLog, [{ id: "dvp", min: 18, max: 30 }], ctx);
    expect(games).toHaveLength(9);
    expect(overRate(games, "PTS", 28.5)).toMatchObject({ hits: 6, total: 9 });
  });

  it("combines filters with AND", () => {
    const games = applyFilters(
      tatum.gameLog,
      [
        { id: "dvp", min: 18, max: 30 },
        { id: "home_split", min: 1, max: 30 },
      ],
      ctx,
    );
    // Home games against soft defenses: NYK, BKN, ATL.
    expect(games.map((game) => game.opponentAbbr)).toEqual(["NYK", "BKN", "ATL"]);
  });

  it("returns every game when no filter is active", () => {
    expect(applyFilters(tatum.gameLog, [], ctx)).toHaveLength(12);
  });

  it("has four double-doubles", () => {
    expect(overRate(tatum.gameLog, "DD", 0.5)).toMatchObject({ hits: 4, total: 12 });
  });
});

describe("filter catalog for Tatum vs New York", () => {
  const badge = (id: string) => buildFilterCatalog(ctx).find((item) => item.id === id)?.badge;

  it("shows tonight's opponent rank on rank filters", () => {
    expect(badge("dvp")).toBe("NYK #24");
    expect(badge("pnr")).toBe("NYK #26");
    expect(badge("opp_pts")).toBe("NYK #19");
    expect(badge("opp_pace")).toBe("NYK #27");
    expect(badge("zone_atb3")).toBe("NYK #25");
  });

  it("counts qualifying games on workload and split filters", () => {
    expect(badge("min_34")).toBe("10/12 Gms");
    expect(badge("fga_20")).toBe("8/12 Gms");
    expect(badge("usg_30")).toBe("10/12 Gms");
    expect(badge("h2h")).toBe("1 Gm");
    expect(badge("home_split")).toBe("5 Gms");
    expect(badge("away_split")).toBe("7 Gms");
    expect(badge("rest_1plus")).toBe("11/12 Gms");
    expect(badge("without")).toBe("12/12 Gms");
  });

  it("names filters for the player, position and opponent", () => {
    const catalog = buildFilterCatalog(ctx);
    const byId = (id: string) => catalog.find((item) => item.id === id)!;
    expect(byId("dvp").name).toBe("Def vs Position (PF)");
    expect(byId("h2h").name).toBe("Head-to-Head vs Knicks");
    expect(byId("home_split").name).toBe("Home Games Only (TD Garden)");
    expect(byId("without").name).toBe("Without K. Porzingis");
    expect(byId("zone_atb3").description).toBe("39% of Tatum shots come from above the break");
    expect(byId("zone_c3").description).toBe("15% of Tatum shots come from the corners");
  });

  it("leaves out the 'without' filter when no teammate is out", () => {
    const catalog = buildFilterCatalog({ ...ctx, teammateOut: null });
    expect(catalog).toHaveLength(21);
    expect(catalog.some((item) => item.id === "without")).toBe(false);
  });

  it("searches and groups", () => {
    const catalog = buildFilterCatalog(ctx);
    expect(groupCatalog(catalog, "", "all").map((group) => group.items.length)).toEqual([8, 6, 3, 5]);
    expect(groupCatalog(catalog, "", "workload")).toHaveLength(1);
    const found = groupCatalog(catalog, "corner", "all");
    expect(found).toHaveLength(1);
    expect(found[0].items.map((item) => item.id)).toEqual(["zone_c3"]);
    expect(groupCatalog(catalog, "zzz", "all")).toEqual([]);
  });
});

describe("filter state", () => {
  it("toggles a filter on with its default range, and off again", () => {
    const on = toggleFilter([], "dvp");
    expect(on).toEqual([{ id: "dvp", min: 18, max: 30 }]);
    expect(toggleFilter(on, "dvp")).toEqual([]);
    expect(removeFilter(on, "dvp")).toEqual([]);
  });

  it("sets a range and switches the filter on if needed", () => {
    expect(setFilterRange([], "pnr", 5, 22)).toEqual([{ id: "pnr", min: 5, max: 22 }]);
  });

  it("never lets the handles cross or meet", () => {
    expect(setFilterRange([], "dvp", 25, 10)).toEqual([{ id: "dvp", min: 10, max: 25 }]);
    expect(setFilterRange([], "dvp", 12, 12)).toEqual([{ id: "dvp", min: 12, max: 13 }]);
    expect(setFilterRange([], "dvp", 30, 30)).toEqual([{ id: "dvp", min: 29, max: 30 }]);
    expect(setFilterRange([], "dvp", -4, 99)).toEqual([{ id: "dvp", min: 1, max: 30 }]);
  });

  it("ignores ranges on filters that have none", () => {
    expect(setFilterRange([], "home_split", 5, 10)).toEqual([]);
  });

  it("applies presets", () => {
    expect(applyRankPreset([], "dvp", "tough")).toEqual([{ id: "dvp", min: 1, max: 12 }]);
    expect(applyRankPreset([], "dvp", "soft")).toEqual([{ id: "dvp", min: 18, max: 30 }]);
    expect(applyRankPreset([], "dvp", "all")).toEqual([{ id: "dvp", min: 1, max: 30 }]);
  });
});

describe("filters in the URL", () => {
  it("round-trips", () => {
    const filters = [
      { id: "dvp" as const, min: 18, max: 30 },
      { id: "home_split" as const, min: 1, max: 30 },
    ];
    expect(serializeFilters(filters)).toBe("dvp:18-30,home_split");
    expect(parseFilters("dvp:18-30,home_split")).toEqual(filters);
  });

  it("drops unknown ids, duplicates and bad ranges", () => {
    expect(parseFilters("")).toEqual([]);
    expect(parseFilters("nope,dvp:5-9,dvp:1-2")).toEqual([{ id: "dvp", min: 5, max: 9 }]);
    expect(parseFilters("pnr:abc")).toEqual([{ id: "pnr", min: 20, max: 30 }]);
    expect(parseFilters("pnr:25-4")).toEqual([{ id: "pnr", min: 4, max: 25 }]);
    expect(parseFilters("pnr:0-99")).toEqual([{ id: "pnr", min: 1, max: 30 }]);
  });
});
