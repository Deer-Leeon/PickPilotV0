import type { BookId, Position, StatId } from "@/data/types";

/**
 * Hand-written rosters for the 12 teams on the sample slate.
 *
 * These are placeholders for building the product. They are not a claim about
 * any real season's rosters, and the numbers are starting points for the
 * seeded generator, not real statistics.
 */

export interface BaseAverages {
  pts: number;
  reb: number;
  ast: number;
  threes: number;
  min: number;
}

export interface FeaturedPropSeed {
  stat: StatId;
  line: number;
  price: number;
  book?: BookId;
  /** How many of the player's games clear the line. The generator honours this exactly. */
  hits: number;
}

export interface PlayerSeed {
  name: string;
  position: Position;
  base: BaseAverages;
  /** The prop shown beside the player. Generated when omitted. */
  featured?: FeaturedPropSeed;
  /** Team games the player sat out, which shortens his sample. */
  gamesMissed?: number;
}

export interface RosterSeed {
  team: string;
  /** PG, SG, SF, PF, C in that order. */
  starters: PlayerSeed[];
  bench: PlayerSeed[];
}

function p(
  name: string,
  position: Position,
  pts: number,
  reb: number,
  ast: number,
  threes: number,
  min: number,
  extra: Pick<PlayerSeed, "featured" | "gamesMissed"> = {},
): PlayerSeed {
  return { name, position, base: { pts, reb, ast, threes, min }, ...extra };
}

export const NBA_ROSTERS: RosterSeed[] = [
  {
    team: "NYK",
    starters: [
      p("Jalen Brunson", "PG", 27.4, 3.1, 7.2, 2.4, 35.5, { featured: { stat: "PTS", line: 27.5, price: -112, hits: 7 } }),
      p("Mikal Bridges", "SG", 17.8, 3.9, 3.4, 2.1, 37.0, { featured: { stat: "PTS", line: 16.5, price: -108, hits: 7 } }),
      p("Josh Hart", "SF", 13.6, 8.8, 5.4, 1.1, 37.5, { featured: { stat: "RA", line: 14.5, price: -105, book: "FD", hits: 9 } }),
      p("OG Anunoby", "PF", 16.9, 5.2, 2.1, 2.2, 36.0, { featured: { stat: "PTS", line: 15.5, price: -115, hits: 5 } }),
      p("Karl-Anthony Towns", "C", 24.9, 12.4, 3.0, 2.1, 34.5, { featured: { stat: "PTS", line: 23.5, price: -106, hits: 8 } }),
    ],
    bench: [
      p("Miles McBride", "G", 10.4, 2.1, 2.8, 2.0, 25.0, { featured: { stat: "PTS", line: 9.5, price: -110, hits: 6 } }),
      p("Cameron Payne", "G", 6.8, 1.6, 3.2, 1.2, 15.5, { featured: { stat: "PTS", line: 6.5, price: -104, hits: 4 } }),
      p("Jericho Sims", "C", 2.4, 4.9, 0.6, 0, 13.0, { featured: { stat: "REB", line: 4.5, price: -118, hits: 3 } }),
    ],
  },
  {
    team: "BOS",
    starters: [
      p("Derrick White", "PG", 18.6, 4.5, 4.8, 3.1, 34.0, { featured: { stat: "PTS", line: 17.5, price: -108, hits: 8 } }),
      p("Jrue Holiday", "SG", 12.9, 4.1, 3.9, 1.9, 31.5, { featured: { stat: "PTS", line: 12.5, price: -110, hits: 7 } }),
      p("Jaylen Brown", "SF", 25.4, 6.6, 4.1, 2.2, 35.0, { featured: { stat: "PTS", line: 24.5, price: -114, hits: 7 } }),
      // Tatum's game log, props and shot profile are pinned in tatum.ts.
      p("Jayson Tatum", "PF", 30.2, 8.1, 5.8, 3.8, 36.2),
      p("Al Horford", "C", 9.4, 5.6, 2.4, 1.6, 27.0, { featured: { stat: "PTS", line: 8.5, price: -112, hits: 5 } }),
    ],
    bench: [
      p("Payton Pritchard", "G", 15.8, 3.2, 3.1, 3.3, 28.0, { featured: { stat: "PTS", line: 13.5, price: -105, book: "PIN", hits: 9 } }),
      p("Sam Hauser", "F", 8.9, 3.4, 1.1, 2.4, 22.0, { featured: { stat: "3PM", line: 2.5, price: 118, hits: 3 } }),
      p("Neemias Queta", "C", 6.2, 5.8, 0.8, 0, 16.0, { featured: { stat: "REB", line: 5.5, price: -110, hits: 7 } }),
    ],
  },
  {
    team: "LAL",
    starters: [
      p("D'Angelo Russell", "PG", 12.8, 2.9, 5.6, 2.2, 28.0),
      p("Austin Reaves", "SG", 18.2, 4.1, 5.4, 2.6, 34.5),
      p("LeBron James", "SF", 23.6, 8.0, 8.8, 2.0, 35.0),
      p("Rui Hachimura", "PF", 13.4, 5.6, 1.4, 1.7, 31.0),
      p("Anthony Davis", "C", 28.4, 11.6, 3.2, 0.7, 35.5, {
        featured: { stat: "PTS", line: 27.5, price: -108, book: "MGM", hits: 8 },
        gamesMissed: 1,
      }),
    ],
    bench: [
      p("Gabe Vincent", "G", 6.4, 1.4, 1.6, 1.3, 20.5),
      p("Dalton Knecht", "F", 10.6, 3.0, 1.0, 2.1, 22.5),
      p("Jaxson Hayes", "C", 6.2, 4.6, 0.8, 0, 16.5),
    ],
  },
  {
    team: "MEM",
    starters: [
      p("Ja Morant", "PG", 22.4, 4.6, 8.4, 1.5, 30.5),
      p("Desmond Bane", "SG", 18.6, 5.4, 5.0, 2.5, 32.0),
      p("Jaylen Wells", "SF", 11.2, 3.4, 1.6, 1.8, 26.5),
      p("Jaren Jackson Jr.", "PF", 21.8, 5.8, 1.9, 2.0, 30.0),
      p("Zach Edey", "C", 10.4, 7.6, 1.0, 0.3, 22.0),
    ],
    bench: [
      p("Scotty Pippen Jr.", "G", 10.6, 3.2, 4.8, 1.1, 22.5),
      p("Santi Aldama", "F", 12.8, 6.6, 2.8, 1.9, 25.5),
      p("Brandon Clarke", "F", 8.4, 5.2, 1.0, 0, 18.5),
    ],
  },
  {
    team: "CLE",
    starters: [
      p("Darius Garland", "PG", 20.8, 2.6, 6.8, 2.9, 31.0),
      p("Donovan Mitchell", "SG", 24.6, 4.4, 4.6, 3.4, 31.5),
      p("Max Strus", "SF", 10.2, 4.4, 3.4, 2.3, 26.0),
      p("Evan Mobley", "PF", 18.4, 9.2, 3.0, 1.1, 30.5),
      p("Jarrett Allen", "C", 13.8, 10.2, 1.9, 0, 28.5),
    ],
    bench: [
      p("Caris LeVert", "G", 11.4, 2.8, 3.8, 1.6, 24.0),
      p("Ty Jerome", "G", 11.8, 2.4, 3.4, 1.7, 19.5),
      p("Dean Wade", "F", 5.6, 4.2, 1.2, 1.2, 21.0),
    ],
  },
  {
    team: "PHI",
    starters: [
      p("Tyrese Maxey", "PG", 26.2, 3.4, 6.2, 3.2, 37.5),
      p("Jared McCain", "SG", 15.4, 2.6, 2.8, 2.6, 26.0),
      p("Kelly Oubre Jr.", "SF", 14.8, 6.0, 1.8, 1.3, 33.5),
      p("Paul George", "PF", 16.4, 5.4, 4.4, 2.3, 32.0),
      p("Joel Embiid", "C", 23.8, 8.4, 4.4, 1.2, 30.5, { gamesMissed: 2 }),
    ],
    bench: [
      p("Kyle Lowry", "G", 4.2, 2.0, 2.8, 0.9, 18.5),
      p("Caleb Martin", "F", 9.2, 4.6, 2.2, 1.2, 30.0),
      p("Andre Drummond", "C", 7.4, 8.0, 1.0, 0, 18.5),
    ],
  },
  {
    team: "DAL",
    starters: [
      p("Luka Doncic", "PG", 28.2, 8.4, 8.9, 3.4, 36.0, {
        featured: { stat: "AST", line: 8.5, price: -112, book: "CZR", hits: 8 },
      }),
      p("Kyrie Irving", "SG", 24.2, 4.6, 5.0, 3.0, 35.5),
      p("Klay Thompson", "SF", 13.8, 3.6, 2.0, 3.0, 28.0),
      p("P.J. Washington", "PF", 13.6, 8.2, 2.2, 1.5, 32.5),
      p("Dereck Lively II", "C", 8.8, 7.6, 2.4, 0, 23.5),
    ],
    bench: [
      p("Spencer Dinwiddie", "G", 10.2, 2.4, 4.2, 1.4, 25.0),
      p("Naji Marshall", "F", 12.4, 4.6, 2.8, 1.0, 27.0),
      p("Daniel Gafford", "C", 11.2, 6.6, 1.2, 0, 21.5),
    ],
  },
  {
    team: "GSW",
    starters: [
      p("Stephen Curry", "PG", 24.8, 4.6, 6.2, 4.9, 32.0, {
        featured: { stat: "3PM", line: 4.5, price: -115, book: "FD", hits: 7 },
        gamesMissed: 2,
      }),
      p("Brandin Podziemski", "SG", 10.6, 4.8, 3.6, 1.6, 26.5),
      p("Andrew Wiggins", "SF", 17.4, 4.6, 2.4, 2.1, 30.5),
      p("Draymond Green", "PF", 9.2, 6.2, 5.8, 1.4, 29.0),
      p("Trayce Jackson-Davis", "C", 7.4, 5.4, 1.6, 0, 17.0),
    ],
    bench: [
      p("Buddy Hield", "G", 12.6, 3.4, 1.6, 3.0, 23.0),
      p("Jonathan Kuminga", "F", 15.8, 4.6, 2.2, 1.0, 25.0),
      p("Kevon Looney", "C", 4.6, 6.4, 1.6, 0, 15.0),
    ],
  },
  {
    team: "MIN",
    starters: [
      p("Mike Conley", "PG", 8.4, 2.6, 4.6, 1.8, 25.0),
      p("Anthony Edwards", "SG", 27.6, 5.6, 4.4, 4.1, 36.5),
      p("Jaden McDaniels", "SF", 11.8, 5.6, 1.9, 1.3, 31.5),
      p("Julius Randle", "PF", 19.2, 7.2, 4.6, 1.6, 32.5),
      p("Rudy Gobert", "C", 11.4, 10.6, 1.6, 0, 33.0),
    ],
    bench: [
      p("Donte DiVincenzo", "G", 10.8, 3.6, 3.4, 2.6, 26.5),
      p("Nickeil Alexander-Walker", "G", 9.4, 3.0, 2.6, 1.8, 25.5),
      p("Naz Reid", "F", 14.2, 5.8, 2.2, 2.2, 27.0),
    ],
  },
  {
    team: "POR",
    starters: [
      p("Scoot Henderson", "PG", 12.6, 3.0, 5.2, 1.6, 26.5),
      p("Anfernee Simons", "SG", 19.4, 2.8, 4.8, 3.1, 32.5),
      p("Toumani Camara", "SF", 10.4, 5.6, 2.0, 1.5, 32.0),
      p("Jerami Grant", "PF", 14.6, 3.4, 2.0, 2.1, 32.5),
      p("Deandre Ayton", "C", 14.2, 10.0, 1.6, 0, 30.0),
    ],
    bench: [
      p("Shaedon Sharpe", "G", 17.8, 4.4, 2.8, 2.0, 31.0),
      p("Deni Avdija", "F", 15.2, 6.8, 3.8, 1.6, 29.5),
      p("Donovan Clingan", "C", 6.2, 7.6, 1.0, 0, 19.0),
    ],
  },
  {
    team: "PHX",
    starters: [
      p("Tyus Jones", "PG", 10.8, 2.4, 5.6, 1.8, 27.5),
      p("Devin Booker", "SG", 25.6, 4.2, 7.0, 2.4, 37.0),
      p("Bradley Beal", "SF", 17.2, 3.4, 3.6, 1.9, 32.0),
      p("Kevin Durant", "PF", 26.8, 6.2, 4.2, 2.4, 36.5),
      p("Jusuf Nurkic", "C", 8.8, 9.4, 2.4, 0.5, 24.0),
    ],
    bench: [
      p("Grayson Allen", "G", 10.6, 3.0, 2.2, 2.5, 24.5),
      p("Royce O'Neale", "F", 9.2, 4.8, 2.2, 2.3, 25.0),
      p("Mason Plumlee", "C", 4.6, 4.4, 1.6, 0, 16.0),
    ],
  },
  {
    team: "SAC",
    starters: [
      p("De'Aaron Fox", "PG", 25.6, 4.8, 6.2, 1.9, 36.5),
      p("Kevin Huerter", "SG", 8.6, 3.0, 1.8, 1.7, 22.5),
      p("DeMar DeRozan", "SF", 22.4, 3.8, 4.2, 0.9, 36.0),
      p("Keegan Murray", "PF", 12.4, 6.6, 1.4, 2.0, 34.5),
      p("Domantas Sabonis", "C", 19.6, 13.8, 6.2, 0.8, 34.5, {
        featured: { stat: "RA", line: 19.5, price: -110, book: "DK", hits: 9 },
      }),
    ],
    bench: [
      p("Malik Monk", "G", 17.2, 3.8, 5.6, 2.4, 31.0),
      p("Keon Ellis", "G", 7.6, 2.6, 1.6, 1.6, 22.5),
      p("Trey Lyles", "F", 6.6, 4.6, 1.2, 1.0, 19.5),
    ],
  },
];
