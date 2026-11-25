/** American odds helpers. Prices are stored as signed integers: -110, +164. */

/** -110 -> "-110", 164 -> "+164" */
export function formatOdds(price: number): string {
  return price > 0 ? `+${price}` : `${price}`;
}

/** 4.5 -> "+4.5", -4.5 -> "-4.5", 0 -> "PK" */
export function formatSpread(line: number): string {
  if (line === 0) return "PK";
  return line > 0 ? `+${line}` : `${line}`;
}

/** The break-even probability a price implies, vig included. -110 -> 0.524 */
export function impliedProbability(price: number): number {
  return price < 0 ? -price / (-price + 100) : 100 / (price + 100);
}

/** Converts a probability back to the nearest American price. */
export function probabilityToAmerican(probability: number): number {
  const p = Math.min(0.99, Math.max(0.01, probability));
  const price = p >= 0.5 ? -(p / (1 - p)) * 100 : ((1 - p) / p) * 100;
  return Math.round(price);
}
