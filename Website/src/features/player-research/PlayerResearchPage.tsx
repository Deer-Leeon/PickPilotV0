"use client";

import { useMemo, useState } from "react";
import { useQueryStates } from "nuqs";
import { PAGE_RIGHT_EDGE } from "@/components/shell/PageColumn";
import { Sheet } from "@/components/ui/Sheet";
import { ButtonTabs } from "@/components/ui/Tabs";
import type { PlayerResearch, StatId } from "@/data/types";
import { useLocateStandOut } from "@/hooks/useLocateStandOut";
import { MEDIA, useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import type { TrendMetric } from "@/lib/research/chart";
import { buildFilterContext } from "@/lib/research/context";
import {
  applyRankPreset,
  buildFilterCatalog,
  getFilterDef,
  hasRankRange,
  removeFilter,
  setFilterRange,
  toggleFilter,
  type ActiveFilter,
  type FilterId,
} from "@/lib/research/filters";
import type { SampleWindow } from "@/lib/research/sample";
import { STAT_FAMILIES } from "@/lib/research/stats";
import { isFilterTarget, standOutTargets } from "@/lib/research/standOuts/targets";
import { availableStats, buildResearchView, resolveStat } from "@/lib/research/view";
import { ActiveFilterBar } from "./ActiveFilterBar";
import { FilterPanel, FilterPanelTitle, sliderTarget, type FilterActions } from "./FilterDrawer";
import { HitRateChart } from "./HitRateChart";
import { LowerModules } from "./LowerModules";
import { PlayerHeader } from "./PlayerHeader";
import { playerParsers, type LowerTab } from "./playerParams";
import { RosterList, RosterSidebar } from "./RosterSidebar";
import { StatStrip } from "./StatStrip";

interface PlayerResearchPageProps {
  league: string;
  research: PlayerResearch;
}

/** Everything about the page that is kept in the URL. */
interface PageState {
  /** Null means "the player's featured prop". */
  stat: StatId | null;
  sample: SampleWindow;
  filters: ActiveFilter[];
  trend: TrendMetric;
  tab: LowerTab;
  panel: "filters" | null;
}

const DEFAULT_STATE: PageState = { stat: null, sample: "season", filters: [], trend: "oppDef", tab: "zones", panel: null };

/**
 * This page has its own layout (roster, pinned header, scrolling modules), so
 * it cannot sit in PageColumn. Its right edge meets the other pages' all the
 * same. On narrower screens that comes from PAGE_RIGHT_EDGE, PageColumn's own
 * right padding. On wide ones it comes from the caps: PageColumn is 80rem wide after
 * 2.5rem of padding, and from that come off the 15rem roster and this column's
 * left padding (1.5rem for the header, 1.25rem for the modules).
 */
const HEADER_WIDTH = "lg:max-w-[66rem]";
const MODULES_WIDTH = "lg:max-w-[66.25rem]";

/**
 * The header band runs to the edge of the screen while nothing is docked. Beside the docked side panel it stops one
 * card gap short and rounds its free corner: the panel is a card of the same shade, and the two would merge if they met.
 */
const HEADER_EDGE = "lg:pr-10 xl:mr-5 xl:rounded-br-2xl xl:pr-5";

interface ViewProps extends PlayerResearchPageProps {
  state: PageState;
  update: (patch: Partial<PageState>) => void;
}

function PlayerResearchView({ league, research, state, update }: ViewProps) {
  const { player, game, rosters, gameLog, upcoming } = research;
  const { filters } = state;
  const filtersOpen = state.panel === "filters";

  // Which filter the rank slider edits, and whether the phone roster sheet is open. Neither belongs in a shared link.
  const [focusId, setFocusId] = useState<FilterId | null>(null);
  const [rosterOpen, setRosterOpen] = useState(false);
  const isBelowLg = useMediaQuery(MEDIA.belowLg);

  const ctx = useMemo(() => buildFilterContext(research), [research]);
  const catalog = useMemo(() => buildFilterCatalog(ctx), [ctx]);
  const stat = resolveStat(research.props, state.stat);
  const view = buildResearchView(research, { stat, sample: state.sample, filters, trend: state.trend }, ctx);
  const boundId = sliderTarget(catalog, filters, focusId)?.id ?? null;

  const actions: FilterActions = {
    onToggle: (id) => {
      const turningOn = !filters.some((filter) => filter.id === id);
      const def = getFilterDef(id);
      setFocusId(turningOn && def && hasRankRange(def) ? id : focusId === id ? null : focusId);
      update({ filters: toggleFilter(filters, id) });
    },
    onFocus: setFocusId,
    onRange: (id, min, max) => {
      setFocusId(id);
      update({ filters: setFilterRange(filters, id, min, max) });
    },
    onPreset: (id, preset) => {
      setFocusId(id);
      update({ filters: applyRankPreset(filters, id, preset) });
    },
    onReset: () => update({ filters: [] }),
  };

  // Opponent ranks live in the filter drawer, and similar players live in their own module. Show either before the frame looks for it.
  useLocateStandOut((targets, event) => {
    const openFilters = targets.some(isFilterTarget) && !filtersOpen;
    const showSimilar = targets.includes(standOutTargets.similar) && state.tab !== "similar" && state.tab !== "all";
    if (!openFilters && !showSimilar) return;
    event.preventDefault();
    update({ ...(openFilters ? { panel: "filters" as const } : {}), ...(showSimilar ? { tab: "similar" as const } : {}) });
  });

  const filterPanel = <FilterPanel catalog={catalog} filters={filters} focusId={focusId} {...actions} />;
  const filterTitle = <FilterPanelTitle total={catalog.length} activeCount={filters.length} onReset={actions.onReset} />;

  return (
    <div className="relative flex min-w-0 flex-1 overflow-hidden">
      {/*
        The left column holds the roster, or the filter drawer while it is open. Sharing one place keeps the
        chart's width, and leaves the right of the page to the side panel, so the stand-outs stay in view
        and change as filters are switched on.
      */}
      <RosterSidebar
        league={league}
        game={game}
        rosters={rosters}
        activePlayerId={player.id}
        className={cn("hidden", !filtersOpen && "lg:flex")}
      />
      {filtersOpen ? (
        <aside aria-label="Matchup filters" className="z-20 hidden w-72 shrink-0 flex-col overflow-hidden bg-panel lg:flex xl:w-80">
          <div className="flex shrink-0 items-center justify-between gap-1.5 bg-card px-4 py-3">
            {filterTitle}
            <button
              type="button"
              onClick={() => update({ panel: null })}
              className="shrink-0 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-fg transition hover:bg-white/15"
            >
              Done
            </button>
          </div>
          {filterPanel}
        </aside>
      ) : null}

      {/* On phones this whole column scrolls. From lg up the header stays put and only the modules scroll. */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden">
        {/* Card shade, one step up from the roster and filter panels beside it, so the three do not merge. */}
        <div className={cn("shrink-0 bg-card px-4 pt-3.5 sm:px-6", HEADER_EDGE)}>
          <div className={HEADER_WIDTH}>
            <PlayerHeader
              league={league}
              research={research}
              prop={view.prop}
              filterCount={filters.length}
              filtersOpen={filtersOpen}
              onToggleFilters={() => update({ panel: filtersOpen ? null : "filters" })}
              onOpenRoster={() => (isBelowLg ? setRosterOpen(true) : update({ panel: null }))}
            />
            <div className="pb-3">
              <StatStrip hitRate={view.hitRate} stats={view.strip} />
            </div>
            <ButtonTabs
              label="Stat"
              value={stat}
              onChange={(next) => update({ stat: next })}
              tabs={availableStats(research.props).map((id) => ({ value: id, label: STAT_FAMILIES[id].label }))}
            />
          </div>
        </div>

        {/* Vertical padding sits on the inner wrapper, not on the scroll area: a pinned
            bar rests below its scroll area's padding, which would leave a gap above the module tabs. */}
        <div className={cn("px-3 sm:px-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto", PAGE_RIGHT_EDGE)}>
          <div className={cn("space-y-5 py-4 sm:py-5", MODULES_WIDTH)}>
            <HitRateChart
              stat={stat}
              line={view.prop?.line ?? 0}
              chart={view.chart}
              upcoming={upcoming}
              seasonGames={gameLog.length}
              sample={state.sample}
              onSampleChange={(sample) => update({ sample })}
              trend={state.trend}
              onTrendChange={(trend) => update({ trend })}
              hasFilters={filters.length > 0}
              onClearFilters={actions.onReset}
              filterBar={
                <ActiveFilterBar
                  filters={filters}
                  catalog={catalog}
                  focusId={filtersOpen ? boundId : null}
                  onSelect={(id) => {
                    setFocusId(id);
                    update({ panel: "filters" });
                  }}
                  onRemove={(id) => update({ filters: removeFilter(filters, id) })}
                  onClear={actions.onReset}
                />
              }
            />
            <LowerModules research={research} tab={state.tab} onTabChange={(tab) => update({ tab })} />
          </div>
        </div>
      </div>

      <Sheet
        open={filtersOpen && isBelowLg}
        onOpenChange={(open) => update({ panel: open ? "filters" : null })}
        title="Matchup filters"
        side="right"
        header={filterTitle}
      >
        {filterPanel}
      </Sheet>

      <Sheet open={rosterOpen && isBelowLg} onOpenChange={setRosterOpen} title={`${game.away.team.abbr} @ ${game.home.team.abbr} Roster`} side="left">
        <div className="p-2.5">
          <RosterList league={league} rosters={rosters} activePlayerId={player.id} onNavigate={() => setRosterOpen(false)} />
        </div>
      </Sheet>
    </div>
  );
}

const noop = () => {};

/**
 * What the server renders before the URL can be read: the featured prop over
 * the full season with no filters. It is the Suspense fallback for
 * PlayerResearchPage, so the built page is already complete.
 */
export function PlayerResearchFallback(props: PlayerResearchPageProps) {
  return <PlayerResearchView {...props} state={DEFAULT_STATE} update={noop} />;
}

/** The player research page, with its stat, sample, filters, trend line and open panels kept in the URL. */
export function PlayerResearchPage(props: PlayerResearchPageProps) {
  const [params, setParams] = useQueryStates(playerParsers, { history: "replace" });
  return <PlayerResearchView {...props} state={params} update={(patch) => void setParams(patch)} />;
}
