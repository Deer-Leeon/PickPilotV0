"use client";

import { PageColumn } from "@/components/shell/PageColumn";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Game, SlateDate } from "@/data/types";
import { formatWeekdayDate } from "@/lib/format";
import { DateTabs } from "./DateTabs";
import { GameCard } from "./GameCard";
import { defaultSlateDate } from "./slateDate";
import { useSlateDate } from "./useSlateDate";

interface GamesBoardViewProps {
  league: string;
  dates: readonly SlateDate[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  games: readonly Game[];
}

/** The slate: date tabs, column headings and one card per game. Has no state of its own. */
export function GamesBoardView({ league, dates, selectedDate, onSelectDate, games }: GamesBoardViewProps) {
  const selected = dates.find((entry) => entry.date === selectedDate);

  return (
    <PageColumn>
      <Card variant="frame" className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight text-fg">Upcoming Games</h1>
          <span className="flex items-center gap-1.5 text-xs text-fg-muted">
            <span className="size-1.5 rounded-full bg-good-fg" /> Best Line
          </span>
        </div>

        <DateTabs dates={dates} selected={selectedDate} onSelect={onSelectDate} />

        {games.length === 0 ? (
          <EmptyState
            title={`No games posted for ${selected && !selected.isToday ? formatWeekdayDate(selected.date) : "this date"}`}
            description="Lines appear here once the books post them, usually the evening before."
            className="py-16"
          />
        ) : (
          <>
            <div className="mt-4 grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-2 px-4 py-2 text-[11px] font-medium text-fg-muted sm:grid-cols-2 sm:px-5">
              <span>Match</span>
              <div className="grid grid-cols-3 gap-1.5 text-center sm:gap-2">
                <span>Spread</span>
                <span>Moneyline</span>
                <span>Total</span>
              </div>
            </div>
            <div className="mt-1 space-y-3.5">
              {games.map((game) => (
                <GameCard key={game.id} league={league} game={game} />
              ))}
            </div>
          </>
        )}
      </Card>
    </PageColumn>
  );
}

interface GamesBoardProps {
  league: string;
  dates: readonly SlateDate[];
  /** Games for every date in `dates`, keyed by date. */
  slates: Record<string, Game[]>;
}

const noop = () => {};

/**
 * What the server renders before the URL can be read: the board for today.
 * It is the Suspense fallback for GamesBoard, so the built page already
 * shows the slate and nothing jumps when the browser takes over.
 */
export function GamesBoardFallback({ league, dates, slates }: GamesBoardProps) {
  const today = defaultSlateDate(dates);
  return <GamesBoardView league={league} dates={dates} selectedDate={today} onSelectDate={noop} games={slates[today] ?? []} />;
}

/** The board with its selected date kept in the URL (?date=2026-11-14). */
export function GamesBoard({ league, dates, slates }: GamesBoardProps) {
  const [selectedDate, setDate] = useSlateDate(dates);
  return <GamesBoardView league={league} dates={dates} selectedDate={selectedDate} onSelectDate={setDate} games={slates[selectedDate] ?? []} />;
}
