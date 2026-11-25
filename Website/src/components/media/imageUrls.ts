/**
 * The only place that knows where images live.
 *
 * Data carries keys (logoKey, headshotKey), never URLs. Today the keys are
 * NBA ids and the images load from NBA.com, which is fine for development
 * but is not licensed for a public product. When licensed or self-hosted
 * images are ready, change these two functions and nothing else.
 */

export function teamLogoUrl(logoKey: string | null): string | null {
  return logoKey ? `https://cdn.nba.com/logos/nba/${logoKey}/global/L/logo.svg` : null;
}

export function playerHeadshotUrl(headshotKey: string | null): string | null {
  return headshotKey ? `https://cdn.nba.com/headshots/nba/latest/260x190/${headshotKey}.png` : null;
}
