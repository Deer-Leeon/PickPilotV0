"use client";

import { cn } from "@/lib/cn";
import { teamLogoUrl } from "./imageUrls";
import { useImageStatus } from "./useImageStatus";

interface TeamLogoProps {
  team: { abbr: string; logoKey: string | null };
  /** Tailwind size classes, e.g. "size-9". */
  className?: string;
}

/** A team's logo in a rounded tile. Falls back to the abbreviation. */
export function TeamLogo({ team, className }: TeamLogoProps) {
  const src = teamLogoUrl(team.logoKey);
  const { ref, failed, onError } = useImageStatus(src);

  return (
    <span
      className={cn(
        "flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border-strong bg-raised p-1 shadow-sm",
        className,
      )}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote SVG logos; next/image adds nothing for them
        <img ref={ref} src={src} alt={team.abbr} loading="lazy" onError={onError} className="size-full object-contain" />
      ) : (
        <span className="font-mono text-[10px] font-bold text-fg-soft">{team.abbr}</span>
      )}
    </span>
  );
}
