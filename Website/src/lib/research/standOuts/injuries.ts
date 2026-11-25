import type { GameInjuries, InjuryReportEntry, InjuryStatus } from "@/data/types";
import { lastName } from "@/lib/format";
import { pickStandOuts, type StandOut, type StandOutTone } from "./standOut";
import { standOutTargets } from "./targets";

const STATUS_LABELS: Record<InjuryStatus, string> = {
  OUT: "Out",
  DOUBTFUL: "Doubtful",
  QUESTIONABLE: "Questionable",
  PROBABLE: "Probable",
};

/**
 * Out and doubtful are bad news, probable is good news. Questionable could go
 * either way, so it is not called out.
 */
const STATUS_TONES: Record<InjuryStatus, StandOutTone | null> = {
  OUT: "bad",
  DOUBTFUL: "bad",
  QUESTIONABLE: null,
  PROBABLE: "good",
};

/** A status that rules a player out is the figure itself. Probable is spelled out in the text instead. */
const STATUS_FIGURES: Record<InjuryStatus, string | null> = {
  OUT: "OUT",
  DOUBTFUL: "DOUBT",
  QUESTIONABLE: null,
  PROBABLE: null,
};

/** The player's row on an injury report, otherwise their team. */
function injuryTargets(entry: InjuryReportEntry): string[] {
  return [standOutTargets.injury(entry.id), standOutTargets.team(entry.teamId)];
}

/** Most certain first. */
const STATUS_ORDER: readonly InjuryStatus[] = ["OUT", "DOUBTFUL", "PROBABLE", "QUESTIONABLE"];

/** A player's status as a stand-out, or null when the status says nothing either way. */
export function availabilityStandOut(entry: InjuryReportEntry, teamAbbr: string, href: string | null): StandOut | null {
  const tone = STATUS_TONES[entry.status];
  if (!tone) return null;
  const figure = STATUS_FIGURES[entry.status];
  return {
    id: entry.id,
    tone,
    subject: entry.playerName,
    figure,
    text: figure ? `${teamAbbr} · ${entry.injury}` : `${STATUS_LABELS[entry.status]} for ${teamAbbr} · ${entry.injury}`,
    href,
    targets: injuryTargets(entry),
  };
}

/** The feed's note on who gains from an absence. It names who benefits, so it is good news. */
export function impactStandOut(entry: InjuryReportEntry, href: string | null): StandOut | null {
  if (!entry.impactNote || STATUS_TONES[entry.status] !== "bad") return null;
  return {
    id: `${entry.id}:impact`,
    tone: "good",
    subject: `Without ${lastName(entry.playerName)}`,
    // The note is the feed's own sentence, so there is no single figure to lift out of it.
    figure: null,
    text: entry.impactNote,
    href,
    targets: injuryTargets(entry),
  };
}

function isStandOut(item: StandOut | null): item is StandOut {
  return item !== null;
}

/** The Injuries tab: who is out or doubtful, who is expected back, and who gains from an absence. */
export function injuryStandOuts(injuries: GameInjuries): StandOut[] {
  const entries = [injuries.away, injuries.home]
    .flatMap(({ team, entries: list }) => list.map((entry) => ({ entry, abbr: team.abbr })))
    .sort((a, b) => STATUS_ORDER.indexOf(a.entry.status) - STATUS_ORDER.indexOf(b.entry.status));

  return pickStandOuts([
    entries.map(({ entry, abbr }) => availabilityStandOut(entry, abbr, null)).filter(isStandOut),
    entries.map(({ entry }) => impactStandOut(entry, null)).filter(isStandOut),
  ]);
}
