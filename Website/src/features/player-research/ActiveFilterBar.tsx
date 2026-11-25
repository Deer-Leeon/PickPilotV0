"use client";

import { cn } from "@/lib/cn";
import type { ActiveFilter, FilterCatalogItem, FilterId } from "@/lib/research/filters";

interface ActiveFilterBarProps {
  filters: readonly ActiveFilter[];
  catalog: readonly FilterCatalogItem[];
  /** The filter the rank slider is bound to. */
  focusId: FilterId | null;
  /** Opens the drawer with the slider bound to this filter. */
  onSelect: (id: FilterId) => void;
  onRemove: (id: FilterId) => void;
  onClear: () => void;
}

/** One chip per active filter, above the chart. Shown only when filters are on. */
export function ActiveFilterBar({ filters, catalog, focusId, onSelect, onRemove, onClear }: ActiveFilterBarProps) {
  if (filters.length === 0) return null;

  return (
    <div className="mb-3.5 flex items-center justify-between gap-2">
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-0.5">
        <span className="mr-1 shrink-0 font-mono text-[10px] uppercase tracking-wider text-fg-subtle">Active ({filters.length}):</span>
        {filters.map((filter) => {
          const item = catalog.find((entry) => entry.id === filter.id);
          if (!item) return null;
          const focused = item.hasRange && focusId === filter.id;
          return (
            <span
              key={filter.id}
              className={cn(
                // Same fills as the rows in the filter drawer: green when on, stronger for the one the slider edits.
                "inline-flex shrink-0 items-center rounded-md font-mono text-[11px] transition",
                focused ? "bg-good/25 text-fg" : "bg-good/10 text-good-fg hover:bg-good/15",
              )}
            >
              <button type="button" onClick={() => onSelect(filter.id)} className="py-1 pl-2.5 pr-1 font-medium">
                {item.shortName}
                {item.hasRange ? (
                  <strong className="ml-1 text-good-fg">
                    #{filter.min}–{filter.max}
                  </strong>
                ) : null}
              </button>
              <button
                type="button"
                onClick={() => onRemove(filter.id)}
                aria-label={`Remove filter: ${item.name}`}
                className="mr-1 flex size-4 items-center justify-center rounded leading-none text-fg-muted transition hover:bg-white/15 hover:text-fg"
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onClear}
        className="shrink-0 rounded bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] text-fg-muted transition hover:bg-white/[0.08] hover:text-fg"
      >
        Clear All
      </button>
    </div>
  );
}
