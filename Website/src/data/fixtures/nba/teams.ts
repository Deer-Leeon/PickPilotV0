import type { Team, Venue } from "@/data/types";

/**
 * All 30 NBA teams. Only the 12 on the sample slate have rosters; the rest
 * appear as past opponents in game logs.
 *
 * logoKey is the NBA team id. The media layer is the only code that turns it
 * into a URL (see src/components/media/imageUrls.ts).
 */

type TeamSeed = [abbr: string, city: string, nickname: string, nbaTeamId: number, color: string, venue?: Venue];

const SEEDS: TeamSeed[] = [
  ["ATL", "Atlanta", "Hawks", 1610612737, "#E03A3E"],
  ["BOS", "Boston", "Celtics", 1610612738, "#007A33", { name: "TD Garden", city: "Boston, MA" }],
  ["BKN", "Brooklyn", "Nets", 1610612751, "#6B7280"],
  ["CHA", "Charlotte", "Hornets", 1610612766, "#00788C"],
  ["CHI", "Chicago", "Bulls", 1610612741, "#CE1141"],
  ["CLE", "Cleveland", "Cavaliers", 1610612739, "#860038", { name: "Rocket Arena", city: "Cleveland, OH" }],
  ["DAL", "Dallas", "Mavericks", 1610612742, "#00538C", { name: "American Airlines Center", city: "Dallas, TX" }],
  ["DEN", "Denver", "Nuggets", 1610612743, "#FEC524"],
  ["DET", "Detroit", "Pistons", 1610612765, "#C8102E"],
  ["GSW", "Golden State", "Warriors", 1610612744, "#1D428A", { name: "Chase Center", city: "San Francisco, CA" }],
  ["HOU", "Houston", "Rockets", 1610612745, "#CE1141"],
  ["IND", "Indiana", "Pacers", 1610612754, "#FDBB30"],
  ["LAC", "LA", "Clippers", 1610612746, "#C8102E"],
  ["LAL", "Los Angeles", "Lakers", 1610612747, "#FDB927", { name: "Crypto.com Arena", city: "Los Angeles, CA" }],
  ["MEM", "Memphis", "Grizzlies", 1610612763, "#5D76A9", { name: "FedExForum", city: "Memphis, TN" }],
  ["MIA", "Miami", "Heat", 1610612748, "#98002E"],
  ["MIL", "Milwaukee", "Bucks", 1610612749, "#00471B"],
  ["MIN", "Minnesota", "Timberwolves", 1610612750, "#236192", { name: "Target Center", city: "Minneapolis, MN" }],
  ["NOP", "New Orleans", "Pelicans", 1610612740, "#85714D"],
  ["NYK", "New York", "Knicks", 1610612752, "#F58426", { name: "Madison Square Garden", city: "New York, NY" }],
  ["OKC", "Oklahoma City", "Thunder", 1610612760, "#007AC1"],
  ["ORL", "Orlando", "Magic", 1610612753, "#0077C0"],
  ["PHI", "Philadelphia", "76ers", 1610612755, "#006BB6", { name: "Wells Fargo Center", city: "Philadelphia, PA" }],
  ["PHX", "Phoenix", "Suns", 1610612756, "#E56020", { name: "Footprint Center", city: "Phoenix, AZ" }],
  ["POR", "Portland", "Trail Blazers", 1610612757, "#E03A3E", { name: "Moda Center", city: "Portland, OR" }],
  ["SAC", "Sacramento", "Kings", 1610612758, "#5A2D81", { name: "Golden 1 Center", city: "Sacramento, CA" }],
  ["SAS", "San Antonio", "Spurs", 1610612759, "#C4CED4"],
  ["TOR", "Toronto", "Raptors", 1610612761, "#CE1141"],
  ["UTA", "Utah", "Jazz", 1610612762, "#6F263D"],
  ["WAS", "Washington", "Wizards", 1610612764, "#E31837"],
];

export const NBA_TEAMS: Team[] = SEEDS.map(([abbr, city, nickname, nbaTeamId, color, venue]) => ({
  id: abbr.toLowerCase(),
  leagueId: "nba",
  abbr,
  city,
  nickname,
  fullName: `${city} ${nickname}`,
  color,
  logoKey: String(nbaTeamId),
  venue: venue ?? null,
}));

export const NBA_TEAM_ABBRS: string[] = NBA_TEAMS.map((team) => team.abbr);
