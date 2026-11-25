import type { LeaderRow } from "@/data/types";
import { routes } from "@/lib/routes";
import { selectLeaders, type LeaderFilter } from "../leaders";
import { pickStandOuts, type StandOut } from "./standOut";
import { standOutTargets } from "./targets";

/** The run a leader's recent form is judged on, and how many misses in it make a leader a worry. */
export const RECENT_RUN = 5;
export const COOLING_MISSES = 3;

function leaderHref({ target }: LeaderRow, league: string): string {
  return target.kind === "player" ? routes.player(league, target.playerId, { stat: target.stat }) : routes.game(league, target.gameId, "lines");
}

/**
 * The Leaders board, for the category on screen: leaders that also hit in
 * every one of their last five, and leaders whose season rate hides a recent
 * slide. Rows keep the board's order, so the higher-ranked leader comes first.
 */
export function leaderStandOuts(rows: readonly LeaderRow[], filter: LeaderFilter, league: string): StandOut[] {
  const perfect: StandOut[] = [];
  const cooling: { item: StandOut; misses: number; rank: number }[] = [];

  for (const { row, rank } of selectLeaders(rows, filter)) {
    if (row.lastFive.length < RECENT_RUN) continue;
    const misses = row.lastFive.filter((hit) => !hit).length;
    // The figure is the recent run, "5/5" or "1/5". The season record that put the row on the board follows in the text.
    const base = {
      id: row.id,
      subject: row.name,
      figure: `${RECENT_RUN - misses}/${RECENT_RUN}`,
      text: `Last ${RECENT_RUN} · ${row.propLabel} · season ${row.hits} of ${row.sample}`,
      href: leaderHref(row, league),
      targets: [standOutTargets.leader(row.id)],
    };
    if (misses === 0) {
      perfect.push({ ...base, tone: "good" });
    } else if (misses >= COOLING_MISSES) {
      cooling.push({ misses, rank, item: { ...base, tone: "bad" } });
    }
  }

  return pickStandOuts([perfect, cooling.sort((a, b) => b.misses - a.misses || a.rank - b.rank).map(({ item }) => item)]);
}
