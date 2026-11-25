import type { Game, GameMatchup, StatWindow, Team, TeamStatKey, TeamWindowProfile } from "@/data/types";
import { formatOrdinal } from "@/lib/format";
import { STAT_BAR_ROWS, formatTeamStat } from "../matchup";
import { gradeStandOuts } from "./props";
import { pickStandOuts, type StandOut, type StandOutTone } from "./standOut";
import { standOutTargets, type OffenseSide } from "./targets";

/** A team rank within this many places of first or of last is called out. */
export const RANK_EDGE = 5;

/** An offense and the defense it faces have to be this many places apart to be a mismatch. */
export const MIN_RANK_GAP = 15;

/** Pace is context, not a strength or a weakness, so it is never called out. */
const RANKED_STATS = STAT_BAR_ROWS.filter((row) => row.key !== "pace");

type Side = "offense" | "defense";

/** "Points", "Points allowed", "Turnovers forced" */
function statPhrase(key: TeamStatKey, label: string, side: Side): string {
  if (side === "offense") return label;
  return key === "tov" ? `${label} forced` : `${label} allowed`;
}

/** A team as it plays in this game: which side it is on, and its profile for the window on screen. */
interface TeamInGame {
  team: Team;
  side: OffenseSide;
  profile: TeamWindowProfile;
}

const otherSide = (side: OffenseSide): OffenseSide => (side === "away" ? "home" : "away");

/** The stat-bar row that shows the stat, in the view where the given side has the ball, then the card around it. */
function statTargets(offense: OffenseSide, key: TeamStatKey): string[] {
  return [standOutTargets.teamStat(offense, key), standOutTargets.comparison];
}

function mismatchStandOuts(attack: TeamInGame, defend: TeamInGame) {
  const { team: offense, profile: offenseProfile } = attack;
  const { team: defense, profile: defenseProfile } = defend;
  const found: { item: StandOut; gap: number }[] = [];
  for (const { key, label } of RANKED_STATS) {
    const offenseRank = offenseProfile.offense[key].rank;
    const defenseRank = defenseProfile.defense[key].rank;
    // Positive: a strong offense meets a weak defense. Negative: the other way round.
    const gap = defenseRank - offenseRank;
    if (Math.abs(gap) < MIN_RANK_GAP) continue;
    found.push({
      gap: Math.abs(gap),
      item: {
        id: `gap:${offense.abbr}:${key}`,
        tone: gap > 0 ? "good" : "bad",
        subject: `${offense.abbr} offense`,
        figure: formatOrdinal(offenseRank),
        text: `${label} · ${defense.abbr} defense ranks ${formatOrdinal(defenseRank)}`,
        href: null,
        targets: statTargets(attack.side, key),
      },
    });
  }
  return found;
}

function rankStandOuts({ team, side: teamSide, profile }: TeamInGame, teamCount: number) {
  const found: { item: StandOut; fromEdge: number }[] = [];
  for (const side of ["offense", "defense"] as const) {
    for (const { key, label, percent } of RANKED_STATS) {
      const { rank, value } = profile[side][key];
      let tone: StandOutTone | null = null;
      if (rank <= RANK_EDGE) tone = "good";
      else if (rank > teamCount - RANK_EDGE) tone = "bad";
      if (!tone) continue;
      found.push({
        fromEdge: tone === "good" ? rank : teamCount + 1 - rank,
        item: {
          id: `rank:${team.abbr}:${side}:${key}`,
          tone,
          subject: `${team.abbr} ${side}`,
          figure: formatOrdinal(rank),
          text: `${statPhrase(key, label, side)} · ${formatTeamStat(value, percent)}`,
          href: null,
          // A defense is on screen while the other team has the ball.
          targets: statTargets(side === "offense" ? teamSide : otherSide(teamSide), key),
        },
      });
    }
  }
  return found;
}

interface MatchupStandOutInput {
  game: Game;
  matchup: GameMatchup;
  /** The stat window on screen: team ranks are read for it. */
  window: StatWindow;
  /** Teams in the league, which is also the worst possible rank. */
  teamCount: number;
  league: string;
}

/**
 * The Matchup tab: the biggest offense-versus-defense mismatches, team ranks
 * at either end of the league, and the best and worst graded starter props.
 */
export function matchupStandOuts({ game, matchup, window, teamCount, league }: MatchupStandOutInput): StandOut[] {
  const away: TeamInGame = { team: game.away.team, side: "away", profile: matchup.comparison.away[window] };
  const home: TeamInGame = { team: game.home.team, side: "home", profile: matchup.comparison.home[window] };

  const mismatches = [...mismatchStandOuts(away, home), ...mismatchStandOuts(home, away)]
    .sort((a, b) => b.gap - a.gap || a.item.id.localeCompare(b.item.id))
    .map(({ item }) => item);

  const ranks = [...rankStandOuts(away, teamCount), ...rankStandOuts(home, teamCount)]
    .sort((a, b) => a.fromEdge - b.fromEdge || a.item.id.localeCompare(b.item.id))
    .map(({ item }) => item);

  const starters = [...matchup.rosters.away.starters, ...matchup.rosters.home.starters];

  return pickStandOuts([mismatches, ranks, gradeStandOuts(starters, league)]);
}
