import { useCallback, useState } from "react";

/**
 * Tracks whether an image failed to load, including the case where it failed
 * before React attached its handlers (the image is already "complete" with
 * no pixels by the time the page hydrates).
 */
export function useImageStatus(src: string | null) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const ref = useCallback(
    (img: HTMLImageElement | null) => {
      if (img && src && img.complete && img.naturalWidth === 0) setFailedSrc(src);
    },
    [src],
  );

  return {
    ref,
    failed: src === null || failedSrc === src,
    onError: () => setFailedSrc(src),
  };
}
