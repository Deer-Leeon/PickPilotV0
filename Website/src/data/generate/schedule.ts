import { addDays, createRng, daysBetween } from "./rng";

export interface TeamGame {
  date: string;
  opponentAbbr: string;
  isHome: boolean;
  /** Full days off before the game. */
  restDays: number;
}

interface ScheduleOptions {
  team: string;
  gamesPlayed: number;
  tonightOpponent: string;
  allTeams: readonly string[];
  slateDate: string;
  /** Forces the season opener, so a head-to-head game can exist. */
  opener?: { date: string; opponentAbbr: string; isHome: boolean };
}

/**
 * A team's completed games before the slate date, oldest first.
 *
 * Each team gets its own believable schedule: games one to three days apart,
 * a mix of home and road, no repeat opponents. Schedules are generated per
 * team and are not cross-checked, so team A's log may list team B on a date
 * team B's own log does not. That is fine for a UI mock and is one of the
 * things the real fixture table makes impossible.
 */
export function buildSchedule(options: ScheduleOptions): TeamGame[] {
  const { team, gamesPlayed, tonightOpponent, allTeams, slateDate, opener } = options;
  const rng = createRng(`schedule:${team}`);

  const firstDate = opener?.date ?? addDays("2026-10-21", rng.int(0, 2));
  // The last game is one or two days before the slate.
  const lastDate = addDays(slateDate, -rng.int(1, 2));
  const span = daysBetween(firstDate, lastDate);

  const gaps = Array.from({ length: gamesPlayed - 1 }, () => 2);
  let total = gaps.reduce((sum, gap) => sum + gap, 0);
  let guard = 0;
  while (total !== span && guard < 500) {
    const index = rng.int(0, gaps.length - 1);
    if (total < span && gaps[index] < 3) {
      gaps[index] += 1;
      total += 1;
    } else if (total > span && gaps[index] > 1) {
      gaps[index] -= 1;
      total -= 1;
    }
    guard += 1;
  }

  const opponents = rng
    .shuffle(allTeams.filter((abbr) => abbr !== team && abbr !== tonightOpponent && abbr !== opener?.opponentAbbr))
    .slice(0, gamesPlayed);

  const homeCount = Math.floor(gamesPlayed / 2);
  const homeFlags = rng.shuffle(Array.from({ length: gamesPlayed }, (_, index) => index < homeCount));

  const games: TeamGame[] = [];
  let date = firstDate;
  for (let i = 0; i < gamesPlayed; i += 1) {
    if (i > 0) date = addDays(date, gaps[i - 1]);
    const pinned = i === 0 ? opener : undefined;
    games.push({
      date,
      opponentAbbr: pinned?.opponentAbbr ?? opponents[i],
      isHome: pinned?.isHome ?? homeFlags[i],
      restDays: i === 0 ? 2 : gaps[i - 1] - 1,
    });
  }
  return games;
}

/** Days off between a team's last game and the slate. */
export function restBeforeSlate(schedule: readonly TeamGame[], slateDate: string): number {
  const last = schedule[schedule.length - 1];
  return last ? Math.max(0, daysBetween(last.date, slateDate) - 1) : 2;
}
