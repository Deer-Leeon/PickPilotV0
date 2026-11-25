import { beforeAll, describe, expect, it } from "vitest";
import { getLeaders } from "@/data/repository";
import type { LeaderRow } from "@/data/types";
import { LEADER_FILTERS, selectLeaders } from "../leaders";
import { leaderStandOuts } from "./leaders";
import { STAND_OUT_LIMIT } from "./standOut";

let rows: LeaderRow[];
let player: LeaderRow;
let team: LeaderRow;

beforeAll(async () => {
  rows = await getLeaders("nba");
  player = rows.find((row) => row.kind === "player")!;
  team = rows.find((row) => row.kind === "team")!;
});

const lately = (row: LeaderRow, id: string, lastFive: boolean[]): LeaderRow => ({ ...row, id, name: id, lastFive });

describe("leaderStandOuts", () => {
  it("calls out a leader who hit in all of the last five, and one who missed three or more", () => {
    const found = leaderStandOuts(
      [
        lately(player, "perfect", [true, true, true, true, true]),
        lately(player, "steady", [true, false, true, true, false]),
        lately(player, "cooling", [true, false, false, true, false]),
        lately(player, "cold", [false, false, false, true, false]),
      ],
      "ALL",
      "nba",
    );
    expect(found.map((item) => [item.id, item.tone])).toEqual([
      ["perfect", "good"],
      ["cold", "bad"],
      ["cooling", "bad"],
    ]);
    // The figure is the recent run. The season record that put the row on the board follows.
    const text = `Last 5 · ${player.propLabel} · season ${player.hits} of ${player.sample}`;
    expect(found[0]).toMatchObject({ figure: "5/5", text, targets: ["leader:perfect"] });
    expect(found[1]).toMatchObject({ figure: "1/5", text, targets: ["leader:cold"] });
    expect(found[2].figure).toBe("2/5");
  });

  it("does not judge a run of fewer than five results", () => {
    expect(leaderStandOuts([lately(player, "new", [true, true, true]), lately(player, "none", [])], "ALL", "nba")).toEqual([]);
  });

  it("links a player to their research on that stat and a team line to the game's lines", () => {
    const found = leaderStandOuts([lately(player, "p", Array(5).fill(true)), lately(team, "t", Array(5).fill(true))], "ALL", "nba");
    if (player.target.kind !== "player" || team.target.kind !== "game") throw new Error("Unexpected leader targets");
    expect(found[0].href).toBe(`/nba/players/${player.target.playerId}?stat=${encodeURIComponent(player.target.stat)}`);
    expect(found[1].href).toBe(`/nba/games/${team.target.gameId}/lines`);
  });

  it("only looks at the rows on the board for the category on screen", () => {
    for (const filter of LEADER_FILTERS) {
      const onBoard = new Set(selectLeaders(rows, filter).map(({ row }) => row.id));
      const found = leaderStandOuts(rows, filter, "nba");
      expect(found.every((item) => onBoard.has(item.id))).toBe(true);
      expect(found.filter((item) => item.tone === "good").length).toBeLessThanOrEqual(STAND_OUT_LIMIT);
      expect(found.filter((item) => item.tone === "bad").length).toBeLessThanOrEqual(STAND_OUT_LIMIT);
    }
  });
});
