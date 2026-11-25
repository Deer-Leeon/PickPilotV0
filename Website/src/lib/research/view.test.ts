import { beforeAll, describe, expect, it } from "vitest";
import { getPlayerResearch } from "@/data/repository";
import type { PlayerResearch } from "@/data/types";
import { buildFilterContext } from "./context";
import type { FilterContext } from "./filters";
import { availableStats, buildResearchView, resolveStat, type ResearchState } from "./view";

let tatum: PlayerResearch;
let ctx: FilterContext;

const state = (patch: Partial<ResearchState> = {}): ResearchState => ({
  stat: "PTS",
  sample: "season",
  filters: [],
  trend: "oppDef",
  ...patch,
});

beforeAll(async () => {
  const research = await getPlayerResearch("nba", "jayson-tatum");
  if (!research) throw new Error("Tatum fixture is missing");
  tatum = research;
  ctx = buildFilterContext(research);
});

describe("resolveStat", () => {
  it("keeps a requested stat that has a posted prop", () => {
    expect(resolveStat(tatum.props, "REB")).toBe("REB");
  });

  it("falls back to the featured prop when nothing is requested", () => {
    expect(resolveStat(tatum.props, null)).toBe("PTS");
  });

  it("falls back to the featured prop when the requested stat is not posted", () => {
    const withoutAssists = tatum.props.filter((prop) => prop.stat !== "AST");
    expect(resolveStat(withoutAssists, "AST")).toBe("PTS");
    expect(availableStats(withoutAssists)).not.toContain("AST");
  });
});

describe("buildResearchView", () => {
  it("matches the prototype for Tatum's points over the season", () => {
    const view = buildResearchView(tatum, state(), ctx);
    expect(view.prop?.line).toBe(28.5);
    expect(view.hitRate).toMatchObject({ hits: 8, total: 12 });
    expect(view.chart.bars).toHaveLength(12);
    expect(view.chart.bars.map((bar) => bar.value).slice(0, 3)).toEqual([37, 25, 37]);
  });

  it("shows no deltas on the stat strip for the full season, and deltas for a narrower sample", () => {
    const season = buildResearchView(tatum, state(), ctx);
    expect(season.strip.every((stat) => stat.delta === null)).toBe(true);

    const lastFive = buildResearchView(tatum, state({ sample: "l5" }), ctx);
    expect(lastFive.games).toHaveLength(5);
    const points = lastFive.strip.find((stat) => stat.key === "pts");
    expect(points?.value).toBeCloseTo((28 + 32 + 33 + 31 + 20) / 5);
    expect(points?.delta).not.toBeNull();
  });

  it("applies filters inside the sample window", () => {
    const view = buildResearchView(tatum, state({ filters: [{ id: "dvp", min: 18, max: 30 }] }), ctx);
    expect(view.sampleSize).toBe(12);
    expect(view.hitRate).toMatchObject({ hits: 6, total: 9 });
  });

  it("keeps the axis fixed when the sample changes, so bars do not rescale", () => {
    const season = buildResearchView(tatum, state(), ctx);
    const lastFive = buildResearchView(tatum, state({ sample: "l5" }), ctx);
    expect(lastFive.chart.axisMax).toBe(season.chart.axisMax);
  });

  it("adds a trend point for tonight after the last bar", () => {
    const view = buildResearchView(tatum, state({ trend: "min" }), ctx);
    expect(view.chart.trend?.points).toHaveLength(13);
    expect(view.chart.trend?.points.at(-1)).toMatchObject({ isUpcoming: true, text: "36.5m" });
  });

  it("has no trend line when it is switched off or no games match", () => {
    expect(buildResearchView(tatum, state({ trend: "none" }), ctx).chart.trend).toBeNull();
    const empty = buildResearchView(tatum, state({ filters: [{ id: "dvp", min: 1, max: 2 }] }), ctx);
    expect(empty.games).toHaveLength(0);
    expect(empty.hitRate.rate).toBeNull();
    expect(empty.chart.trend).toBeNull();
  });
});
