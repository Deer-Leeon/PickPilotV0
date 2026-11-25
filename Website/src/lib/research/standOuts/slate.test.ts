import { beforeAll, describe, expect, it } from "vitest";
import { getSlatePlayers } from "@/data/repository";
import type { Grade, RotationPlayer, SlateGamePlayers } from "@/data/types";
import { gradeStandOuts, hitRateStandOuts } from "./props";
import { slateStandOuts } from "./slate";
import { STAND_OUT_LIMIT } from "./standOut";

let slate: SlateGamePlayers[];
/** Real players with a featured prop, to be given the records and grades a test needs. */
let players: RotationPlayer[];

beforeAll(async () => {
  slate = await getSlatePlayers("nba");
  players = slate.flatMap(({ rosters }) => [...rosters.away.starters, ...rosters.home.starters]).filter((entry) => entry.featuredProp);
});

function withRecord(entry: RotationPlayer, hits: number, total: number, grade: Grade = "C"): RotationPlayer {
  return { ...entry, featuredProp: { ...entry.featuredProp!, grade }, featuredHits: { hits, total } };
}

describe("hitRateStandOuts", () => {
  it("calls out props that have clearly been hitting or missing, furthest from even first", () => {
    const found = hitRateStandOuts(
      [withRecord(players[0], 7, 10), withRecord(players[1], 5, 10), withRecord(players[2], 1, 10), withRecord(players[3], 4, 4)],
      "nba",
    );
    expect(found.map((item) => [item.subject, item.tone])).toEqual([
      [players[2].player.name, "bad"],
      [players[0].player.name, "good"],
    ]);
    expect(found[1].figure).toBe("70%");
    expect(found[1].text).toContain("hit 7 of 10");
    // The player's own row where the page lists players, otherwise their team's row.
    expect(found[1].targets).toEqual([`player:${players[0].player.id}`, `team:${players[0].player.teamId}`]);
    expect(found[1].href).toBe(`/nba/players/${players[0].player.id}?stat=${encodeURIComponent(players[0].featuredProp!.stat)}`);
  });

  it("mentions the grade only when it agrees with the record", () => {
    const [agrees, differs] = hitRateStandOuts([withRecord(players[0], 9, 10, "A"), withRecord(players[1], 8, 10, "D")], "nba");
    expect(agrees.text).toContain("Grade A");
    expect(differs.text).not.toContain("Grade");
  });

  it("skips players with no prop posted", () => {
    expect(hitRateStandOuts([{ ...players[0], featuredProp: null, featuredHits: null }], "nba")).toEqual([]);
  });
});

describe("gradeStandOuts", () => {
  it("calls out top grades and poor grades, and leaves the middle alone", () => {
    const found = gradeStandOuts(
      [withRecord(players[0], 5, 10, "B"), withRecord(players[1], 5, 10, "F"), withRecord(players[2], 5, 10, "A-"), withRecord(players[3], 5, 10, "A"), withRecord(players[4], 5, 10, "D+")],
      "nba",
    );
    expect(found.map((item) => [item.subject, item.tone, item.figure])).toEqual([
      [players[3].player.name, "good", "A"],
      [players[2].player.name, "good", "A-"],
      [players[1].player.name, "bad", "F"],
      [players[4].player.name, "bad", "D+"],
    ]);
  });
});

describe("slateStandOuts", () => {
  it("lists at most the limit of each tone, each prop once, and links every finding", () => {
    const found = slateStandOuts(slate, "nba");
    expect(found.filter((item) => item.tone === "good").length).toBeLessThanOrEqual(STAND_OUT_LIMIT);
    expect(found.filter((item) => item.tone === "bad").length).toBeLessThanOrEqual(STAND_OUT_LIMIT);
    expect(found.filter((item) => item.tone === "good").length).toBeGreaterThan(0);
    expect(new Set(found.map((item) => item.id)).size).toBe(found.length);
    expect(found.every((item) => item.href?.startsWith("/nba/"))).toBe(true);
  });

  it("calls out a player ruled out, linked to that game's injury report", () => {
    const { game, rosters } = slate.find((entry) => entry.game.id === "nyk-bos")!;
    // Props are removed so the absences are not competing with them for a place in the list.
    const noProps = (roster: SlateGamePlayers["rosters"]["away"]) => ({ ...roster, starters: [], bench: [] });
    const found = slateStandOuts([{ game, rosters: { ...rosters, away: noProps(rosters.away), home: noProps(rosters.home) } }], "nba");
    const porzingis = found.find((item) => item.subject === "Kristaps Porzingis");
    expect(porzingis).toMatchObject({ tone: "bad", href: "/nba/games/nyk-bos/injuries" });
    expect(porzingis).toMatchObject({ figure: "OUT", targets: [expect.stringMatching(/^injury:/), "team:bos"] });
    expect(porzingis?.text).toMatch(/^BOS · /);
    // The feed's note on who gains from the absence is good news.
    expect(found.find((item) => item.subject === "Without Porzingis")).toMatchObject({ tone: "good" });
  });

  it("does not call out a player who is only questionable", () => {
    const found = slateStandOuts(slate, "nba");
    expect(found.some((item) => item.subject === "Marcus Smart")).toBe(false);
  });

  it("has nothing to say about a date with no games", () => {
    expect(slateStandOuts([], "nba")).toEqual([]);
  });
});
