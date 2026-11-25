import { Badge } from "@/components/ui/Badge";
import type { TeamWindowProfile } from "@/data/types";
import { cn } from "@/lib/cn";
import { buildStatBarRows, type MatchupDirection, type StatBarRow } from "@/lib/research/matchup";
import { flashKey, standOutTargets } from "@/lib/research/standOuts/targets";

interface StatBarsProps {
  away: TeamWindowProfile;
  home: TeamWindowProfile;
  direction: MatchupDirection;
}

type Standing = "ahead" | "behind" | "even";

const VALUE_CLASS: Record<Standing, string> = { ahead: "text-good-fg", behind: "text-bad-fg", even: "text-fg-soft" };
const BAR_CLASS: Record<Standing, string> = { ahead: "bg-good", behind: "bg-bad/80", even: "bg-fg-faint" };
const BADGE_TONE = { ahead: "good", behind: "bad", even: "neutral" } as const;

function standing(row: StatBarRow, side: "away" | "home"): Standing {
  if (row.advantage === "none") return "even";
  return row.advantage === side ? "ahead" : "behind";
}

/**
 * One team's offense against the other team's defense, stat by stat.
 * Each side's bar grows from the centre: the longer bar is the better rank.
 */
export function StatBars({ away, home, direction }: StatBarsProps) {
  const rows = buildStatBarRows(away, home, direction);
  const offense = direction === "awayOffense" ? "away" : "home";

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 py-1">
      {rows.map((row) => {
        const awayStanding = standing(row, "away");
        const homeStanding = standing(row, "home");
        return (
          <div key={row.key} className="space-y-1.5" {...flashKey(standOutTargets.teamStat(offense, row.key))}>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className={cn("text-sm font-bold", VALUE_CLASS[awayStanding])}>{row.away.display}</span>
                <Badge tone={BADGE_TONE[awayStanding]} className="text-[11px]">
                  #{row.away.rank}
                </Badge>
              </div>
              <span className="text-xs font-semibold text-fg-soft">{row.label}</span>
              <div className="flex items-center gap-2 font-mono">
                <Badge tone={BADGE_TONE[homeStanding]} className="text-[11px]">
                  #{row.home.rank}
                </Badge>
                <span className={cn("text-sm font-bold", VALUE_CLASS[homeStanding])}>{row.home.display}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 items-center gap-2.5" aria-hidden="true">
              <div className="flex h-2 justify-end overflow-hidden rounded-full bg-inset">
                <div className={cn("h-full rounded-full", BAR_CLASS[awayStanding])} style={{ width: `${row.away.barPct}%` }} />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-inset">
                <div className={cn("h-full rounded-full", BAR_CLASS[homeStanding])} style={{ width: `${row.home.barPct}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
