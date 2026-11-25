/**
 * Display formatting. Everything here is deterministic: no locale or
 * time-zone lookups that could differ between the server and the browser.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseIsoDate(isoDate: string): { year: number; month: number; day: number } {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return { year, month, day };
}

/** "2026-10-22" -> "10/22" */
export function formatShortDate(isoDate: string): string {
  const { month, day } = parseIsoDate(isoDate);
  return `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
}

/** "2026-11-08" -> "Nov 08" */
export function formatMonthDay(isoDate: string): string {
  const { month, day } = parseIsoDate(isoDate);
  return `${MONTHS[month - 1]} ${String(day).padStart(2, "0")}`;
}

/** "2026-11-14" -> "Sat Nov 14" */
export function formatWeekdayDate(isoDate: string): string {
  const { year, month, day } = parseIsoDate(isoDate);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${WEEKDAYS[weekday]} ${MONTHS[month - 1]} ${day}`;
}

const easternTime = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
});

/** ISO timestamp -> "7:30 PM ET". Tip times are always shown in Eastern. */
export function formatTipTime(isoTimestamp: string): string {
  return `${easternTime.format(new Date(isoTimestamp))} ET`;
}

/** 1.7 -> "+1.7", -0.4 -> "-0.4", 0 -> "0.0" */
export function formatSigned(value: number, digits = 1): string {
  const fixed = value.toFixed(digits);
  return value > 0 ? `+${fixed}` : fixed;
}

export function formatRecord(record: { wins: number; losses: number }): string {
  return `${record.wins}-${record.losses}`;
}

/** 8.1 -> "8.1", 12 -> "12.0" */
export function formatAverage(value: number): string {
  return value.toFixed(1);
}

/** Whole-number percentage: 0.667 -> "67%" */
export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

/** 1 -> "1st", 2 -> "2nd", 13 -> "13th", 23 -> "23rd" */
export function formatOrdinal(value: number): string {
  const lastTwo = value % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${value}th`;
  const suffix = ["th", "st", "nd", "rd"][value % 10] ?? "th";
  return `${value}${suffix}`;
}

/** "Jayson Tatum" -> "Tatum", "Karl-Anthony Towns" -> "Towns", "Dereck Lively II" -> "Lively" */
export function lastName(fullName: string): string {
  const parts = fullName.split(" ").filter((p) => !/^(Jr\.|Sr\.|II|III|IV)$/.test(p));
  return parts[parts.length - 1] ?? fullName;
}

/** "Kristaps Porzingis" -> "K. Porzingis" */
export function shortName(fullName: string): string {
  const [first] = fullName.split(" ");
  return `${first.charAt(0)}. ${lastName(fullName)}`;
}

/** "Jayson Tatum" -> "JT" */
export function initials(fullName: string): string {
  const parts = fullName.split(/[\s-]+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = lastName(fullName).charAt(0);
  return `${first}${last}`.toUpperCase();
}
