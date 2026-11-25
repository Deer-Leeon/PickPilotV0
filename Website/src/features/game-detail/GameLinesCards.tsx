import { Card, CardHeader } from "@/components/ui/Card";
import { InsetRow } from "@/components/ui/InsetRow";
import { OddsPill } from "@/components/ui/OddsPill";
import type { Game, GameLineOffer, GameLines } from "@/data/types";
import { AddToSlipButton } from "@/features/slip/AddToSlipButton";
import { offerLeg } from "@/features/slip/legs";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";
import { FAVORABLE_HIT_RATE } from "@/lib/research/hitRate";
import { flashKey, standOutTargets } from "@/lib/research/standOuts/targets";

interface GameLinesCardsProps {
  league: string;
  game: Game;
  lines: GameLines;
}

const trendRate = (offer: GameLineOffer) => {
  const games = offer.trend.wins + offer.trend.losses;
  return games > 0 ? offer.trend.wins / games : null;
};

/** A trend this strong earns the "Strong Trend" tag on the derivatives card. */
const STRONG_TREND = 0.7;

function OfferRow({ league, game, offer, highlight }: { league: string; game: Game; offer: GameLineOffer; highlight: boolean }) {
  const rate = trendRate(offer);
  const favorable = rate !== null && rate >= FAVORABLE_HIT_RATE;
  return (
    <InsetRow {...flashKey(standOutTargets.offer(offer.id))}>
      <div className="min-w-0">
        <div className="truncate text-sm font-bold text-fg">{offer.title}</div>
        <div className={cn("mt-0.5 font-mono text-[11px]", rate === null ? "text-fg-subtle" : favorable ? "text-good-fg" : "text-bad-fg")}>
          {offer.trend.wins}-{offer.trend.losses} {offer.trend.label}
          {rate !== null ? ` (${formatPercent(rate)} Hit Rate)` : ""}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <OddsPill price={offer.price} book={offer.book} highlight={highlight} />
        <AddToSlipButton variant="icon" leg={offerLeg(league, game, offer)} />
      </div>
    </InsetRow>
  );
}

/** Spread, total, first-half and first-quarter lines and the moneyline, each with the trend behind it. */
export function GameLinesCards({ league, game, lines }: GameLinesCardsProps) {
  const strongTrend = lines.derivatives.some((offer) => (trendRate(offer) ?? 0) >= STRONG_TREND);
  const caption = (text: string, good = false) => (
    <span className={cn("font-mono text-[11px]", good ? "text-good-fg" : "text-fg-muted")}>{text}</span>
  );

  const cards: { title: string; action: React.ReactNode; offers: GameLineOffer[]; highlight: (offer: GameLineOffer) => boolean }[] = [
    { title: "Point Spread", action: caption("Best Price", true), offers: lines.spread, highlight: (offer) => offer.isBest },
    {
      title: "Game Total (O/U)",
      action: caption(`${lines.consensusTotal} Consensus`),
      offers: lines.total,
      highlight: (offer) => offer.isBest,
    },
    {
      title: "1st Half & 1st Quarter",
      action: strongTrend ? caption("Strong Trend", true) : caption("Derivatives"),
      offers: lines.derivatives,
      highlight: (offer) => (trendRate(offer) ?? 0) >= FAVORABLE_HIT_RATE,
    },
    { title: "Moneyline", action: caption("Best Price", true), offers: lines.moneyline, highlight: (offer) => offer.isBest },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {cards.map((card) => (
        <Card key={card.title} className="space-y-3 p-4 sm:p-5">
          <CardHeader title={card.title} action={card.action} />
          <ul className="space-y-3">
            {card.offers.map((offer) => (
              <OfferRow key={offer.id} league={league} game={game} offer={offer} highlight={card.highlight(offer)} />
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
