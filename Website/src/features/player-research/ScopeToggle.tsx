"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { ProfileScope } from "@/data/types";

const OPTIONS = [
  { value: "l5", label: "Last 5" },
  { value: "season", label: "Season" },
] as const;

/** Last 5 games or the whole season, for the shot and play-type modules. */
export function ScopeToggle({ label, value, onChange }: { label: string; value: ProfileScope; onChange: (scope: ProfileScope) => void }) {
  return <SegmentedControl label={label} options={OPTIONS} value={value} onChange={onChange} />;
}
