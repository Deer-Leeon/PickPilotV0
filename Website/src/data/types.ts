/**
 * Domain types.
 *
 * These are the shapes the UI reads. They mirror the tables described in
 * docs/DATABASE.md, flattened the way an API would return them. When the real
 * backend exists, its responses should match these types so no component has
 * to change.
 */

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

export type LeagueId = "nba";

export interface League {
  id: LeagueId;
  name: string;
  emoji: string;
  /** "2026-27" */
  seasonLabel: string;
  /** "'26-'27" */
  seasonShortLabel: string;
  /** Number of teams, which is also the worst possible rank. */
  teamCount: number;
}

export interface Venue {
  name: string;
  city: string;
}

export interface Team {
  /** Lower-case abbreviation, e.g. "bos". */
  id: string;
  leagueId: LeagueId;
  abbr: string;
  city: string;
  nickname: string;
  fullName: string;
  /** Primary brand colour, used for ambient glows only. */
  color: string;
  /** Key the media layer turns into a logo URL. */
  logoKey: string | null;
  venue: Venue | null;
}

export type Position = "PG" | "SG" | "SF" | "PF" | "C" | "G" | "F";
/** The five positions that defense-versus-position ranks exist for. */
export type MatchupPosition = "PG" | "SG" | "SF" | "PF" | "C";
export type PositionGroup = "guards" | "wings" | "bigs";

export interface Player {
  /** URL slug, e.g. "jayson-tatum". */
  id: string;
  leagueId: LeagueId;
  teamId: string;
  name: string;
  position: Position;
  matchupPosition: MatchupPosition;
  positionGroup: PositionGroup;
  role: "starter" | "bench";
  /** Order within the role: 0-4 for starters (PG to C), then bench. */
  depthOrder: number;
  /** Key the media layer turns into a headshot URL. */
  headshotKey: string | null;
}

export type BookId = "FD" | "DK" | "MGM" | "CZR" | "PIN";

// ---------------------------------------------------------------------------
// Games and game markets
// ---------------------------------------------------------------------------

export interface TeamRecord {
  wins: number;
  losses: number;
}

export interface GameTeam {
  team: Team;
  record: TeamRecord;
}

/** One side of a market at its best available price. American odds. */
export interface MarketSide {
  /** Spread or total points. Null for moneyline. */
  line: number | null;
  price: number;
  book: BookId;
  /** True when this side carries the best line on the board (emerald dot). */
  isBest: boolean;
}

export interface GameMarkets {
  spread: { away: MarketSide; home: MarketSide };
  moneyline: { away: MarketSide; home: MarketSide };
  total: { over: MarketSide; under: MarketSide };
}

export type GameStatus = "scheduled" | "live" | "final" | "postponed";

export interface Game {
  /** URL slug, e.g. "nyk-bos". */
  id: string;
  leagueId: LeagueId;
  /** Slate date in the league's local calendar, "2026-11-13". */
  date: string;
  /** Tip time as an ISO timestamp (UTC). */
  startsAt: string;
  status: GameStatus;
  network: string;
  venue: Venue;
  away: GameTeam;
  home: GameTeam;
  markets: GameMarkets;
}

export interface SlateDate {
  date: string;
  isToday: boolean;
  gameCount: number;
}

/** A team or game trend that backs a line, e.g. 8-3 against the spread. */
export interface TrendRecord {
  wins: number;
  losses: number;
  /** "ATS", "O/U", "1H ATS", "1Q O/U", "SU" */
  label: string;
}

export type GameLineMarket = "spread" | "total" | "moneyline" | "h1_spread" | "q1_total";
export type GameLineSide = "away" | "home" | "over" | "under";

export interface GameLineOffer {
  /** Stable key, e.g. "nyk-bos:spread:away". */
  id: string;
  gameId: string;
  market: GameLineMarket;
  side: GameLineSide;
  /** "NYK Knicks +4.5", "Over 224.5 Points" */
  title: string;
  /** Short form for the research slip, e.g. "Knicks +4.5 Spread". */
  slipTitle: string;
  price: number;
  book: BookId;
  trend: TrendRecord;
  isBest: boolean;
}

export interface GameLines {
  gameId: string;
  consensusTotal: number;
  spread: GameLineOffer[];
  total: GameLineOffer[];
  derivatives: GameLineOffer[];
  moneyline: GameLineOffer[];
}

// ---------------------------------------------------------------------------
// Team comparison
// ---------------------------------------------------------------------------

export type StatWindow = "l3" | "l5" | "season";
export type RadarAxis = "off" | "def" | "pace" | "threes" | "reb" | "tov";
export type TeamStatKey = "pts" | "fgPct" | "fg3Pct" | "reb" | "ast" | "tov" | "pace";

export interface RankedValue {
  value: number;
  /** 1 is best in the league. */
  rank: number;
}

export interface TeamWindowProfile {
  /** League rank on each radar axis. */
  radar: Record<RadarAxis, number>;
  /** What the team produces. */
  offense: Record<TeamStatKey, RankedValue>;
  /** What the team allows. */
  defense: Record<TeamStatKey, RankedValue>;
}

export type TeamProfile = Record<StatWindow, TeamWindowProfile>;

// ---------------------------------------------------------------------------
// Player stats, props and research
// ---------------------------------------------------------------------------

export type StatId = "PTS" | "AST" | "REB" | "3PM" | "PA" | "PR" | "RA" | "PRA" | "DD";

/** Letter grade for a prop. Always computed on the server, never in the UI. */
export type Grade = "A" | "A-" | "B+" | "B" | "C" | "D+" | "D" | "F";

export interface PriceQuote {
  price: number;
  book: BookId;
}

export interface PlayerProp {
  playerId: string;
  gameId: string;
  stat: StatId;
  line: number;
  /** Best over price among the user's books. */
  over: PriceQuote;
  under: PriceQuote;
  grade: Grade;
  /** The prop shown next to the player in lineups and rotation tables. */
  isFeatured: boolean;
}

/**
 * Opponent ranks used by matchup filters. 1 is the toughest defense, 30 the
 * softest. "dvp" is defense versus the player's own position.
 */
export type OppRankMetric =
  | "dvp"
  | "pnr"
  | "defRtg"
  | "pace"
  | "iso"
  | "transition"
  | "ftRate"
  | "rebAllowed"
  | "zoneAtb3"
  | "zoneRim"
  | "paintPts"
  | "pullUp"
  | "catchShoot"
  | "corner3";

export type OppRanks = Record<OppRankMetric, number>;

export interface PlayerGameLogEntry {
  id: string;
  /** "2026-10-22" */
  date: string;
  opponentAbbr: string;
  isHome: boolean;
  /** Full days off before this game. 0 is the second night of a back-to-back. */
  restDays: number;
  min: number;
  pts: number;
  reb: number;
  ast: number;
  threes: number;
  fgm: number;
  fga: number;
  fg3m: number;
  fg3a: number;
  ftm: number;
  fta: number;
  pf: number;
  /** Usage rate, percent. */
  usg: number;
  /** Opponent ranks as they stood on the day of the game. */
  oppRanks: OppRanks;
  /** Injury-report ids of teammates who did not play. */
  teammatesOut: string[];
}

/** The player's next game, shown as the dashed "Tonight" bar. */
export interface UpcomingGameContext {
  gameId: string;
  date: string;
  opponentAbbr: string;
  isHome: boolean;
  restDays: number;
  projectedMin: number;
  projectedFga: number;
  oppRanks: OppRanks;
  teammatesOut: string[];
}

export type ProfileScope = "l5" | "season";
export type ShotZoneId = "atb3" | "rim" | "mid" | "lc3" | "rc3" | "paint";
export type ShotTypeId = "pullUp" | "rim" | "catchShoot";
export type PlayTypeId = "pnrHandler" | "iso" | "transition" | "spotUp" | "postUp";

export interface ShotZoneSplit {
  zone: ShotZoneId;
  /** Share of the player's shots, whole percent. A scope sums to 100. */
  share: number;
  fgPct: number;
  /** Tonight's opponent's rank defending this zone. */
  oppRank: number;
}

export interface ShotTypeSplit {
  type: ShotTypeId;
  share: number;
  fga: number;
  /** Effective FG% for jumpers, plain FG% at the rim. */
  efficiencyPct: number;
  efficiencyLabel: "eFG" | "FG";
  ppg: number;
  oppRank: number;
}

export interface PlayTypeSplit {
  type: PlayTypeId;
  share: number;
  ppg: number;
  /** Points per possession. */
  ppp: number;
  oppRank: number;
}

export interface PlayerShotProfile {
  zones: Record<ProfileScope, ShotZoneSplit[]>;
  shotTypes: Record<ProfileScope, ShotTypeSplit[]>;
  playTypes: Record<ProfileScope, PlayTypeSplit[]>;
}

/** A comparable player's points line and result against tonight's opponent. */
export interface SimilarPlayerComp {
  date: string;
  playerName: string;
  teamAbbr: string;
  headshotKey: string | null;
  line: number;
  actual: number;
}

export type InjuryStatus = "OUT" | "DOUBTFUL" | "QUESTIONABLE" | "PROBABLE";

export interface InjuryReportEntry {
  id: string;
  teamId: string;
  playerName: string;
  position: Position;
  status: InjuryStatus;
  injury: string;
  /** Sourced note on who benefits. Null when the feed has none. */
  impactNote: string | null;
  headshotKey: string | null;
}

// ---------------------------------------------------------------------------
// View bundles returned by the repository
// ---------------------------------------------------------------------------

export interface StatAverages {
  pts: number;
  reb: number;
  ast: number;
}

/** A player row in lineups, rotation tables and roster lists. */
export interface RotationPlayer {
  player: Player;
  averages: Record<StatWindow, StatAverages>;
  /** Null when no prop is posted for the player. */
  featuredProp: PlayerProp | null;
  /** Season hit rate on the featured prop's over. */
  featuredHits: { hits: number; total: number } | null;
}

export interface GameRoster {
  team: Team;
  starters: RotationPlayer[];
  bench: RotationPlayer[];
  injuries: InjuryReportEntry[];
}

export interface GameRosters {
  gameId: string;
  lineupStatus: "confirmed" | "projected";
  away: GameRoster;
  home: GameRoster;
}

export interface TeamInjuries {
  team: Team;
  entries: InjuryReportEntry[];
}

export interface GameInjuries {
  gameId: string;
  away: TeamInjuries;
  home: TeamInjuries;
}

/** One game's players, for the slate-wide player index. */
export interface SlateGamePlayers {
  game: Game;
  rosters: GameRosters;
}

export interface GameMatchup {
  rosters: GameRosters;
  comparison: { away: TeamProfile; home: TeamProfile };
  /** The player the "Prop Research" shortcut opens. */
  spotlightPlayer: Player | null;
}

export interface PlayerResearch {
  player: Player;
  team: Team;
  opponent: Team;
  game: Game;
  isHome: boolean;
  props: PlayerProp[];
  /** Completed games, oldest first. */
  gameLog: PlayerGameLogEntry[];
  upcoming: UpcomingGameContext;
  shotProfile: PlayerShotProfile;
  similar: SimilarPlayerComp[];
  /** The OUT teammate the "without" filter refers to, if any. */
  teammateOut: InjuryReportEntry | null;
  rosters: GameRosters;
}

export type LeaderCategory = "PTS" | "REB" | "AST" | "3PM" | "COMBO" | "TEAM";

export interface LeaderRow {
  id: string;
  kind: "player" | "team";
  category: LeaderCategory;
  name: string;
  team: Team;
  headshotKey: string | null;
  /** "vs NYK" or "@ BOS" */
  matchupLabel: string;
  /** "Over 28.5 PTS" or "CLE -7.5 Spread" */
  propLabel: string;
  /** Text for the research slip. */
  slipTitle: string;
  slipSubtitle: string;
  hits: number;
  sample: number;
  /** Most recent five results, oldest first. */
  lastFive: boolean[];
  price: number;
  book: BookId;
  grade: Grade | null;
  /** Where the row links to. */
  target:
    | { kind: "player"; playerId: string; stat: StatId }
    | { kind: "game"; gameId: string };
}

/** Lightweight lookup the top bar uses to build the breadcrumb. */
export interface NavIndex {
  games: { id: string; label: string; date: string }[];
  players: { id: string; name: string; gameId: string }[];
  todayGameCount: number;
}
