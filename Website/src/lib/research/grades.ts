import type { Grade } from "@/data/types";

/**
 * Grades arrive from the data layer. The UI only decides how to colour them;
 * it never calculates a grade itself.
 */
export type Tone = "good" | "bad" | "neutral";

export function gradeTone(grade: Grade): Tone {
  if (grade.startsWith("A") || grade.startsWith("B")) return "good";
  if (grade === "C") return "neutral";
  return "bad";
}

/** Every grade, best first. Used to sort by grade, never to work one out. */
export const GRADE_ORDER: readonly Grade[] = ["A", "A-", "B+", "B", "C", "D+", "D", "F"];

/** Position of a grade in GRADE_ORDER: 0 is the best. */
export function gradeRank(grade: Grade): number {
  return GRADE_ORDER.indexOf(grade);
}

/** The top of the scale (A and A-): good enough to be called out, where a B is merely fine. */
export function isTopGrade(grade: Grade): boolean {
  return grade.startsWith("A");
}
