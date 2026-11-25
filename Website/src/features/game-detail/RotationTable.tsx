"use client";

import Link from "next/link";
import { PlayerAvatar } from "@/components/media/PlayerAvatar";
import { TeamLogo } from "@/components/media/TeamLogo";
import { Badge, GradeBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { GameRoster, RotationPlayer, StatWindow } from "@/data/types";
import { AddToSlipButton } from "@/features/slip/AddToSlipButton";
import { propLeg } from "@/features/slip/legs";
import { formatAverage, shortName } from "@/lib/format";
import { formatOdds } from "@/lib/research/odds";
import { formatPropLine } from "@/lib/research/stats";
import { flashKey, standOutTargets } from "@/lib/research/standOuts/targets";
import { routes } from "@/lib/routes";
import { WindowControl } from "./WindowControl";

interface RotationTableProps {
  league: string;
  seasonLabel: string;
  roster: GameRoster;
  /** "vs NYK" or "@ BOS", used on slip legs. */
  matchup: string;
  window: StatWindow;
  onWindowChange: (window: StatWindow) => void;
}

/**
 * One team's rotation: averages for the chosen window, each player's featured
 * prop and its grade. On narrow screens the table scrolls sideways and the
 * player column stays in place.
 */
export function RotationTable({ league, seasonLabel, roster, matchup, window, onWindowChange }: RotationTableProps) {
  const out = roster.injuries.find((entry) => entry.status === "OUT");

  const row = (entry: RotationPlayer) => {
    const { player, featuredProp, featuredHits } = entry;
    const averages = entry.averages[window];
    const href = routes.player(league, player.id, featuredProp ? { stat: featuredProp.stat } : undefined);
    return (
      <tr key={player.id} className="group transition hover:bg-white/[0.04]" {...flashKey(standOutTargets.player(player.id))}>
        <th scope="row" className="sticky left-0 z-10 bg-card py-2.5 pr-1 text-left sm:pr-3 font-normal transition group-hover:bg-raised">
          <Link href={href} className="flex items-center gap-2 sm:gap-2.5">
            <PlayerAvatar name={player.name} headshotKey={player.headshotKey} className="size-7" />
            <span className="whitespace-nowrap">
              <span className="font-semibold text-fg group-hover:underline">
                <span className="sm:hidden">{shortName(player.name)}</span>
                <span className="hidden sm:inline">{player.name}</span>
              </span>
              <span className="ml-1 font-mono text-[10px] text-fg-subtle">{player.position}</span>
            </span>
          </Link>
        </th>
        <td className="px-2 py-2.5 text-right font-mono text-fg-soft">{formatAverage(averages.pts)}</td>
        <td className="px-2 py-2.5 text-right font-mono text-fg-soft">{formatAverage(averages.reb)}</td>
        <td className="px-2 py-2.5 text-right font-mono text-fg-soft">{formatAverage(averages.ast)}</td>
        <td className="whitespace-nowrap px-2 py-2.5 text-right font-mono font-medium text-fg">
          {featuredProp ? (
            <>
              {formatPropLine(featuredProp.line, featuredProp.stat)}
              <span className="ml-1.5 text-[10px] font-normal text-fg-subtle">{formatOdds(featuredProp.over.price)}</span>
            </>
          ) : (
            <span className="text-fg-faint">—</span>
          )}
        </td>
        <td className="px-2 py-2.5 text-right">{featuredProp ? <GradeBadge grade={featuredProp.grade} /> : null}</td>
        <td className="py-2.5 pl-2 text-right">
          {featuredProp ? (
            <AddToSlipButton
              variant="icon"
              leg={propLeg({
                league,
                playerId: player.id,
                playerName: player.name,
                stat: featuredProp.stat,
                line: featuredProp.line,
                side: "over",
                price: featuredProp.over.price,
                book: featuredProp.over.book,
                matchup,
                hits: featuredHits?.hits,
                sample: featuredHits?.total,
              })}
            />
          ) : null}
        </td>
      </tr>
    );
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4 sm:px-5">
        <div className="flex items-center gap-2.5">
          <TeamLogo team={roster.team} className="size-6 rounded-md p-0.5" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-fg">{roster.team.fullName}</h2>
        </div>
        <div className="flex items-center gap-2">
          {out ? (
            <Badge tone="bad">
              {shortName(out.playerName)} OUT
            </Badge>
          ) : null}
          <WindowControl value={window} onChange={onWindowChange} seasonLabel={seasonLabel} />
        </div>
      </div>

      <div className="overflow-x-auto px-4 pb-3 pt-4 sm:px-5">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="font-mono text-[10px] uppercase text-fg-subtle">
              <th scope="col" className="sticky left-0 z-10 bg-card pb-2 font-normal">
                Player
              </th>
              <th scope="col" className="px-2 pb-2 text-right font-normal">
                PTS
              </th>
              <th scope="col" className="px-2 pb-2 text-right font-normal">
                REB
              </th>
              <th scope="col" className="px-2 pb-2 text-right font-normal">
                AST
              </th>
              <th scope="col" className="px-2 pb-2 text-right font-normal">
                Prop Line
              </th>
              <th scope="col" className="px-2 pb-2 text-right font-normal">
                Edge
              </th>
              <th scope="col" className="pb-2 pl-2 text-right font-normal">
                Slip
              </th>
            </tr>
          </thead>
          <tbody>
            {roster.starters.map(row)}
            <tr className="bg-inset/60">
              <td colSpan={7} className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
                <span className="sticky left-2">Bench Rotation</span>
              </td>
            </tr>
            {roster.bench.map(row)}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
