import { PlayerAvatar } from "@/components/media/PlayerAvatar";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { InsetRow } from "@/components/ui/InsetRow";
import type { GameInjuries, InjuryStatus, TeamInjuries } from "@/data/types";
import { flashKey, standOutTargets } from "@/lib/research/standOuts/targets";

const STATUS_TONE: Record<InjuryStatus, BadgeTone> = {
  OUT: "bad",
  DOUBTFUL: "bad",
  QUESTIONABLE: "warn",
  PROBABLE: "neutral",
};

function TeamReport({ team, entries }: TeamInjuries) {
  return (
    <Card className="space-y-3 p-4 sm:p-5">
      <h2 className="text-xs font-bold uppercase tracking-wider text-fg">{team.fullName} Injury Report</h2>
      {entries.length === 0 ? (
        <EmptyState
          title="No injuries reported"
          description={`Every ${team.nickname} player is expected to be available.`}
          className="rounded-xl bg-inset py-8"
        />
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <InsetRow key={entry.id} {...flashKey(standOutTargets.injury(entry.id))}>
              <div className="flex min-w-0 items-center gap-3">
                <PlayerAvatar name={entry.playerName} headshotKey={entry.headshotKey} className="size-9" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-fg">
                    {entry.playerName} <span className="font-normal text-fg-muted">({entry.position})</span>
                  </div>
                  <div className="text-xs leading-relaxed text-fg-muted">
                    {entry.injury}
                    {entry.impactNote ? ` · ${entry.impactNote}` : ""}
                  </div>
                </div>
              </div>
              <Badge tone={STATUS_TONE[entry.status]} className="px-2 py-1 text-xs">
                {entry.status}
              </Badge>
            </InsetRow>
          ))}
        </ul>
      )}
    </Card>
  );
}

/** Both teams' injury reports side by side. */
export function InjuryReport({ injuries }: { injuries: GameInjuries }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <TeamReport {...injuries.away} />
      <TeamReport {...injuries.home} />
    </div>
  );
}
