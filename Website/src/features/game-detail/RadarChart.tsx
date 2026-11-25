import type { RadarAxis } from "@/data/types";
import { RADAR_AXES, rankToRadarScore } from "@/lib/research/matchup";

interface RadarChartProps {
  awayAbbr: string;
  homeAbbr: string;
  /** League rank per axis. 1 is best and sits on the outer ring. */
  away: Record<RadarAxis, number>;
  home: Record<RadarAxis, number>;
}

// Geometry. Points are laid out on a 480 x 330 canvas; the viewBox trims the
// empty side margins so the drawing fills a phone-width card.
const VIEW_BOX = "64 0 352 330";
const CX = 240;
const CY = 165;
const RADIUS = 112;
const ANGLES = [-90, -30, 30, 90, 150, 210].map((degrees) => (degrees * Math.PI) / 180);
const RINGS = [0.25, 0.5, 0.75, 1];

function point(score: number, index: number): [number, number] {
  const r = score * RADIUS;
  return [Number((CX + r * Math.cos(ANGLES[index])).toFixed(1)), Number((CY + r * Math.sin(ANGLES[index])).toFixed(1))];
}

const polygon = (scores: readonly number[]) => scores.map((score, index) => point(score, index).join(",")).join(" ");

/**
 * Six-axis comparison of two teams by league rank. The away team is drawn in
 * white, the home team in emerald. Each corner shows the category with both
 * ranks, away on the left and home on the right, and the better one lit.
 */
export function RadarChart({ awayAbbr, homeAbbr, away, home }: RadarChartProps) {
  const awayScores = RADAR_AXES.map((axis) => rankToRadarScore(away[axis.id]));
  const homeScores = RADAR_AXES.map((axis) => rankToRadarScore(home[axis.id]));
  const summary = RADAR_AXES.map((axis) => `${axis.label}: ${awayAbbr} #${away[axis.id]}, ${homeAbbr} #${home[axis.id]}`).join("; ");

  return (
    <svg viewBox={VIEW_BOX} role="img" aria-label={`League ranks. ${summary}`} className="size-full max-h-[350px] select-none overflow-visible">
      {RINGS.map((ring) => (
        <polygon
          key={ring}
          points={polygon(ANGLES.map(() => ring))}
          fill={ring === 1 ? "rgba(20, 24, 34, 0.35)" : "none"}
          className={ring === 1 ? "stroke-border-strong" : "stroke-border"}
          strokeWidth={ring === 1 ? 1.4 : 1}
        />
      ))}
      {ANGLES.map((_, index) => {
        const [x, y] = point(1, index);
        return <line key={index} x1={CX} y1={CY} x2={x} y2={y} className="stroke-border" strokeWidth={1.1} />;
      })}

      <polygon points={polygon(awayScores)} fill="rgba(226, 232, 240, 0.16)" stroke="#e2e8f0" strokeWidth={2.2} />
      <polygon points={polygon(homeScores)} className="fill-good/20 stroke-good" strokeWidth={2.6} />

      {RADAR_AXES.map((axis, index) => {
        const [awayX, awayY] = point(awayScores[index], index);
        const [homeX, homeY] = point(homeScores[index], index);
        const [labelX, labelY] = point(index === 0 || index === 3 ? 1.27 : 1.34, index);
        const awayRank = away[axis.id];
        const homeRank = home[axis.id];
        const homeLeads = homeRank < awayRank;
        const awayLeads = awayRank < homeRank;
        return (
          <g key={axis.id}>
            <circle cx={awayX} cy={awayY} r={4} className="fill-fg stroke-canvas" strokeWidth={1.6} />
            <circle cx={homeX} cy={homeY} r={4.5} className="fill-good stroke-canvas" strokeWidth={1.6} />
            <g transform={`translate(${labelX}, ${labelY})`}>
              <text x={0} y={-3} textAnchor="middle" fontSize={10.5} fontWeight={700} className="fill-fg font-sans">
                {axis.label}
              </text>
              <text x={0} y={10.5} textAnchor="middle" fontSize={10} className="font-mono">
                <tspan className={awayLeads ? "fill-fg" : "fill-fg-subtle"} fontWeight={awayLeads ? 700 : 500}>
                  #{awayRank}
                </tspan>
                <tspan className="fill-fg-faint"> · </tspan>
                <tspan className={homeLeads ? "fill-good-fg" : "fill-fg-subtle"} fontWeight={homeLeads ? 700 : 500}>
                  #{homeRank}
                </tspan>
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
