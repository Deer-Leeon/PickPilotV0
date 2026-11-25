"use client";

import { useQueryState } from "nuqs";
import { StandOutList } from "@/components/ui/StandOutList";
import type { StatWindow } from "@/data/types";
import type { StandOut } from "@/lib/research/standOuts/standOut";
import { gameParsers } from "./gameParams";

/** Shows the stand-outs for the stat window selected on a game tab, which lives in the URL (?window=l5). */
export function WindowStandOuts({ byWindow }: { byWindow: Record<StatWindow, StandOut[]> }) {
  const [window] = useQueryState("window", gameParsers.window);
  return <StandOutList items={byWindow[window]} />;
}
