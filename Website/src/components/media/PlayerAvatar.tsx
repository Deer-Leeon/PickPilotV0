"use client";

import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";
import { playerHeadshotUrl } from "./imageUrls";
import { useImageStatus } from "./useImageStatus";

interface PlayerAvatarProps {
  name: string;
  headshotKey: string | null;
  /** Tailwind size classes, e.g. "size-12". */
  className?: string;
}

/** A player's headshot in a circle. Falls back to initials. */
export function PlayerAvatar({ name, headshotKey, className }: PlayerAvatarProps) {
  const src = playerHeadshotUrl(headshotKey);
  const { ref, failed, onError } = useImageStatus(src);

  return (
    <span
      className={cn(
        "relative flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-strong bg-raised",
        className,
      )}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote headshots from a host we do not control or optimise
        <img ref={ref} src={src} alt="" loading="lazy" onError={onError} className="size-full scale-110 object-cover object-top" />
      ) : (
        <span aria-hidden="true" className="font-mono text-[10px] font-semibold text-fg-muted">
          {initials(name)}
        </span>
      )}
    </span>
  );
}
