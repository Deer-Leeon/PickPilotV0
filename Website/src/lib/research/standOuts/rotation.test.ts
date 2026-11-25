import { beforeAll, describe, expect, it } from "vitest";
import { getGamePlayers } from "@/data/repository";
import type { GameRosters, RotationPlayer } from "@/data/types";
import { formStandOuts, rotationStandOuts } from "./rotation";
import { STAND_OUT_LIMIT } from "./standOut";

let rosters: GameRosters;
let players: RotationPlayer[];

beforeAll(async () => {
  rosters = (await getGamePlayers("nba", "nyk-bos"))!;
  players = [...rosters.away.starters, ...rosters.home.starters];
});

/** A real player with the scoring averages a test needs. */
function scoring(entry: RotationPlayer, l3: number, l5: number, season: number): RotationPlayer {
  const line = (pts: number) => ({ pts, reb: 5, ast: 5 });
  return { ...entry, averages: { l3: line(l3), l5: line(l5), season: line(season) } };
}

describe("formStandOuts", () => {
  it("calls a player hot or cold against the season, biggest swing first", () => {
    const found = formStandOuts([scoring(players[0], 20, 24, 20), scoring(players[1], 20, 12, 20), scoring(players[2], 20, 21, 20)], "l5", "nba");
    expect(found.map((item) => [item.subject, item.tone])).toEqual([
      [players[1].player.name, "bad"],
      [players[0].player.name, "good"],
    ]);
    expect(found[0]).toMatchObject({ figure: "-8.0", text: "12.0 PTS over the last 5 · season 20.0" });
    expect(found[1]).toMatchObject({ figure: "+4.0", text: "24.0 PTS over the last 5 · season 20.0" });
    expect(found[0].targets).toEqual([`player:${players[1].player.id}`, `team:${players[1].player.teamId}`]);
    expect(found[0].href).toBe(`/nba/players/${players[1].player.id}`);
  });

  it("measures form over the window on screen, and over the last five for the season window", () => {
    const entry = scoring(players[0], 30, 20, 20);
    expect(formStandOuts([entry], "l3", "nba")).toHaveLength(1);
    expect(formStandOuts([entry], "l3", "nba")[0].text).toContain("over the last 3");
    expect(formStandOuts([entry], "l5", "nba")).toEqual([]);
    expect(formStandOuts([entry], "season", "nba")).toEqual([]);
  });

  it("does not treat a player with no games as averaging zero", () => {
    expect(formStandOuts([scoring(players[0], 0, 0, 0)], "l5", "nba")).toEqual([]);
  });
});

describe("rotationStandOuts", () => {
  it("stays within the limit, lists each finding once and links each to a player", () => {
    for (const window of ["l3", "l5", "season"] as const) {
      const found = rotationStandOuts(rosters, window, "nba");
      expect(found.filter((item) => item.tone === "good").length).toBeLessThanOrEqual(STAND_OUT_LIMIT);
      expect(found.filter((item) => item.tone === "bad").length).toBeLessThanOrEqual(STAND_OUT_LIMIT);
      expect(new Set(found.map((item) => item.id)).size).toBe(found.length);
      expect(found.every((item) => item.href?.startsWith("/nba/players/"))).toBe(true);
    }
  });
});
