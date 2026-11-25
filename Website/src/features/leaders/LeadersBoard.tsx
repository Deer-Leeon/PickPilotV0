"use client";

import { useQueryState } from "nuqs";
import { PageColumn } from "@/components/shell/PageColumn";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { LeaderRow } from "@/data/types";
import { LEADER_FILTER_LABELS, selectLeaders, type LeaderFilter } from "@/lib/research/leaders";
import { CategoryFilter } from "./CategoryFilter";
import { leaderParsers } from "./leadersParams";
import { LeadersTable } from "./LeadersTable";

interface LeadersBoardProps {
  league: string;
  leagueName: string;
  gameCount: number;
  /** Every ranked row for the slate, best first. */
  rows: readonly LeaderRow[];
}

interface LeadersViewProps extends LeadersBoardProps {
  filter: LeaderFilter;
  onFilterChange: (filter: LeaderFilter) => void;
}

function LeadersView({ league, leagueName, gameCount, rows, filter, onFilterChange }: LeadersViewProps) {
  const leaders = selectLeaders(rows, filter);

  return (
    <PageColumn>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-fg">{leagueName} Hit-Rate Leaders</h1>
          <p className="mt-1 text-xs text-fg-muted">
            Highest-consistency {leagueName} player props and team lines across tonight&apos;s {gameCount}-game slate
          </p>
        </div>
        <CategoryFilter value={filter} onChange={onFilterChange} />
      </div>

      {leaders.length === 0 ? (
        <Card>
          <EmptyState
            title="Nothing to rank here yet"
            description={`No ${LEADER_FILTER_LABELS[filter].toLowerCase()} on tonight's slate have enough games behind them.`}
            action={
              filter === "ALL" ? undefined : (
                <Button size="sm" onClick={() => onFilterChange("ALL")}>
                  Show all props
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <LeadersTable league={league} leaders={leaders} />
      )}

      <p className="pb-4 text-[11px] leading-relaxed text-fg-subtle">
        Ranked by season hit rate on tonight&apos;s line, then by sample size. Players need eight games and twenty minutes a night to
        qualify. Past results do not predict future outcomes.
      </p>
    </PageColumn>
  );
}

const noop = () => {};

/** What the server renders before the URL can be read: the mixed board. */
export function LeadersBoardFallback(props: LeadersBoardProps) {
  return <LeadersView {...props} filter="ALL" onFilterChange={noop} />;
}

/** The leaders board with its category kept in the URL (?cat=REB). */
export function LeadersBoard(props: LeadersBoardProps) {
  const [filter, setFilter] = useQueryState("cat", leaderParsers.cat);
  return <LeadersView {...props} filter={filter} onFilterChange={(next) => void setFilter(next)} />;
}
