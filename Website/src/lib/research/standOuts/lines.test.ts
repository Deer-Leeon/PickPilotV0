import { beforeAll, describe, expect, it } from "vitest";
import { getGameLines } from "@/data/repository";
import type { GameLineOffer, GameLines } from "@/data/types";
import { lineStandOuts } from "./lines";
import { STAND_OUT_LIMIT } from "./standOut";

let lines: GameLines;

beforeAll(async () => {
  lines = (await getGameLines("nba", "nyk-bos"))!;
});

/** The real spread offers with the records and best-line flags a test needs, and every other market removed. */
function spreadOnly(away: Partial<GameLineOffer> & { record: [number, number] }, home: Partial<GameLineOffer> & { record: [number, number] }): GameLines {
  const offer = (base: GameLineOffer, { record, ...rest }: Partial<GameLineOffer> & { record: [number, number] }): GameLineOffer => ({
    ...base,
    isBest: false,
    ...rest,
    trend: { wins: record[0], losses: record[1], label: "ATS" },
  });
  return { ...lines, spread: [offer(lines.spread[0], away), offer(lines.spread[1], home)], total: [], derivatives: [], moneyline: [] };
}

describe("lineStandOuts", () => {
  it("judges a record like any other hit rate: good from 55%, bad down from 45%", () => {
    const found = lineStandOuts(spreadOnly({ record: [11, 9] }, { record: [9, 11] }));
    expect(found.map((item) => [item.subject, item.tone, item.figure, item.text])).toEqual([
      [lines.spread[0].title, "good", "55%", "11-9 ATS"],
      [lines.spread[1].title, "bad", "45%", "9-11 ATS"],
    ]);
    expect(found[0].targets).toEqual([`offer:${lines.spread[0].id}`]);
  });

  it("says nothing about an even record or a short one", () => {
    expect(lineStandOuts(spreadOnly({ record: [6, 6] }, { record: [4, 0] }))).toEqual([]);
  });

  it("calls out the best line on the board", () => {
    const found = lineStandOuts(spreadOnly({ record: [6, 6], isBest: true, price: -108, book: "FD" }, { record: [6, 6] }));
    expect(found).toEqual([
      expect.objectContaining({ tone: "good", subject: lines.spread[0].title, figure: "-108", text: "Best line on the board · FD" }),
    ]);
  });

  it("folds a best line into its strong record rather than listing the offer twice", () => {
    const found = lineStandOuts(spreadOnly({ record: [8, 3], isBest: true, price: 105, book: "DK" }, { record: [6, 6] }));
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ figure: "73%", text: "8-3 ATS · best line +105 (DK)" });
  });

  it("keeps a weak record bad even at the best line, and lists the offer once", () => {
    const found = lineStandOuts(spreadOnly({ record: [5, 7], isBest: true, price: -105, book: "PIN" }, { record: [6, 6] }));
    expect(found).toEqual([
      expect.objectContaining({ tone: "bad", subject: lines.spread[0].title, figure: "42%", text: "5-7 ATS · best line -105 (PIN)" }),
    ]);
  });

  it("stays within the limit on a full set of lines and never links away from the page", () => {
    const found = lineStandOuts(lines);
    expect(found.filter((item) => item.tone === "good").length).toBeLessThanOrEqual(STAND_OUT_LIMIT);
    expect(found.filter((item) => item.tone === "bad").length).toBeLessThanOrEqual(STAND_OUT_LIMIT);
    expect(found.every((item) => item.href === null)).toBe(true);
  });
});
