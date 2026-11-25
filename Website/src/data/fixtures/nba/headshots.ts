/**
 * NBA player ids, used as headshot keys.
 *
 * Every id was checked by name against the public nba_api player index, so a
 * photo always belongs to the player it sits next to. A player missing from
 * this map shows an initials avatar instead.
 */
export const NBA_HEADSHOT_IDS: Record<string, number> = {
  // New York
  "Jalen Brunson": 1628973,
  "Mikal Bridges": 1628969,
  "Josh Hart": 1628404,
  "OG Anunoby": 1628384,
  "Karl-Anthony Towns": 1626157,
  "Miles McBride": 1630540,
  "Cameron Payne": 1626166,
  "Jericho Sims": 1630579,
  "Mitchell Robinson": 1629011,
  // Boston
  "Derrick White": 1628401,
  "Jrue Holiday": 201950,
  "Jaylen Brown": 1627759,
  "Jayson Tatum": 1628369,
  "Al Horford": 201143,
  "Payton Pritchard": 1630202,
  "Sam Hauser": 1630573,
  "Neemias Queta": 1629674,
  "Kristaps Porzingis": 204001,
  // LA Lakers
  "D'Angelo Russell": 1626156,
  "Austin Reaves": 1630559,
  "LeBron James": 2544,
  "Rui Hachimura": 1629060,
  "Anthony Davis": 203076,
  "Gabe Vincent": 1629216,
  "Dalton Knecht": 1642261,
  "Jaxson Hayes": 1629637,
  "Jarred Vanderbilt": 1629020,
  // Memphis
  "Ja Morant": 1629630,
  "Desmond Bane": 1630217,
  "Jaylen Wells": 1642377,
  "Jaren Jackson Jr.": 1628991,
  "Zach Edey": 1641744,
  "Scotty Pippen Jr.": 1630590,
  "Santi Aldama": 1630583,
  "Brandon Clarke": 1629634,
  "Marcus Smart": 203935,
  // Cleveland
  "Darius Garland": 1629636,
  "Donovan Mitchell": 1628378,
  "Max Strus": 1629622,
  "Evan Mobley": 1630596,
  "Jarrett Allen": 1628386,
  "Caris LeVert": 1627747,
  "Ty Jerome": 1629660,
  "Dean Wade": 1629731,
  "Isaac Okoro": 1630171,
  // Philadelphia
  "Tyrese Maxey": 1630178,
  "Jared McCain": 1642272,
  "Kelly Oubre Jr.": 1626162,
  "Paul George": 202331,
  "Joel Embiid": 203954,
  "Kyle Lowry": 200768,
  "Caleb Martin": 1628997,
  "Andre Drummond": 203083,
  // Dallas
  "Luka Doncic": 1629029,
  "Kyrie Irving": 202681,
  "Klay Thompson": 202691,
  "P.J. Washington": 1629023,
  "Dereck Lively II": 1641726,
  "Spencer Dinwiddie": 203915,
  "Naji Marshall": 1630230,
  "Daniel Gafford": 1629655,
  "Dante Exum": 203957,
  // Golden State
  "Stephen Curry": 201939,
  "Brandin Podziemski": 1641764,
  "Andrew Wiggins": 203952,
  "Draymond Green": 203110,
  "Trayce Jackson-Davis": 1631218,
  "Buddy Hield": 1627741,
  "Jonathan Kuminga": 1630228,
  "Kevon Looney": 1626172,
  "De'Anthony Melton": 1629001,
  // Minnesota
  "Mike Conley": 201144,
  "Anthony Edwards": 1630162,
  "Jaden McDaniels": 1630183,
  "Julius Randle": 203944,
  "Rudy Gobert": 203497,
  "Donte DiVincenzo": 1628978,
  "Nickeil Alexander-Walker": 1629638,
  "Naz Reid": 1629675,
  "Joe Ingles": 204060,
  // Portland
  "Scoot Henderson": 1630703,
  "Anfernee Simons": 1629014,
  "Toumani Camara": 1641739,
  "Jerami Grant": 203924,
  "Deandre Ayton": 1629028,
  "Shaedon Sharpe": 1631101,
  "Deni Avdija": 1630166,
  "Donovan Clingan": 1642270,
  "Robert Williams III": 1629057,
  // Phoenix
  "Tyus Jones": 1626145,
  "Devin Booker": 1626164,
  "Bradley Beal": 203078,
  "Kevin Durant": 201142,
  "Jusuf Nurkic": 203994,
  "Grayson Allen": 1628960,
  "Royce O'Neale": 1626220,
  "Mason Plumlee": 203486,
  "Ryan Dunn": 1642346,
  // Sacramento
  "De'Aaron Fox": 1628368,
  "Kevin Huerter": 1628989,
  "DeMar DeRozan": 201942,
  "Keegan Murray": 1631099,
  "Domantas Sabonis": 1627734,
  "Malik Monk": 1628370,
  "Keon Ellis": 1631165,
  "Trey Lyles": 1626168,
  "Devin Carter": 1642269,
  // Comparison players who are not on tonight's slate
  "Paolo Banchero": 1631094,
  "Franz Wagner": 1630532,
  "Jalen Johnson": 1630552,
  "Brandon Miller": 1641706,
  "Pascal Siakam": 1627783,
};

export function headshotKeyFor(playerName: string): string | null {
  const id = NBA_HEADSHOT_IDS[playerName];
  return id ? String(id) : null;
}
