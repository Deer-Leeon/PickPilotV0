import { beforeAll, describe, expect, it } from "vitest";
import { getLeaders, getPlayerResearch } from "@/data/repository";
import type { LeaderRow } from "@/data/types";
import { LEADERS_LIMIT, LEADER_FILTERS, MAX_ROWS_PER_NAME, selectLeaders } from "./leaders";
import { getStatValue } from "./stats";

let rows: LeaderRow[];

beforeAll(async () => {
  rows = await getLeaders("nba");
});

describe("selectLeaders", () => {
  it("ranks from 1 and never returns more than the limit", () => {
    for (const filter of LEADER_FILTERS) {
      const leaders = selectLeaders(rows, filter);
      expect(leaders.length).toBeGreaterThan(0);
      expect(leaders.length).toBeLessThanOrEqual(LEADERS_LIMIT);
      expect(leaders.map((leader) => leader.rank)).toEqual(leaders.map((_, index) => index + 1));
    }
  });

  it("keeps the best-first order it was given", () => {
    const rates = selectLeaders(rows, "ALL").map(({ row }) => row.hits / row.sample);
    expect(rates).toEqual([...rates].sort((a, b) => b - a));
  });

  it("only returns the chosen category", () => {
    expect(selectLeaders(rows, "REB").every(({ row }) => row.category === "REB")).toBe(true);
    expect(selectLeaders(rows, "TEAM").every(({ row }) => row.kind === "team")).toBe(true);
  });

  it("caps how often one name appears in the mixed board", () => {
    const counts = new Map<string, number>();
    for (const { row } of selectLeaders(rows, "ALL")) counts.set(row.name, (counts.get(row.name) ?? 0) + 1);
    expect(Math.max(...counts.values())).toBeLessThanOrEqual(MAX_ROWS_PER_NAME);
  });
});

describe("leader rows", () => {
  it("agree with the game log shown on the player page", async () => {
    const leader = rows.find((row) => row.target.kind === "player");
    if (!leader || leader.target.kind !== "player") throw new Error("No player leader found");
    const { playerId, stat } = leader.target;

    const research = await getPlayerResearch("nba", playerId);
    const prop = research?.props.find((candidate) => candidate.stat === stat);
    if (!research || !prop) throw new Error("Leader points at a missing prop");

    const hits = research.gameLog.filter((game) => getStatValue(game, stat) > prop.line).length;
    expect(leader.hits).toBe(hits);
    expect(leader.sample).toBe(research.gameLog.length);
  });
});
