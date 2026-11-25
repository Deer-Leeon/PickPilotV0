import { describe, expect, it } from "vitest";
import { formatOrdinal } from "./format";

describe("formatOrdinal", () => {
  it("ends in st, nd, rd or th", () => {
    expect([1, 2, 3, 4, 10, 21, 22, 23, 30].map(formatOrdinal)).toEqual(["1st", "2nd", "3rd", "4th", "10th", "21st", "22nd", "23rd", "30th"]);
  });

  it("uses th for the teens", () => {
    expect([11, 12, 13, 111].map(formatOrdinal)).toEqual(["11th", "12th", "13th", "111th"]);
  });
});
