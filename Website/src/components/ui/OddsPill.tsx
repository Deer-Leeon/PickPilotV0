import type { BookId } from "@/data/types";
import { cn } from "@/lib/cn";
import { formatOdds } from "@/lib/research/odds";

interface OddsPillProps {
  price: number;
  /** Sportsbook the price comes from, shown in brackets. */
  book?: BookId;
  /** Emerald for the best price or a favourable trend. */
  highlight?: boolean;
  className?: string;
}

/** An American price with its book: "-108 (FD)". */
export function OddsPill({ price, book, highlight, className }: OddsPillProps) {
  return (
    <span className={cn("whitespace-nowrap font-mono text-sm font-bold", highlight ? "text-good-fg" : "text-fg-soft", className)}>
      {formatOdds(price)}
      {book ? ` (${book})` : ""}
    </span>
  );
}
