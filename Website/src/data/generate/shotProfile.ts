import type {
  PlayTypeId,
  PlayTypeSplit,
  PlayerShotProfile,
  PositionGroup,
  ProfileScope,
  ShotTypeId,
  ShotTypeSplit,
  ShotZoneId,
  ShotZoneSplit,
} from "@/data/types";
import type { BaseAverages } from "@/data/fixtures/nba/rosters";
import type { RankTables } from "./ranks";
import { clamp, createRng, type Rng } from "./rng";

const round1 = (value: number) => Math.round(value * 10) / 10;
const round2 = (value: number) => Math.round(value * 100) / 100;

export const ZONE_ORDER: ShotZoneId[] = ["atb3", "rim", "mid", "lc3", "rc3", "paint"];
export const SHOT_TYPE_ORDER: ShotTypeId[] = ["pullUp", "rim", "catchShoot"];
export const PLAY_TYPE_ORDER: PlayTypeId[] = ["pnrHandler", "iso", "transition", "spotUp", "postUp"];

/** Which opponent ranking each split is judged against. */
const ZONE_METRIC: Record<ShotZoneId, string> = {
  atb3: "zoneAtb3",
  rim: "zoneRim",
  mid: "zoneMid",
  lc3: "zoneLc3",
  rc3: "zoneRc3",
  paint: "zonePaint",
};
const SHOT_TYPE_METRIC: Record<ShotTypeId, string> = { pullUp: "pullUp", rim: "zoneRim", catchShoot: "catchShoot" };
const PLAY_TYPE_METRIC: Record<PlayTypeId, string> = {
  pnrHandler: "pnr",
  iso: "iso",
  transition: "transition",
  spotUp: "spotUp",
  postUp: "postUp",
};

type Archetype = "leadGuard" | "shooter" | "scoringWing" | "stretchBig" | "big";

function archetypeOf(group: PositionGroup, base: BaseAverages): Archetype {
  if (group === "bigs") return base.threes >= 1 ? "stretchBig" : "big";
  if (group === "guards") return base.ast >= 4.5 || base.pts >= 20 ? "leadGuard" : "shooter";
  if (base.threes < 0.6 && base.reb >= 5) return "big";
  return base.pts >= 15 ? "scoringWing" : "shooter";
}

/** Share of shots by zone, in ZONE_ORDER. */
const ZONE_SHARES: Record<Archetype, number[]> = {
  leadGuard: [34, 26, 14, 6, 6, 14],
  shooter: [38, 16, 10, 13, 13, 10],
  scoringWing: [32, 27, 14, 8, 8, 11],
  stretchBig: [28, 36, 9, 5, 5, 17],
  big: [2, 60, 7, 1, 1, 29],
};
const ZONE_FG_PCT: Record<ShotZoneId, number> = { atb3: 36.5, rim: 65, mid: 42, lc3: 39.5, rc3: 39.5, paint: 45 };

/** Share of shots by type, in SHOT_TYPE_ORDER. */
const SHOT_TYPE_SHARES: Record<Archetype, number[]> = {
  leadGuard: [46, 30, 24],
  shooter: [22, 20, 58],
  scoringWing: [38, 30, 32],
  stretchBig: [14, 52, 34],
  big: [5, 82, 13],
};
const SHOT_TYPE_EFF: Record<ShotTypeId, number> = { pullUp: 48.5, rim: 64, catchShoot: 57.5 };

/** Share of possessions by play type, in PLAY_TYPE_ORDER. */
const PLAY_TYPE_SHARES: Record<Archetype, number[]> = {
  leadGuard: [40, 17, 17, 18, 8],
  shooter: [12, 8, 18, 52, 10],
  scoringWing: [24, 22, 18, 24, 12],
  stretchBig: [6, 12, 14, 30, 38],
  big: [3, 6, 15, 14, 62],
};
const PLAY_TYPE_PPP: Record<PlayTypeId, number> = { pnrHandler: 0.98, iso: 0.96, transition: 1.18, spotUp: 1.06, postUp: 1.0 };

/** Whole-percent shares that sum to exactly 100 (largest remainder). */
export function toWholeShares(weights: readonly number[]): number[] {
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) return weights.map(() => 0);
  const exact = weights.map((w) => (w / total) * 100);
  const shares = exact.map(Math.floor);
  let left = 100 - shares.reduce((sum, s) => sum + s, 0);
  const order = exact.map((value, index) => ({ index, remainder: value - Math.floor(value) })).sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; left > 0; i += 1, left -= 1) shares[order[i % order.length].index] += 1;
  return shares;
}

function jitterShares(base: readonly number[], spread: number, rng: Rng): number[] {
  return toWholeShares(base.map((share) => (share === 0 ? 0 : Math.max(1, share + rng.normal(0, spread)))));
}

interface ProfileOptions {
  playerId: string;
  positionGroup: PositionGroup;
  base: BaseAverages;
  /** Season averages from the game log. */
  seasonPts: number;
  seasonFga: number;
  opponentAbbr: string;
  tables: RankTables;
  /** Season values to use as-is instead of generating (Tatum). */
  pinned?: {
    zones: { zone: ShotZoneId; share: number; fgPct: number }[];
    shotTypes: { type: ShotTypeId; share: number; fga: number; efficiencyPct: number; ppg: number }[];
    playTypes: { type: PlayTypeId; share: number; ppg: number; ppp: number }[];
  };
}

/**
 * Where a player's shots come from, by court zone, shot type and play type,
 * for the season and for the last five games. Each split carries tonight's
 * opponent's rank against it.
 */
export function buildShotProfile(options: ProfileOptions): PlayerShotProfile {
  const { playerId, positionGroup, base, seasonPts, seasonFga, opponentAbbr, tables, pinned } = options;
  const rng = createRng(`shots:${playerId}`);
  const archetype = archetypeOf(positionGroup, base);
  const oppRank = (metric: string) => tables[metric][opponentAbbr];

  // --- Season ---------------------------------------------------------------
  const zoneShares = pinned ? pinned.zones.map((z) => z.share) : jitterShares(ZONE_SHARES[archetype], 3, rng);
  const seasonZones: ShotZoneSplit[] = ZONE_ORDER.map((zone, i) => ({
    zone,
    share: zoneShares[i],
    fgPct: pinned ? pinned.zones[i].fgPct : round1(clamp(rng.normal(ZONE_FG_PCT[zone], 3), 24, 78)),
    oppRank: oppRank(ZONE_METRIC[zone]),
  }));

  const typeShares = pinned ? pinned.shotTypes.map((t) => t.share) : jitterShares(SHOT_TYPE_SHARES[archetype], 4, rng);
  const seasonShotTypes: ShotTypeSplit[] = SHOT_TYPE_ORDER.map((type, i) => {
    const fga = pinned ? pinned.shotTypes[i].fga : round1((seasonFga * typeShares[i]) / 100);
    const efficiencyPct = pinned ? pinned.shotTypes[i].efficiencyPct : round1(clamp(rng.normal(SHOT_TYPE_EFF[type], 4), 34, 78));
    return {
      type,
      share: typeShares[i],
      fga,
      efficiencyPct,
      efficiencyLabel: type === "rim" ? "FG" : "eFG",
      ppg: pinned ? pinned.shotTypes[i].ppg : round1((fga * efficiencyPct * 2) / 100),
      oppRank: oppRank(SHOT_TYPE_METRIC[type]),
    };
  });

  const playShares = pinned ? pinned.playTypes.map((p) => p.share) : jitterShares(PLAY_TYPE_SHARES[archetype], 3, rng);
  const seasonPlayTypes: PlayTypeSplit[] = PLAY_TYPE_ORDER.map((type, i) => ({
    type,
    share: playShares[i],
    ppg: pinned ? pinned.playTypes[i].ppg : round1((seasonPts * playShares[i]) / 100),
    ppp: pinned ? pinned.playTypes[i].ppp : round2(clamp(rng.normal(PLAY_TYPE_PPP[type], 0.08), 0.7, 1.45)),
    oppRank: oppRank(PLAY_TYPE_METRIC[type]),
  }));

  // --- Last five: the season profile with recent-form drift -------------------
  const recent = createRng(`shots-l5:${playerId}`);
  const drift = (values: readonly number[]) => toWholeShares(values.map((v) => (v === 0 ? 0 : Math.max(1, v + recent.normal(0, 2.5)))));

  const l5ZoneShares = drift(seasonZones.map((z) => z.share));
  const l5Zones = seasonZones.map((z, i) => ({
    ...z,
    share: l5ZoneShares[i],
    fgPct: round1(clamp(z.fgPct + recent.normal(0, 3.5), 20, 82)),
  }));

  const l5TypeShares = drift(seasonShotTypes.map((t) => t.share));
  const l5ShotTypes = seasonShotTypes.map((t, i) => {
    const fga = round1(t.share === 0 ? 0 : (t.fga * l5TypeShares[i]) / t.share);
    const efficiencyPct = round1(clamp(t.efficiencyPct + recent.normal(0, 3.5), 30, 82));
    const pointsPerAttempt = t.fga > 0 ? t.ppg / t.fga : 0;
    return {
      ...t,
      share: l5TypeShares[i],
      fga,
      efficiencyPct,
      ppg: round1(fga * pointsPerAttempt * (t.efficiencyPct > 0 ? efficiencyPct / t.efficiencyPct : 1)),
    };
  });

  const l5PlayShares = drift(seasonPlayTypes.map((p) => p.share));
  const l5PlayTypes = seasonPlayTypes.map((p, i) => ({
    ...p,
    share: l5PlayShares[i],
    ppg: round1(p.share === 0 ? 0 : (p.ppg * l5PlayShares[i]) / p.share),
    ppp: round2(clamp(p.ppp + recent.normal(0, 0.05), 0.7, 1.5)),
  }));

  const byScope = <T>(season: T, l5: T): Record<ProfileScope, T> => ({ season, l5 });
  return {
    zones: byScope(seasonZones, l5Zones),
    shotTypes: byScope(seasonShotTypes, l5ShotTypes),
    playTypes: byScope(seasonPlayTypes, l5PlayTypes),
  };
}
