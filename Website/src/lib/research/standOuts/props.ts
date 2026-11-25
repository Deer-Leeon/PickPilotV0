import type { RotationPlayer } from "@/data/types";
import { formatPercent } from "@/lib/format";
import { routes } from "@/lib/routes";
import { gradeRank, gradeTone, isTopGrade } from "../grades";
import { formatPropLine } from "../stats";
import { hitRateTone, type StandOut, type StandOutTone } from "./standOut";
import { standOutTargets } from "./targets";

/**
 * Findings about players' featured props, shared by every page that lists
 * rotations. A prop's hit-rate finding and its grade finding share one id,
 * so a page that asks for both shows each prop once.
 */

function propId(entry: RotationPlayer): string {
  return `prop:${entry.player.id}:${entry.featuredProp?.stat ?? "none"}`;
}

/** The player's own row where the page has one, otherwise their team's. */
function propTargets({ player }: RotationPlayer): string[] {
  return [standOutTargets.player(player.id), standOutTargets.team(player.teamId)];
}

/** Top grades are good, D+ and below are bad, and a B or C says nothing either way. */
function gradeStandOutTone(entry: RotationPlayer): StandOutTone | null {
  const grade = entry.featuredProp?.grade;
  if (!grade) return null;
  if (isTopGrade(grade)) return "good";
  return gradeTone(grade) === "bad" ? "bad" : null;
}

/** Featured props whose Over has clearly been hitting or clearly been missing this season, furthest from even first. */
export function hitRateStandOuts(entries: readonly RotationPlayer[], league: string): StandOut[] {
  const found: { item: StandOut; distance: number; total: number }[] = [];
  for (const entry of entries) {
    const { player, featuredProp, featuredHits } = entry;
    if (!featuredProp || !featuredHits) continue;
    const tone = hitRateTone(featuredHits.hits, featuredHits.total);
    if (!tone) continue;
    const rate = featuredHits.hits / featuredHits.total;
    const grade = gradeStandOutTone(entry) === tone ? ` · Grade ${featuredProp.grade}` : "";
    found.push({
      distance: Math.abs(rate - 0.5),
      total: featuredHits.total,
      item: {
        id: propId(entry),
        tone,
        subject: player.name,
        figure: formatPercent(rate),
        text: `Over ${formatPropLine(featuredProp.line, featuredProp.stat)} · hit ${featuredHits.hits} of ${featuredHits.total}${grade}`,
        href: routes.player(league, player.id, { stat: featuredProp.stat }),
        targets: propTargets(entry),
      },
    });
  }
  return found
    .sort((a, b) => b.distance - a.distance || b.total - a.total || a.item.id.localeCompare(b.item.id))
    .map(({ item }) => item);
}

/** Featured props with a top grade (best first), then those graded D+ or worse (worst first). */
export function gradeStandOuts(entries: readonly RotationPlayer[], league: string): StandOut[] {
  const found: { item: StandOut; rank: number }[] = [];
  for (const entry of entries) {
    const { player, featuredProp, featuredHits } = entry;
    const tone = gradeStandOutTone(entry);
    if (!featuredProp || !tone) continue;
    const record = featuredHits && featuredHits.total > 0 ? ` · hit ${featuredHits.hits} of ${featuredHits.total}` : "";
    found.push({
      rank: gradeRank(featuredProp.grade),
      item: {
        id: propId(entry),
        tone,
        subject: player.name,
        figure: featuredProp.grade,
        text: `Over ${formatPropLine(featuredProp.line, featuredProp.stat)}${record}`,
        href: routes.player(league, player.id, { stat: featuredProp.stat }),
        targets: propTargets(entry),
      },
    });
  }
  const byId = (a: { item: StandOut }, b: { item: StandOut }) => a.item.id.localeCompare(b.item.id);
  const good = found.filter(({ item }) => item.tone === "good").sort((a, b) => a.rank - b.rank || byId(a, b));
  const bad = found.filter(({ item }) => item.tone === "bad").sort((a, b) => b.rank - a.rank || byId(a, b));
  return [...good, ...bad].map(({ item }) => item);
}
