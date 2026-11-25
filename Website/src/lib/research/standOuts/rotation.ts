import type { GameRosters, RotationPlayer, StatWindow } from "@/data/types";
import { formatAverage, formatSigned } from "@/lib/format";
import { routes } from "@/lib/routes";
import { gradeStandOuts, hitRateStandOuts } from "./props";
import { formSwing, pickStandOuts, type StandOut } from "./standOut";
import { standOutTargets } from "./targets";

/**
 * The recent window form is measured over. The season window has nothing
 * recent to compare with itself, so it falls back to the last five.
 */
const RECENT_WINDOW: Record<StatWindow, { window: "l3" | "l5"; games: number }> = {
  l3: { window: "l3", games: 3 },
  l5: { window: "l5", games: 5 },
  season: { window: "l5", games: 5 },
};

/** Players whose recent scoring is well above (hot) or well below (cold) their season average, biggest swing first. */
export function formStandOuts(entries: readonly RotationPlayer[], window: StatWindow, league: string): StandOut[] {
  const recent = RECENT_WINDOW[window];
  const found: { item: StandOut; size: number }[] = [];
  for (const { player, averages } of entries) {
    const season = averages.season.pts;
    const latest = averages[recent.window].pts;
    const swing = formSwing(latest, season);
    if (!swing) continue;
    found.push({
      size: Math.abs(swing.change),
      item: {
        id: `form:${player.id}`,
        tone: swing.tone,
        subject: player.name,
        figure: formatSigned(swing.change),
        text: `${formatAverage(latest)} PTS over the last ${recent.games} · season ${formatAverage(season)}`,
        href: routes.player(league, player.id),
        targets: [standOutTargets.player(player.id), standOutTargets.team(player.teamId)],
      },
    });
  }
  return found.sort((a, b) => b.size - a.size || a.item.id.localeCompare(b.item.id)).map(({ item }) => item);
}

/**
 * The Players tab: who is running hot or cold, the featured props that have
 * clearly been hitting or missing, and the best and worst grades.
 */
export function rotationStandOuts(rosters: GameRosters, window: StatWindow, league: string): StandOut[] {
  const players = [rosters.away, rosters.home].flatMap((roster) => [...roster.starters, ...roster.bench]);
  return pickStandOuts([formStandOuts(players, window, league), hitRateStandOuts(players, league), gradeStandOuts(players, league)]);
}
