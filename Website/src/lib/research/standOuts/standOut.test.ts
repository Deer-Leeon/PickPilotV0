import { describe, expect, it } from "vitest";
import { STAND_OUT_LIMIT, formSwing, hitRateTone, pickStandOuts, type StandOut, type StandOutTone } from "./standOut";

const item = (id: string, tone: StandOutTone): StandOut => ({ id, tone, subject: id, figure: null, text: "", href: null, targets: [] });

describe("hitRateTone", () => {
  it("calls a rate good from 55% and bad down from 45%", () => {
    expect(hitRateTone(11, 20)).toBe("good");
    expect(hitRateTone(9, 20)).toBe("bad");
    expect(hitRateTone(8, 12)).toBe("good");
    expect(hitRateTone(3, 12)).toBe("bad");
  });

  it("says nothing about a rate near even", () => {
    expect(hitRateTone(5, 10)).toBeNull();
    expect(hitRateTone(6, 12)).toBeNull();
  });

  it("needs a real sample, and treats an empty one as no rate rather than 0%", () => {
    expect(hitRateTone(4, 4)).toBeNull();
    expect(hitRateTone(0, 0)).toBeNull();
    expect(hitRateTone(0, 0, 0)).toBeNull();
    expect(hitRateTone(3, 3, 3)).toBe("good");
  });
});

describe("formSwing", () => {
  it("is hot above the season average and cold below it", () => {
    expect(formSwing(25, 20)).toEqual({ change: 5, tone: "good" });
    expect(formSwing(15, 20)).toEqual({ change: -5, tone: "bad" });
  });

  it("ignores a move that is small for the player", () => {
    // Two points is a lot for a bench player and very little for a 30-point scorer.
    expect(formSwing(8, 6)?.tone).toBe("good");
    expect(formSwing(32, 30)).toBeNull();
  });

  it("ignores a move of less than one unit, however large the share", () => {
    expect(formSwing(2.6, 2)).toBeNull();
  });

  it("has nothing to say without both averages", () => {
    expect(formSwing(null, 20)).toBeNull();
    expect(formSwing(20, null)).toBeNull();
    expect(formSwing(5, 0)).toBeNull();
  });
});

describe("pickStandOuts", () => {
  it("lists good before bad and stops each at the limit", () => {
    const many = (tone: StandOutTone) => Array.from({ length: 9 }, (_, index) => item(`${tone}-${index}`, tone));
    const picked = pickStandOuts([[...many("bad"), ...many("good")]]);
    expect(picked.map((entry) => entry.tone)).toEqual([...Array(STAND_OUT_LIMIT).fill("good"), ...Array(STAND_OUT_LIMIT).fill("bad")]);
    expect(picked[0].id).toBe("good-0");
  });

  it("lets the kinds take turns, so one kind cannot crowd out the rest", () => {
    const picked = pickStandOuts([
      [item("a1", "good"), item("a2", "good"), item("a3", "good"), item("a4", "good")],
      [item("b1", "good")],
      [item("c1", "good"), item("c2", "good")],
    ]);
    expect(picked.map((entry) => entry.id)).toEqual(["a1", "b1", "c1", "a2"]);
  });

  it("keeps the first of two findings that share an id", () => {
    const picked = pickStandOuts([[item("same", "good")], [item("same", "good"), item("other", "good")]]);
    expect(picked.map((entry) => entry.id)).toEqual(["same", "other"]);
  });

  it("returns nothing when nothing stands out", () => {
    expect(pickStandOuts([])).toEqual([]);
    expect(pickStandOuts([[], []])).toEqual([]);
  });
});
