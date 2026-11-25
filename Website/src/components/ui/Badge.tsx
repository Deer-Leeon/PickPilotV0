import type { ReactNode } from "react";
import type { Grade } from "@/data/types";
import { cn } from "@/lib/cn";
import { gradeTone, type Tone } from "@/lib/research/grades";
import { SOFT_RANK_THRESHOLD } from "@/lib/research/matchup";

export type BadgeTone = Tone | "warn";

const TONES: Record<BadgeTone, string> = {
  good: "bg-good/10 text-good-fg",
  bad: "bg-bad/10 text-bad-fg",
  warn: "bg-warn-fg/10 text-warn-fg",
  neutral: "bg-white/[0.04] text-fg-soft",
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

/** A small mono label: rank, grade, status, count. A tinted fill, no outline. */
export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        // The transparent border is spacing only: it keeps the badge the size callers already tune their padding for.
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded border border-transparent px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Tone for a league rank.
 * "defense": the rank describes an opponent's defense, so a high number (soft) is good for the player.
 * "team": the rank describes a team's own production, so a low number is good.
 */
export function rankTone(rank: number, kind: "defense" | "team"): Tone {
  if (kind === "defense") {
    if (rank >= SOFT_RANK_THRESHOLD) return "good";
    return rank <= 10 ? "bad" : "neutral";
  }
  if (rank <= 10) return "good";
  return rank >= 21 ? "bad" : "neutral";
}

interface RankBadgeProps {
  rank: number;
  kind: "defense" | "team";
  /** Text before the rank, e.g. the opponent abbreviation. */
  prefix?: string;
  className?: string;
}

export function RankBadge({ rank, kind, prefix, className }: RankBadgeProps) {
  return (
    <Badge tone={rankTone(rank, kind)} className={className}>
      {prefix ? `${prefix} ` : ""}#{rank}
    </Badge>
  );
}

interface GradeBadgeProps {
  grade: Grade;
  className?: string;
}

export function GradeBadge({ grade, className }: GradeBadgeProps) {
  return (
    <Badge tone={gradeTone(grade)} className={cn("min-w-6", className)}>
      {grade}
    </Badge>
  );
}
