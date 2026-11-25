"use client";

import type { SlateDate } from "@/data/types";
import { cn } from "@/lib/cn";
import { formatWeekdayDate } from "@/lib/format";

interface DateTabsProps {
  dates: readonly SlateDate[];
  selected: string;
  onSelect: (date: string) => void;
}

/** The row of slate dates above the board. Only the selected date is underlined. Scrolls sideways on narrow screens. */
export function DateTabs({ dates, selected, onSelect }: DateTabsProps) {
  return (
    <div role="tablist" aria-label="Slate date" className="no-scrollbar flex select-none overflow-x-auto text-xs">
      {dates.map((entry) => {
        const active = entry.date === selected;
        return (
          <button
            key={entry.date}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(entry.date)}
            className={cn(
              "min-w-24 flex-1 whitespace-nowrap border-b-2 px-2 pb-3 text-center transition",
              active ? "border-fg font-semibold text-fg" : "border-transparent font-medium text-fg-subtle hover:text-fg-soft",
            )}
          >
            {entry.isToday ? "Today" : formatWeekdayDate(entry.date)}
          </button>
        );
      })}
    </div>
  );
}
