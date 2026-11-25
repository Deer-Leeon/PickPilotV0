"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { InsetRow } from "@/components/ui/InsetRow";
import type { ProfileScope, ShotZoneId, ShotZoneSplit } from "@/data/types";
import { cn } from "@/lib/cn";
import { isSoftMatchup } from "@/lib/research/matchup";
import { ScopeToggle } from "./ScopeToggle";

interface ShotZonesProps {
  zones: Record<ProfileScope, ShotZoneSplit[]>;
  opponentAbbr: string;
}

const ZONE_LABELS: Record<ShotZoneId, { name: string; short: string }> = {
  atb3: { name: "Above the Break 3", short: "ATB3" },
  rim: { name: "Restricted Area (Rim)", short: "RIM" },
  mid: { name: "Mid-Range", short: "MID" },
  lc3: { name: "Left Corner 3", short: "LC3" },
  rc3: { name: "Right Corner 3", short: "RC3" },
  paint: { name: "In The Paint (Non-RA)", short: "PAINT" },
};

/** Court areas on the 500 x 420 half-court drawing, hoop at the top. Drawn back to front. */
const ZONE_SHAPES: { zone: ShotZoneId; d: string }[] = [
  { zone: "atb3", d: "M 10,155 L 76,155 A 195,195 0 0,0 424,155 L 490,155 L 490,410 L 10,410 Z" },
  { zone: "lc3", d: "M 10,10 H 76 V 155 H 10 Z" },
  { zone: "rc3", d: "M 424,10 H 490 V 155 H 424 Z" },
  { zone: "mid", d: "M 76,10 L 170,10 L 170,190 L 330,190 L 330,10 L 424,10 L 424,155 A 195,195 0 0,1 76,155 Z" },
  { zone: "paint", d: "M 170,10 H 330 V 190 H 170 Z" },
  { zone: "rim", d: "M 195,10 L 195,55 A 55,55 0 0,0 305,55 L 305,10 Z" },
];

/** Where each zone's readout sits, and how big it is. */
const READOUTS: Record<ShotZoneId, { x: number; y: number; w: number; h: number; layout: "wide" | "stacked" | "banner" }> = {
  rim: { x: 250, y: 72, w: 108, h: 32, layout: "wide" },
  paint: { x: 250, y: 148, w: 108, h: 30, layout: "wide" },
  mid: { x: 122, y: 110, w: 88, h: 30, layout: "wide" },
  lc3: { x: 43, y: 82, w: 54, h: 44, layout: "stacked" },
  rc3: { x: 457, y: 82, w: 54, h: 44, layout: "stacked" },
  atb3: { x: 250, y: 310, w: 224, h: 40, layout: "banner" },
};

const GOOD = "#10b981";
const BAD = "#ef4444";
const GOOD_TEXT = "#34d399";
const BAD_TEXT = "#f87171";

function CourtMap({ zones, opponentAbbr }: { zones: readonly ShotZoneSplit[]; opponentAbbr: string }) {
  const byZone = new Map(zones.map((split) => [split.zone, split]));
  const summary = zones
    .map((split) => `${ZONE_LABELS[split.zone].name}: ${split.share}% of shots, ${opponentAbbr} rank ${split.oppRank}`)
    .join("; ");

  return (
    <svg viewBox="0 0 500 420" role="img" aria-label={`Shot distribution by court zone. ${summary}`} className="h-auto w-full max-w-[460px] select-none font-mono">
      <rect x={10} y={10} width={480} height={400} rx={8} className="fill-panel" />
      {ZONE_SHAPES.map(({ zone, d }) => {
        const split = byZone.get(zone);
        if (!split) return null;
        const soft = isSoftMatchup(split.oppRank);
        return (
          <path
            key={zone}
            d={d}
            fill={soft ? GOOD : BAD}
            // Busier zones are more saturated.
            fillOpacity={Math.min(0.42, 0.1 + split.share / 130)}
            stroke={soft ? GOOD : BAD}
            strokeWidth={zone === "rim" ? 2 : 1.5}
          />
        );
      })}
      <circle cx={250} cy={190} r={55} fill="none" stroke="#334155" strokeWidth={1.2} strokeDasharray="4,4" />
      <line x1={220} y1={32} x2={280} y2={32} stroke="#f8fafc" strokeWidth={3} />
      <circle cx={250} cy={43} r={10} fill="none" stroke="#f8fafc" strokeWidth={2.5} />

      {zones.map((split) => {
        const box = READOUTS[split.zone];
        const soft = isSoftMatchup(split.oppRank);
        const accent = soft ? GOOD_TEXT : BAD_TEXT;
        const short = ZONE_LABELS[split.zone].short;
        return (
          <g key={split.zone} transform={`translate(${box.x}, ${box.y})`}>
            {/* No outline on the readout: the rank text below carries green or red. */}
            <rect x={-box.w / 2} y={-box.h / 2} width={box.w} height={box.h} rx={7} className="fill-inset" />
            {box.layout === "stacked" ? (
              <>
                <text y={-6} textAnchor="middle" fill="#fff" fontSize={10.5} fontWeight={700}>
                  {split.share}%
                </text>
                <text y={6} textAnchor="middle" fill="#94a3b8" fontSize={8}>
                  {short}
                </text>
                <text y={17} textAnchor="middle" fill={accent} fontSize={8.5} fontWeight={700}>
                  #{split.oppRank}
                </text>
              </>
            ) : box.layout === "banner" ? (
              <>
                <text y={-3} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700}>
                  {split.share}% of Shots (Above Break 3)
                </text>
                <text y={12} textAnchor="middle" fill={accent} fontSize={10} fontWeight={600}>
                  {opponentAbbr} Defense Rank: #{split.oppRank} ({soft ? "Soft" : "Tough"})
                </text>
              </>
            ) : (
              <>
                <text y={-2} textAnchor="middle" fill="#fff" fontSize={10.5} fontWeight={700}>
                  {split.share}% Shots
                </text>
                <text y={10.5} textAnchor="middle" fill={accent} fontSize={9} fontWeight={600}>
                  {short} · {opponentAbbr} #{split.oppRank}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Where the player shoots from, set against how tonight's opponent defends each zone.
 *
 * The card is a size container. The court and the zone list sit side by side
 * only where the card is wide enough for both, and the FG% shows only where the
 * zone's name still fits beside it. The screen's width does not say either.
 */
export function ShotZones({ zones, opponentAbbr }: ShotZonesProps) {
  const [scope, setScope] = useState<ProfileScope>("season");
  const splits = zones[scope];
  const softShare = splits.reduce((sum, split) => (isSoftMatchup(split.oppRank) ? sum + split.share : sum), 0);
  const ordered = [...splits].sort((a, b) => b.share - a.share);

  return (
    <Card className="@container p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-sm font-bold text-fg">Half-Court Shot Distribution &amp; {opponentAbbr} Zone Defense</h3>
          <Badge tone={softShare >= 50 ? "good" : "bad"} className="rounded-full px-2 py-1 text-[11px]">
            {softShare}% of Shots in Soft Zones
          </Badge>
        </div>
        <ScopeToggle label="Shot zone sample" value={scope} onChange={setScope} />
      </div>

      <div className="grid grid-cols-1 items-center gap-5 @2xl:grid-cols-12">
        <div className="flex items-center justify-center rounded-xl bg-inset p-3 @md:p-4 @2xl:col-span-7">
          <CourtMap zones={splits} opponentAbbr={opponentAbbr} />
        </div>

        <ul className="space-y-2.5 @2xl:col-span-5">
          {ordered.map((split) => {
            const soft = isSoftMatchup(split.oppRank);
            return (
              <InsetRow key={split.zone} layout="stack" density="regular">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-semibold text-fg">{ZONE_LABELS[split.zone].name}</span>
                  <div className="flex shrink-0 items-center gap-2 font-mono">
                    <span className="hidden text-[10px] text-fg-subtle @md:inline @2xl:hidden @4xl:inline">{split.fgPct.toFixed(1)}% FG</span>
                    <span className="font-bold text-fg">{split.share}%</span>
                    <Badge tone={soft ? "good" : "bad"} className="px-2 font-bold">
                      {opponentAbbr} #{split.oppRank}
                    </Badge>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-raised">
                  <div className={cn("h-full rounded-full", soft ? "bg-good" : "bg-bad")} style={{ width: `${Math.min(100, split.share * 2.1)}%` }} />
                </div>
              </InsetRow>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}
