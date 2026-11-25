"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { StatWindow } from "@/data/types";

interface WindowControlProps {
  value: StatWindow;
  onChange: (value: StatWindow) => void;
  /** Label for the full-season option, e.g. "'26-'27". */
  seasonLabel: string;
}

/** Last 3 games, last 5 games or the whole season. */
export function WindowControl({ value, onChange, seasonLabel }: WindowControlProps) {
  return (
    <SegmentedControl
      label="Stat window"
      value={value}
      onChange={onChange}
      options={[
        { value: "l3", label: "L3" },
        { value: "l5", label: "L5" },
        { value: "season", label: seasonLabel },
      ]}
    />
  );
}
