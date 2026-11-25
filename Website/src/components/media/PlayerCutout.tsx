"use client";

import { playerHeadshotUrl } from "./imageUrls";
import { useImageStatus } from "./useImageStatus";

interface PlayerCutoutProps {
  headshotKey: string | null;
  /** Size and position. The picture keeps its shape inside them. */
  className?: string;
}

/**
 * A player's headshot as the cut-out it is: head and shoulders on a clear
 * background, not cropped to a circle. Purely decorative, so it draws nothing
 * when there is no picture. Use `PlayerAvatar` where a player must be shown.
 */
export function PlayerCutout({ headshotKey, className }: PlayerCutoutProps) {
  const src = playerHeadshotUrl(headshotKey);
  const { ref, failed, onError } = useImageStatus(src);
  if (!src || failed) return null;

  // eslint-disable-next-line @next/next/no-img-element -- remote headshots from a host we do not control or optimise
  return <img ref={ref} src={src} alt="" onError={onError} className={className} />;
}
