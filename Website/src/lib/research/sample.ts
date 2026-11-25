export type SampleWindow = "l5" | "l10" | "season";

export const SAMPLE_WINDOWS: readonly SampleWindow[] = ["l5", "l10", "season"];

const WINDOW_SIZE: Record<SampleWindow, number | null> = { l5: 5, l10: 10, season: null };

/**
 * The most recent games for a sample window.
 * Expects the log oldest first and keeps that order.
 */
export function takeSample<T>(log: readonly T[], window: SampleWindow): T[] {
  const size = WINDOW_SIZE[window];
  return size === null ? [...log] : log.slice(-size);
}

export function sampleLabel(window: SampleWindow, seasonGames: number): string {
  if (window === "l5") return "L5";
  if (window === "l10") return "L10";
  return `Season (${seasonGames})`;
}

/** Mean of a list, or null for an empty list. Missing data is never zero. */
export function average(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
