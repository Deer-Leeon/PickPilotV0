import { describe, expect, it } from "vitest";
import { barFraction, buildTrendScale, lineFraction, niceAxisMax, trendFraction } from "./chart";
import { gradeTone } from "./grades";
import { computeHitRate, formatHitRate, formatSample, isHit } from "./hitRate";
import { buildStatBarRows, isSoftMatchup, rankToRadarScore } from "./matchup";
import { formatOdds, formatSpread, impliedProbability, probabilityToAmerican } from "./odds";
import { average, sampleLabel, takeSample } from "./sample";
import { summarizeComps } from "./similar";
import { formatPropLine, formatPropTitle, getStatValue, isDoubleDouble, isStatId } from "./stats";
import type { TeamStatKey, TeamWindowProfile } from "@/data/types";

describe("stats", () => {
  const game = { pts: 31, reb: 12, ast: 6, threes: 4 };

  it("derives every stat family from one box score row", () => {
    expect(getStatValue(game, "PTS")).toBe(31);
    expect(getStatValue(game, "REB")).toBe(12);
    expect(getStatValue(game, "AST")).toBe(6);
    expect(getStatValue(game, "3PM")).toBe(4);
    expect(getStatValue(game, "PA")).toBe(37);
    expect(getStatValue(game, "PR")).toBe(43);
    expect(getStatValue(game, "RA")).toBe(18);
    expect(getStatValue(game, "PRA")).toBe(49);
  });

  it("counts a double-double only when two categories reach ten", () => {
    expect(isDoubleDouble(game)).toBe(true);
    expect(getStatValue(game, "DD")).toBe(1);
    expect(isDoubleDouble({ pts: 37, reb: 4, ast: 9, threes: 8 })).toBe(false);
    expect(getStatValue({ pts: 9, reb: 14, ast: 2, threes: 0 }, "DD")).toBe(0);
  });

  it("formats prop labels", () => {
    expect(formatPropLine(14.5, "RA")).toBe("14.5 R+A");
    expect(formatPropTitle("Jayson Tatum", "Over", 28.5, "PTS")).toBe("Jayson Tatum Over 28.5 PTS");
    expect(isStatId("PRA")).toBe(true);
    expect(isStatId("STL")).toBe(false);
  });
});

describe("hit rate", () => {
  it("counts results over and under a line", () => {
    expect(computeHitRate([30, 20, 29], 28.5)).toMatchObject({ hits: 2, misses: 1, total: 3 });
    expect(computeHitRate([30, 20, 29], 28.5, "under")).toMatchObject({ hits: 1, misses: 2, total: 3 });
    expect(isHit(29, 28.5)).toBe(true);
    expect(isHit(29, 28.5, "under")).toBe(false);
  });

  it("leaves pushes out of the denominator", () => {
    const result = computeHitRate([10, 8, 12, 10], 10);
    expect(result).toMatchObject({ hits: 1, misses: 1, pushes: 2, total: 2, rate: 0.5 });
  });

  it("has no rate for an empty sample instead of 0%", () => {
    const empty = computeHitRate([], 10);
    expect(empty.rate).toBeNull();
    expect(formatHitRate(empty)).toBe("—");
  });

  it("formats rate and sample", () => {
    const result = computeHitRate([1, 1, 0], 0.5);
    expect(formatHitRate(result)).toBe("67%");
    expect(formatSample(result)).toBe("2/3");
  });
});

describe("odds", () => {
  it("formats American odds and spreads", () => {
    expect(formatOdds(-110)).toBe("-110");
    expect(formatOdds(164)).toBe("+164");
    expect(formatSpread(4.5)).toBe("+4.5");
    expect(formatSpread(-4.5)).toBe("-4.5");
    expect(formatSpread(0)).toBe("PK");
  });

  it("converts between price and probability", () => {
    expect(impliedProbability(-110)).toBeCloseTo(0.5238, 4);
    expect(impliedProbability(100)).toBeCloseTo(0.5, 4);
    expect(impliedProbability(150)).toBeCloseTo(0.4, 4);
    expect(probabilityToAmerican(0.6)).toBe(-150);
    expect(probabilityToAmerican(0.4)).toBe(150);
    expect(probabilityToAmerican(impliedProbability(-192))).toBe(-192);
  });
});

describe("sample windows", () => {
  const log = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  it("takes the most recent games and keeps their order", () => {
    expect(takeSample(log, "l5")).toEqual([8, 9, 10, 11, 12]);
    expect(takeSample(log, "l10")).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(takeSample(log, "season")).toEqual(log);
    expect(takeSample([1, 2], "l5")).toEqual([1, 2]);
  });

  it("labels the windows", () => {
    expect(sampleLabel("l5", 12)).toBe("L5");
    expect(sampleLabel("season", 12)).toBe("Season (12)");
  });

  it("averages to null when there is no data", () => {
    expect(average([])).toBeNull();
    expect(average([2, 4])).toBe(3);
  });
});

describe("matchup", () => {
  it("treats rank 20 and worse as a soft matchup", () => {
    expect(isSoftMatchup(19)).toBe(false);
    expect(isSoftMatchup(20)).toBe(true);
  });

  it("maps ranks onto the radar", () => {
    expect(rankToRadarScore(1)).toBe(1);
    expect(rankToRadarScore(30)).toBeCloseTo(0.275, 5);
  });

  it("builds stat bars for one offense against the other defense", () => {
    const side = (rank: number) =>
      Object.fromEntries(
        (["pts", "fgPct", "fg3Pct", "reb", "ast", "tov", "pace"] as TeamStatKey[]).map((key) => [key, { value: 100 + rank, rank }]),
      ) as TeamWindowProfile["offense"];
    const radar = { off: 1, def: 1, pace: 1, threes: 1, reb: 1, tov: 1 };
    const away: TeamWindowProfile = { radar, offense: side(4), defense: side(20) };
    const home: TeamWindowProfile = { radar, offense: side(9), defense: side(12) };

    const rows = buildStatBarRows(away, home, "awayOffense");
    expect(rows.map((row) => row.label)).toEqual(["Points", "Field-Goal %", "Three-Point %", "Rebounds", "Assists", "Turnovers", "Pace"]);
    // Away offense (#4) against home defense (#12).
    expect(rows[0].away.rank).toBe(4);
    expect(rows[0].home.rank).toBe(12);
    expect(rows[0].advantage).toBe("away");
    expect(rows[0].away.barPct).toBe(90);
    expect(rows[1].away.display).toBe("104.0%");
    // Pace is context only.
    expect(rows[6].advantage).toBe("none");

    const flipped = buildStatBarRows(away, home, "homeOffense");
    expect(flipped[0].away.rank).toBe(20);
    expect(flipped[0].home.rank).toBe(9);
    expect(flipped[0].advantage).toBe("home");
  });
});

describe("chart scales", () => {
  it("rounds the axis up with headroom", () => {
    expect(niceAxisMax(37, 28.5)).toBe(45);
    expect(niceAxisMax(12, 8.5)).toBe(16);
    expect(niceAxisMax(1, 0.5)).toBe(2);
    expect(niceAxisMax(0, 0.5)).toBe(2);
  });

  it("keeps bars and the line inside the plot", () => {
    expect(barFraction(22.5, 45)).toBe(0.5);
    expect(barFraction(0, 45)).toBe(0.035);
    expect(barFraction(90, 45)).toBe(1);
    expect(lineFraction(28.5, 45)).toBeCloseTo(0.6333, 4);
  });

  it("uses a fixed 1-30 scale for ranks with soft defenses favourable", () => {
    const scale = buildTrendScale("oppDef", [24, 5], 0, "PF");
    expect(scale.label).toBe("Opp Def vs PF");
    expect([scale.min, scale.max]).toEqual([1, 30]);
    expect(scale.isFavorable(24)).toBe(true);
    expect(scale.isFavorable(5)).toBe(false);
    expect(scale.format(24)).toBe("#24");
    expect(trendFraction(30, scale)).toBe(0.9);
    expect(trendFraction(1, scale)).toBe(0.1);
  });

  it("scales minutes to the sample and compares with the season average", () => {
    const scale = buildTrendScale("min", [29, 42], 36.3, "PF");
    expect(scale.min).toBeLessThanOrEqual(29);
    expect(scale.max).toBeGreaterThanOrEqual(42);
    expect(scale.isFavorable(37)).toBe(true);
    expect(scale.isFavorable(34)).toBe(false);
    expect(scale.format(37)).toBe("37m");
  });
});

describe("similar players", () => {
  it("summarises how comps did against their lines", () => {
    const comp = (line: number, actual: number) => ({ date: "2026-11-08", playerName: "P", teamAbbr: "ORL", headshotKey: null, line, actual });
    const summary = summarizeComps([comp(24.5, 31), comp(21.5, 26), comp(19.5, 23), comp(20.5, 18), comp(20.5, 25)]);
    expect(summary.hitRate).toMatchObject({ hits: 4, total: 5 });
    expect(summary.averageDiff).toBeCloseTo(3.3, 5);
    expect(summary.rows[3].hit).toBe(false);
  });

  it("has no averages without comps", () => {
    const summary = summarizeComps([]);
    expect(summary.averageDiff).toBeNull();
    expect(summary.hitRate.rate).toBeNull();
  });
});

describe("grades", () => {
  it("only decides the colour", () => {
    expect(gradeTone("A-")).toBe("good");
    expect(gradeTone("B+")).toBe("good");
    expect(gradeTone("C")).toBe("neutral");
    expect(gradeTone("D+")).toBe("bad");
    expect(gradeTone("F")).toBe("bad");
  });
});
