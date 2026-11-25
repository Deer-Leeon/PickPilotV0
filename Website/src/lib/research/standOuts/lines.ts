import type { GameLines } from "@/data/types";
import { formatPercent, formatRecord } from "@/lib/format";
import { formatOdds } from "../odds";
import { hitRateTone, pickStandOuts, type StandOut } from "./standOut";
import { standOutTargets } from "./targets";

/**
 * The Game lines tab: lines backed by a strong record, lines with a weak one
 * behind them, and the offers carrying the best line on the board.
 *
 * A record is judged like every other hit rate, so a line the page shows in
 * green is good here too. Each offer is one finding: the best line is added to
 * its record, good or bad, and stands alone only when the record says nothing.
 */
export function lineStandOuts(lines: GameLines): StandOut[] {
  const offers = [...lines.spread, ...lines.total, ...lines.derivatives, ...lines.moneyline];

  const trends: { item: StandOut; distance: number }[] = [];
  const bestLines: StandOut[] = [];
  for (const offer of offers) {
    const { trend } = offer;
    const sample = trend.wins + trend.losses;
    const tone = hitRateTone(trend.wins, sample);
    const targets = [standOutTargets.offer(offer.id)];
    if (tone) {
      const rate = trend.wins / sample;
      trends.push({
        distance: Math.abs(rate - 0.5),
        item: {
          id: `${offer.id}:trend`,
          tone,
          subject: offer.title,
          figure: formatPercent(rate),
          text: `${formatRecord(trend)} ${trend.label}${offer.isBest ? ` · best line ${formatOdds(offer.price)} (${offer.book})` : ""}`,
          href: null,
          targets,
        },
      });
    } else if (offer.isBest) {
      bestLines.push({
        id: `${offer.id}:best`,
        tone: "good",
        subject: offer.title,
        figure: formatOdds(offer.price),
        text: `Best line on the board · ${offer.book}`,
        href: null,
        targets,
      });
    }
  }

  return pickStandOuts([
    trends.sort((a, b) => b.distance - a.distance || a.item.id.localeCompare(b.item.id)).map(({ item }) => item),
    bestLines,
  ]);
}
