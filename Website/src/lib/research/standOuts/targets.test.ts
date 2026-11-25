import { describe, expect, it } from "vitest";
import { isFilterTarget, standOutTargets, teamStatOffense } from "./targets";

describe("stand-out targets", () => {
  it("reads which offense a stat-bar key belongs to", () => {
    expect(teamStatOffense(standOutTargets.teamStat("away", "pts"))).toBe("away");
    expect(teamStatOffense(standOutTargets.teamStat("home", "reb"))).toBe("home");
    expect(teamStatOffense(standOutTargets.player("jayson-tatum"))).toBeNull();
    expect(teamStatOffense(standOutTargets.comparison)).toBeNull();
  });

  it("tells a filter key from the button that opens the drawer", () => {
    expect(isFilterTarget(standOutTargets.filter("dvp"))).toBe(true);
    expect(isFilterTarget(standOutTargets.filtersButton)).toBe(false);
  });
});
