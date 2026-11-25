"use client";

import { useState } from "react";
import { SearchIcon } from "@/components/shell/icons";
import { rankTone } from "@/components/ui/Badge";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { cn } from "@/lib/cn";
import {
  FILTER_CATEGORY_TABS,
  groupCatalog,
  type ActiveFilter,
  type FilterCatalogItem,
  type FilterCategory,
  type FilterId,
} from "@/lib/research/filters";
import { RANK_PRESETS, type RankPreset } from "@/lib/research/matchup";
import { flashKey, standOutTargets } from "@/lib/research/standOuts/targets";

export interface FilterActions {
  onToggle: (id: FilterId) => void;
  /** Binds the rank slider to a filter without switching it on or off. */
  onFocus: (id: FilterId) => void;
  onRange: (id: FilterId, min: number, max: number) => void;
  onPreset: (id: FilterId, preset: RankPreset) => void;
  onReset: () => void;
}

interface FilterPanelProps extends FilterActions {
  catalog: readonly FilterCatalogItem[];
  filters: readonly ActiveFilter[];
  focusId: FilterId | null;
}

/** The filter the slider edits: the focused one, else the first active rank filter, else the first rank filter. */
export function sliderTarget(
  catalog: readonly FilterCatalogItem[],
  filters: readonly ActiveFilter[],
  focusId: FilterId | null,
): FilterCatalogItem | undefined {
  const ranked = catalog.filter((item) => item.hasRange);
  return (
    ranked.find((item) => item.id === focusId) ??
    ranked.find((item) => filters.some((filter) => filter.id === item.id)) ??
    ranked[0]
  );
}

/** Badge text colour by how soft tonight's opponent is on the filter's metric. */
const RANK_TEXT = { good: "text-good-fg", bad: "text-bad-fg", neutral: "text-fg-soft" } as const;

const PRESETS: readonly { id: RankPreset; label: string; className: string }[] = [
  { id: "tough", label: "Tough", className: "text-bad-fg" },
  { id: "all", label: "All", className: "text-fg-soft" },
  { id: "soft", label: "Soft", className: "text-good-fg" },
];

/** Title row of the drawer: how many filters there are and how many are on. */
export function FilterPanelTitle({ total, activeCount, onReset }: { total: number; activeCount: number; onReset: () => void }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-fg">Matchup Filters</span>
        {activeCount > 0 ? (
          <span className="shrink-0 rounded bg-good/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-good-fg">{activeCount} Active</span>
        ) : (
          <span className="font-mono text-[10px] text-fg-subtle">({total})</span>
        )}
      </div>
      {activeCount > 0 ? (
        <button type="button" onClick={onReset} className="shrink-0 px-1.5 py-1 font-mono text-[11px] text-fg-muted transition hover:text-fg">
          Reset
        </button>
      ) : null}
    </div>
  );
}

/**
 * Search, category tabs, the grouped filter catalog and the rank slider.
 * The same panel is docked beside the chart on wide screens and shown in a
 * sheet on phones. Every change applies to the chart straight away.
 */
export function FilterPanel({ catalog, filters, focusId, onToggle, onFocus, onRange, onPreset }: FilterPanelProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FilterCategory | "all">("all");

  const groups = groupCatalog(catalog, query, category);
  const target = sliderTarget(catalog, filters, focusId);
  const targetFilter = target ? filters.find((filter) => filter.id === target.id) : undefined;
  const range: [number, number] = target ? [targetFilter?.min ?? target.defaultMin, targetFilter?.max ?? target.defaultMax] : [1, 30];

  return (
    <div className="flex min-h-0 flex-1 select-none flex-col">
      <div className="shrink-0 space-y-2 bg-panel px-3 pt-3">
        <label className="relative block">
          <span className="sr-only">Search filters</span>
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${catalog.length} filters (e.g. Pull-Up, H2H)`}
            className="w-full rounded-lg bg-raised py-2 pl-8 pr-3 text-xs text-fg placeholder:text-fg-subtle"
          />
        </label>
        <div role="tablist" aria-label="Filter category" className="grid grid-cols-5 gap-1 rounded-lg bg-inset p-1 text-[10px] font-medium">
          {FILTER_CATEGORY_TABS.map((tab) => {
            const active = tab.id === category;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(tab.id)}
                className={cn("rounded py-1 text-center transition", active ? "bg-white font-semibold text-black" : "text-fg-muted hover:text-fg")}
              >
                {tab.id === "all" ? `All (${catalog.length})` : tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        {groups.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-fg-muted">No filters match “{query}”.</p>
        ) : (
          groups.map((group) => (
            <section key={group.name} className="space-y-1.5">
              <h3 className="flex items-center justify-between px-1 font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
                <span>{group.name}</span>
                <span>{group.items.length}</span>
              </h3>
              {group.items.map((item) => {
                const active = filters.find((filter) => filter.id === item.id);
                const focused = Boolean(active) && item.hasRange && target?.id === item.id;
                return (
                  <div
                    key={item.id}
                    // Fill carries the state: green when on, a stronger green for the one the slider edits.
                    {...flashKey(standOutTargets.filter(item.id))}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl pr-2 transition",
                      active
                        ? focused
                          ? "bg-good/25 text-fg"
                          : "bg-good/10 text-fg"
                        : "bg-card text-fg-soft hover:bg-raised hover:text-fg",
                    )}
                  >
                    <button
                      type="button"
                      aria-pressed={Boolean(active)}
                      title={item.description}
                      onClick={() => onToggle(item.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 py-2 pl-3 text-left"
                    >
                      <span className={cn("size-2 shrink-0 rounded-full", active ? "bg-good-fg shadow-[0_0_6px_var(--color-good)]" : "bg-fg-faint")} />
                      <span className="truncate text-xs font-medium">{item.name}</span>
                    </button>
                    {active && item.hasRange ? (
                      <button
                        type="button"
                        onClick={() => onFocus(item.id)}
                        aria-label={`Adjust the rank window for ${item.name}, now ${active.min} to ${active.max}`}
                        className="shrink-0 rounded bg-good px-1.5 py-0.5 font-mono text-[10px] font-bold text-black"
                      >
                        #{active.min}–#{active.max}
                      </button>
                    ) : (
                      <span
                        className={cn(
                          "shrink-0 rounded px-2 py-0.5 font-mono text-[10px]",
                          active
                            ? "bg-good font-bold text-black"
                            : cn("bg-inset", item.oppRank === null ? "text-fg-muted" : RANK_TEXT[rankTone(item.oppRank, "defense")]),
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </section>
          ))
        )}
      </div>

      {target ? (
        <div className="shrink-0 space-y-2.5 bg-card p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="font-mono text-[9px] uppercase text-fg-muted">Opponent Rank Window</div>
              <div className="truncate text-xs font-bold text-fg">{target.name}</div>
            </div>
            <span className={cn("shrink-0 font-mono text-xs font-bold", targetFilter ? "text-good-fg" : "text-fg-muted")}>
              #{range[0]} – #{range[1]}
            </span>
          </div>
          <RangeSlider
            label={`Opponent rank window for ${target.name}`}
            min={1}
            max={30}
            value={range}
            onChange={([min, max]) => onRange(target.id, min, max)}
          />
          <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onPreset(target.id, preset.id)}
                className={cn("rounded-lg bg-inset py-1.5 transition hover:bg-active", preset.className)}
              >
                {preset.label} #{RANK_PRESETS[preset.id].min}–{RANK_PRESETS[preset.id].max}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
