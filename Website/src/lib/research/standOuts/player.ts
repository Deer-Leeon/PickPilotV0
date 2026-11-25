import type { PlayerResearch, StatId } from "@/data/types";
import { formatAverage, formatOrdinal, formatPercent, formatSigned, lastName } from "@/lib/format";
import type { FilterCatalogItem } from "../filters";
import { gradeTone, isTopGrade } from "../grades";
import { isSoftMatchup, isToughMatchup } from "../matchup";
import { formatOdds } from "../odds";
import { average, takeSample, type SampleWindow } from "../sample";
import { summarizeComps } from "../similar";
import { STAT_FAMILIES, formatPropLine, getStatValue } from "../stats";
import type { ResearchView } from "../view";
import { formSwing, hitRateTone, pickStandOuts, type StandOut } from "./standOut";
import { standOutTargets } from "./targets";

/**
 * The games on screen can be few once filters are on, so the bar is lower
 * here than on the boards: three results are enough to say something.
 */
export const MIN_ON_SCREEN_SAMPLE = 3;

/** A split needs at least this many games on each side before the two are compared. */
export const MIN_SPLIT_GAMES = 2;

interface PlayerStandOutInput {
  research: PlayerResearch;
  /** What the page is showing: the stat, with the sample and filters already applied. */
  view: ResearchView;
  sample: SampleWindow;
  /** How many filters are on, so the hit-rate finding can say what it covers. */
  filterCount: number;
  /** The filter catalog, which carries tonight's opponent rank and a label for every matchup metric. */
  catalog: readonly FilterCatalogItem[];
}

/** The sample window as it reads in a sentence. */
const SAMPLE_PHRASE: Record<SampleWindow, string> = { l5: "over the last 5", l10: "over the last 10", season: "this season" };

/** Double-double is a yes or no each night, so it has no average to compare. */
function hasAverage(stat: StatId): boolean {
  return stat !== "DD";
}

/**
 * The player page, for the stat, sample and filters on screen: the hit rate
 * of the games shown, the prop's grade, the softest and toughest parts of
 * tonight's matchup, recent form, the schedule, the split without a teammate
 * who is out, and how similar players fared against this opponent.
 */
export function playerStandOuts({ research, view, sample, filterCount, catalog }: PlayerStandOutInput): StandOut[] {
  const { gameLog, opponent, upcoming, teammateOut } = research;
  const { stat, prop, hitRate } = view;
  const statLabel = STAT_FAMILIES[stat].shortLabel;
  const values = gameLog.map((game) => getStatValue(game, stat));
  const kinds: StandOut[][] = [];

  // Hit rate of the games on screen. No matching games means nothing to say, never 0%.
  const rateTone = hitRateTone(hitRate.hits, hitRate.total, MIN_ON_SCREEN_SAMPLE);
  if (prop && rateTone && hitRate.rate !== null) {
    const record = `${hitRate.hits} of ${hitRate.total}`;
    const when = SAMPLE_PHRASE[sample];
    kinds.push([
      {
        id: "hit-rate",
        tone: rateTone,
        subject: `Over ${formatPropLine(prop.line, stat)}`,
        figure: formatPercent(hitRate.rate),
        text:
          filterCount > 0
            ? `Hit ${record} matching games ${when} · ${filterCount} ${filterCount === 1 ? "filter" : "filters"} on`
            : `Hit ${record} ${when}`,
        href: null,
        targets: [standOutTargets.hitRate, standOutTargets.chart],
      },
    ]);
  }

  // The grade is data. It is only sorted into good or bad here.
  if (prop && (isTopGrade(prop.grade) || gradeTone(prop.grade) === "bad")) {
    kinds.push([
      {
        id: "grade",
        tone: isTopGrade(prop.grade) ? "good" : "bad",
        subject: "Prop grade",
        figure: prop.grade,
        text: `Over ${formatPropLine(prop.line, stat)} at ${formatOdds(prop.over.price)} (${prop.over.book})`,
        href: null,
        targets: [standOutTargets.prop, standOutTargets.chart],
      },
    ]);
  }

  // Tonight's opponent, metric by metric: the softest spots first, then the toughest.
  const ranked = catalog.flatMap((item) => (item.oppRank === null ? [] : [{ item, rank: item.oppRank }]));
  const matchup = (tone: "good" | "bad") =>
    ranked
      .filter(({ rank }) => (tone === "good" ? isSoftMatchup(rank) : isToughMatchup(rank)))
      .sort((a, b) => (tone === "good" ? b.rank - a.rank : a.rank - b.rank))
      .map(
        ({ item, rank }): StandOut => ({
          id: `opp:${item.id}`,
          tone,
          subject: item.name,
          figure: formatOrdinal(rank),
          text: `${opponent.abbr} · ${tone === "good" ? "soft" : "tough"} matchup tonight`,
          href: null,
          // Each of these ranks is a filter, and the filter drawer shows the rank beside it.
          targets: [standOutTargets.filter(item.id), standOutTargets.filtersButton],
        }),
      );
  kinds.push([...matchup("good"), ...matchup("bad")]);

  // Recent form: the last five against the whole season.
  if (hasAverage(stat) && gameLog.length > 5) {
    const recent = average(takeSample(values, "l5"));
    const season = average(values);
    const swing = formSwing(recent, season);
    if (swing && recent !== null && season !== null) {
      kinds.push([
        {
          id: "form",
          tone: swing.tone,
          subject: "Recent form",
          figure: formatSigned(swing.change),
          text: `${formatAverage(recent)} ${statLabel} over the last 5 · season ${formatAverage(season)}`,
          href: null,
          targets: [standOutTargets.chart],
        },
      ]);
    }
  }

  if (upcoming.restDays === 0) {
    kinds.push([
      {
        id: "rest",
        tone: "bad",
        subject: "Back-to-back",
        figure: "B2B",
        text: `Second night in a row · ${upcoming.isHome ? "at home" : "on the road"}`,
        href: null,
        targets: [standOutTargets.tonight, standOutTargets.chart],
      },
    ]);
  }

  // A teammate ruled out tonight: how the player has done in the games that teammate missed.
  if (teammateOut && hasAverage(stat)) {
    const without = gameLog.filter((game) => game.teammatesOut.includes(teammateOut.id)).map((game) => getStatValue(game, stat));
    const withHim = gameLog.filter((game) => !game.teammatesOut.includes(teammateOut.id)).map((game) => getStatValue(game, stat));
    if (without.length >= MIN_SPLIT_GAMES && withHim.length >= MIN_SPLIT_GAMES) {
      const apart = average(without);
      const together = average(withHim);
      const swing = formSwing(apart, together);
      if (swing && apart !== null && together !== null) {
        kinds.push([
          {
            id: "teammate-out",
            tone: swing.tone,
            subject: `Without ${lastName(teammateOut.playerName)}`,
            figure: formatSigned(swing.change),
            text: `${formatAverage(apart)} ${statLabel} in ${without.length} games without him · ${formatAverage(together)} in ${withHim.length} with`,
            href: null,
            // "Without" is a filter too: the drawer shows how many games it covers.
            targets: [standOutTargets.filter("without"), standOutTargets.filtersButton],
          },
        ]);
      }
    }
  }

  // Similar players are compared on their points line, whatever stat is on screen.
  const comps = summarizeComps(research.similar).hitRate;
  const compsTone = hitRateTone(comps.hits, comps.total, MIN_ON_SCREEN_SAMPLE);
  if (compsTone) {
    kinds.push([
      {
        id: "similar",
        tone: compsTone,
        subject: "Similar players",
        figure: `${comps.hits}/${comps.total}`,
        text: `Went over their points line against ${opponent.abbr}`,
        href: null,
        targets: [standOutTargets.similar],
      },
    ]);
  }

  return pickStandOuts(kinds);
}
