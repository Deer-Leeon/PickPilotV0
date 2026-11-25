"use client";

import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import { StandOutList } from "@/components/ui/StandOutList";
import type { PlayerResearch, StatId } from "@/data/types";
import { buildFilterContext } from "@/lib/research/context";
import { buildFilterCatalog, type ActiveFilter } from "@/lib/research/filters";
import type { SampleWindow } from "@/lib/research/sample";
import { playerStandOuts } from "@/lib/research/standOuts/player";
import { buildResearchView, resolveStat } from "@/lib/research/view";
import { playerParsers } from "./playerParams";

interface PlayerStandOutsProps {
  research: PlayerResearch;
}

interface ViewProps extends PlayerStandOutsProps {
  /** Null means "the player's featured prop". */
  stat: StatId | null;
  sample: SampleWindow;
  filters: ActiveFilter[];
}

/**
 * Filters can be combined freely, so these stand-outs cannot be worked out
 * ahead of time for every case. They are computed here from the same view the
 * page builds, which keeps the two in step as the stat, sample and filters change.
 */
function PlayerStandOutsView({ research, stat: requested, sample, filters }: ViewProps) {
  const ctx = useMemo(() => buildFilterContext(research), [research]);
  const catalog = useMemo(() => buildFilterCatalog(ctx), [ctx]);
  const stat = resolveStat(research.props, requested);
  const view = buildResearchView(research, { stat, sample, filters, trend: "none" }, ctx);
  return <StandOutList items={playerStandOuts({ research, view, sample, filterCount: filters.length, catalog })} />;
}

const NO_FILTERS: ActiveFilter[] = [];

/** What the server renders before the URL can be read: the featured prop over the full season with no filters. */
export function PlayerStandOutsFallback(props: PlayerStandOutsProps) {
  return <PlayerStandOutsView {...props} stat={null} sample="season" filters={NO_FILTERS} />;
}

/** What stands out on the player page, following the stat, sample and filters in the URL. */
export function PlayerStandOuts(props: PlayerStandOutsProps) {
  const [{ stat, sample, filters }] = useQueryStates(playerParsers);
  return <PlayerStandOutsView {...props} stat={stat} sample={sample} filters={filters} />;
}
