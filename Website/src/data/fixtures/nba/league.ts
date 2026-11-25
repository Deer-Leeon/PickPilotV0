import type { BookId, League } from "@/data/types";

export const NBA: League = {
  id: "nba",
  name: "NBA",
  emoji: "🏀",
  seasonLabel: "2026-27",
  seasonShortLabel: "'26-'27",
  teamCount: 30,
};

/**
 * The sample slate is pinned to one evening so the mock data never drifts.
 * "Today" in the UI means this date, not the real calendar date.
 */
export const SLATE_DATE = "2026-11-13";

/** Dates shown in the date tabs. Only SLATE_DATE has games in the sample data. */
export const SLATE_DATES = ["2026-11-13", "2026-11-14", "2026-11-15", "2026-11-16", "2026-11-17", "2026-11-18"];

export const BOOKS: readonly BookId[] = ["FD", "DK", "MGM", "CZR", "PIN"];
