import { cn } from "@/lib/cn";
import { LEADER_FILTERS, LEADER_FILTER_LABELS, type LeaderFilter } from "@/lib/research/leaders";

interface CategoryFilterProps {
  value: LeaderFilter;
  onChange: (filter: LeaderFilter) => void;
}

/** Category pills above the leaders board. Scrolls sideways on phones. */
export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Category"
      className="no-scrollbar flex max-w-full items-center gap-1.5 overflow-x-auto rounded-xl bg-card p-1"
    >
      {LEADER_FILTERS.map((filter) => {
        const active = filter === value;
        return (
          <button
            key={filter}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(filter)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition",
              active ? "bg-white font-semibold text-black" : "text-fg-muted hover:text-fg",
            )}
          >
            {LEADER_FILTER_LABELS[filter]}
          </button>
        );
      })}
    </div>
  );
}
