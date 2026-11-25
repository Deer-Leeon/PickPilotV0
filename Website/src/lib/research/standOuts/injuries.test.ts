import { beforeAll, describe, expect, it } from "vitest";
import { getGameInjuries } from "@/data/repository";
import type { GameInjuries, InjuryReportEntry, InjuryStatus } from "@/data/types";
import { injuryStandOuts } from "./injuries";

let injuries: GameInjuries;

beforeAll(async () => {
  injuries = (await getGameInjuries("nba", "nyk-bos"))!;
});

function entry(playerName: string, status: InjuryStatus, impactNote: string | null = null): InjuryReportEntry {
  return { id: `inj-${playerName}`, teamId: "bos", playerName, position: "G", status, injury: "Left Ankle Sprain", impactNote, headshotKey: null };
}

const report = (entries: InjuryReportEntry[]): GameInjuries => ({ ...injuries, away: { ...injuries.away, entries: [] }, home: { ...injuries.home, entries } });

describe("injuryStandOuts", () => {
  it("lists who is out as bad and the sourced note on who gains as good", () => {
    const found = injuryStandOuts(injuries);
    expect(found.map((item) => [item.subject, item.tone])).toEqual([
      ["Without Robinson", "good"],
      ["Without Porzingis", "good"],
      ["Mitchell Robinson", "bad"],
      ["Kristaps Porzingis", "bad"],
    ]);
    // Being out is the figure, so the text does not repeat it.
    expect(found[2]).toMatchObject({ figure: "OUT", text: "NYK · Left Ankle Surgery" });
    // The feed's note is a sentence, not a number: it is shown as written, with no figure.
    expect(found[0]).toMatchObject({ figure: null, text: "Karl-Anthony Towns +3.8 Reb/G boost" });
  });

  it("points at the player's row on the report, then at their team", () => {
    const [found] = injuryStandOuts(report([entry("D Out", "OUT")]));
    expect(found.targets).toEqual(["injury:inj-D Out", "team:bos"]);
  });

  it("puts the most certain status first, calls probable good and leaves questionable out", () => {
    const found = injuryStandOuts(report([entry("A Probable", "PROBABLE"), entry("B Questionable", "QUESTIONABLE"), entry("C Doubtful", "DOUBTFUL"), entry("D Out", "OUT")]));
    expect(found.map((item) => [item.subject, item.tone])).toEqual([
      ["A Probable", "good"],
      ["D Out", "bad"],
      ["C Doubtful", "bad"],
    ]);
    expect(found[0]).toMatchObject({ figure: null, text: "Probable for BOS · Left Ankle Sprain" });
    expect(found[2]).toMatchObject({ figure: "DOUBT", text: "BOS · Left Ankle Sprain" });
  });

  it("only reads an impact note on a player who is out or doubtful", () => {
    const found = injuryStandOuts(report([entry("A Probable", "PROBABLE", "Someone gains")]));
    expect(found.map((item) => item.subject)).toEqual(["A Probable"]);
  });

  it("has nothing to say when nobody is on the report", () => {
    expect(injuryStandOuts(report([]))).toEqual([]);
  });
});
