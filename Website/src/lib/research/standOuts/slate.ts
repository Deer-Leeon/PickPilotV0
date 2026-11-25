import type { SlateGamePlayers } from "@/data/types";
import { routes } from "@/lib/routes";
import { availabilityStandOut, impactStandOut } from "./injuries";
import { gradeStandOuts, hitRateStandOuts } from "./props";
import { pickStandOuts, type StandOut } from "./standOut";

/**
 * The Games board and the Props list: across the games given, the featured
 * props that have clearly been hitting or missing, the best and worst grades,
 * the players ruled out, and who gains from an absence.
 */
export function slateStandOuts(slate: readonly SlateGamePlayers[], league: string): StandOut[] {
  const rosters = slate.flatMap(({ game, rosters: { away, home } }) => [
    { game, roster: away },
    { game, roster: home },
  ]);
  const players = rosters.flatMap(({ roster }) => [...roster.starters, ...roster.bench]);

  // Absences with a sourced note on who gains come first: they are the ones that change a prop.
  const absences = rosters
    .flatMap(({ game, roster }) =>
      roster.injuries
        .filter((entry) => entry.status === "OUT")
        .map((entry) => ({ entry, abbr: roster.team.abbr, href: routes.game(league, game.id, "injuries") })),
    )
    .sort((a, b) => Number(b.entry.impactNote !== null) - Number(a.entry.impactNote !== null));

  const keep = (item: StandOut | null): item is StandOut => item !== null;

  return pickStandOuts([
    hitRateStandOuts(players, league),
    gradeStandOuts(players, league),
    absences.map(({ entry, abbr, href }) => availabilityStandOut(entry, abbr, href)).filter(keep),
    absences.map(({ entry, href }) => impactStandOut(entry, href)).filter(keep),
  ]);
}
