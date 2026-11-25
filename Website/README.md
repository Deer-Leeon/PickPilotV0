# PickPilot website

The PickPilot web app: NBA games, matchups, game lines, player prop research and a research slip. This is the single-file prototype (`pickpilot_nba_research_ui.html`) rebuilt as a real project, with every screen on its own route and every number computed from one set of data.

It runs entirely on mock data. There is no database, API, sign-in or payment yet. The planned database is described in [`docs/DATABASE.md`](docs/DATABASE.md).

## Run it

Requires Node 20.9 or newer (built and tested on Node 22).

```bash
npm install
npm run dev        # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serves the production build |
| `npm run typecheck` | Generates route types, then runs TypeScript |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests (Vitest) |
| `npm run check` | Type check, lint and tests together. Run before every commit. |

## What is in it

| Stack | Used for |
| --- | --- |
| Next.js 16 (App Router), React 19, TypeScript | Pages, routing, server rendering |
| Tailwind CSS 4 | Styling, with the design tokens in `src/app/globals.css` |
| nuqs | Page state in the URL (stat, sample, filters, tabs) |
| Zustand | The research slip, saved in the browser |
| Radix UI | The two-handle rank slider and the phone sheets |
| Vitest | Unit tests for the research maths and the mock data |

Charts (hit-rate bars, trend line, radar, shot map) are hand-written SVG and HTML. There is no chart library.

## Pages

| URL | Screen | Prototype screen |
| --- | --- | --- |
| `/nba/games` | Tonight's games with spread, moneyline and total | 1 and 9 |
| `/nba/games/[gameId]/matchup` | Starting lineups and team comparison | 2 |
| `/nba/games/[gameId]/players` | Both rotations with props and grades | 3 |
| `/nba/games/[gameId]/lines` | Spread, total, first half and quarter, moneyline | 4 |
| `/nba/games/[gameId]/injuries` | Injury report | 4 |
| `/nba/players` | Every player on the slate (new: the prototype had no index) | none |
| `/nba/players/[playerId]` | Player prop research | 5, 6 and 7 |
| `/nba/leaders` | Hit-rate leaders | 8 |

`/` and `/nba` redirect to `/nba/games`. A game URL without a tab opens Matchup. The redirects are in `next.config.ts`.

The prototype's "VIEW" dropdown is gone. What it switched between is now a URL, so every state can be linked, bookmarked and reached with the back button:

| URL parameter | Page | Values |
| --- | --- | --- |
| `?date=2026-11-14` | Games | A slate date |
| `?window=l5` | Matchup, Players | `l3`, `l5`, `season` |
| `?view=bars` | Matchup | `radar`, `bars` |
| `?dir=home` | Matchup | `away`, `home`: whose offense the stat bars follow |
| `?stat=REB` | Player | `PTS`, `AST`, `REB`, `3PM`, `PA`, `PR`, `RA`, `PRA`, `DD` |
| `?sample=l10` | Player | `l5`, `l10`, `season` |
| `?filters=dvp:18-30,min_34` | Player | Filter codes, with a rank window where the filter has one |
| `?trend=min` | Player | `oppDef`, `pnr`, `min`, `fga`, `none` |
| `?tab=shots` | Player | `zones`, `shots`, `plays`, `similar`, `all` |
| `?panel=filters` | Player | Opens the filter drawer |
| `?cat=REB` | Leaders | `ALL`, `PTS`, `REB`, `AST`, `3PM`, `COMBO`, `TEAM` |

Default values are left out of the URL.

### Page layout

Every page sits in the same column: it starts at the left edge of the page area and is at most 80rem wide (`components/shell/PageColumn.tsx`). The room that is left on the right belongs to one side panel, 20rem wide on every page (`components/shell/SidePanel.tsx`). It is a rounded card, not a strip: it starts level with the page's first card, sits one card gap from the page, and fills the height between the same gap above and below. The list scrolls inside it when that is more than the screen, and a short list leaves empty card below. Its outer margin matches the page's left margin from 1536px up and is one card gap on laptops, so the page keeps its room. It is not one of the page's cards and does not share their shade: it has the panel shade the sheets use, and what it holds sits on it as neutral raised tiles. In the Stand Outs list, green and red appear only in the small marks (the Good and Bad labels and each row's arrow).

- It shows **Stand Outs** by default: up to four good and four bad things about the page on screen. Each one leads with the single figure that makes it stand out, so it can be read at a glance. Selecting one lights that spot on the page, then the light fades; the arrow on a row opens the research behind it. The list follows the page's URL state, so it changes with the date, the stat window, the leaders category and, on the player page, the stat, sample and filters.
- Opening the research slip swaps the slip into the same panel. Closing the slip brings Stand Outs back.
- The panel is docked from 1280px up. Below that, the **Stand Outs** button in the top bar opens it as a sheet, and the slip opens as a sheet too.
- On a player page the list starts with that player's spotlight (`features/player-research/PlayerSpotlight.tsx`): the team's glow opens, the headshot cut-out rises into it and the name follows, about a second and a half in all. It plays when a player is opened, not when the stat, sample or filters change, and then rests as a banner. With reduced motion switched on it appears finished.

The player page has its own layout (roster, pinned header, scrolling modules) and is sized to end at the same right edge (`PAGE_RIGHT_EDGE` in `PageColumn.tsx`). Its header band stops one gap short of the docked card. Its filter drawer opens on the left, in the roster's place, so the stand-outs stay in view while filters are switched on.

Because the panel takes room from the page, the screen's width does not say how wide a page is: at 1280px the column is narrower than it is at 1100px. Anything that needs a certain width to fit (two tables side by side, a full name, an extra column) asks its container instead, with Tailwind container variants such as `@6xl:grid-cols-2`. `PageColumn` is a container, and so are the cards and modules that rearrange themselves: the starting lineups, the team comparison, the shot zones and the player page's lower modules. Screen breakpoints are left for phone against desktop.

## Folder map

```
src/
  app/                    Routes only. Each file loads data and hands it to a feature.
    layout.tsx            Fonts, metadata, URL-state adapter
    globals.css           Design tokens and the few global styles
    [league]/
      layout.tsx          App frame: top bar, rail, bottom tabs, side panel
      games/              Games board and the four game tabs
      players/            Player index and player research
      leaders/            Hit-rate leaders
      @standouts/         The side panel's content: one file per page URL, plus default.tsx

  components/
    ui/                   Building blocks with no knowledge of sports: Button, Card, Badge,
                          InsetRow, Tabs, SegmentedControl, Sheet, RangeSlider, Skeleton,
                          EmptyState, StandOutList
    shell/                Top bar, breadcrumb, desktop rail, phone tab bar, PageColumn (the
                          column every page sits in) and SidePanel (Stand Outs or the slip)
    media/                TeamLogo, PlayerAvatar, PlayerCutout (the headshot uncropped) and the
                          one file that builds image URLs

  features/               One folder per part of the product. Components here know the domain.
    games/                Games board: date tabs, game cards, odds cells
    game-detail/          Game header and tabs, lineups, radar, stat bars, rotations, lines, injuries
    player-research/      Header, stat strip, hit-rate chart, filter drawer, four lower modules
    leaders/              Leaders board, category filter, table and phone cards
    slip/                 Research slip: store, panel and sheet, add buttons, leg builders
                          Each feature also has a …StandOuts file: what the side panel shows for its pages.

  lib/
    research/             The maths. Pure functions, no React, fully unit tested.
      standOuts/          What stands out on each page, good and bad. One file per page.
    routes.ts             Every in-app URL is built here
    format.ts             Dates, names, signed numbers
    flash.ts              Lights up the spot on the page a stand-out points at
    cn.ts                 Class-name helper

  data/
    types.ts              The shapes every screen reads
    repository.ts         The only door between the screens and the data
    fixtures/nba/         Hand-written teams, rosters, tonight's slate, Jayson Tatum's season
    generate/             Seeded generator that fills in everything else

  hooks/                  useMediaQuery, useHydrated, useLocateStandOut

docs/
  DATABASE.md             Planned database structure (not built)
```

### The three rules that keep it tidy

1. **Pages get data from `src/data/repository.ts` and nowhere else.** Every function there is `async` and returns the types in `src/data/types.ts`. When the backend exists, each function body becomes a request and no page or component changes.
2. **Numbers are computed in `src/lib/research/`, not in components.** Hit rates, samples, filters, chart scales and leader rankings are pure functions with tests. A component receives finished values and draws them.
3. **Colours come from tokens.** Use `bg-card`, `border-border`, `text-fg-muted`, `text-good-fg` and the others defined in `globals.css`. Do not put hex values in markup. Team colours are data.

## Where the prototype's code went

| Prototype | Now |
| --- | --- |
| `state` object, `setScreen`, `renderAll` | Gone. Routes plus URL parameters hold the state; React re-renders. |
| `renderHeaderState` | `components/shell/TopBar.tsx`, `Breadcrumb.tsx`, `NavRail.tsx`, `BottomNav.tsx` |
| `renderGameBoardScreen` | `features/games/GamesBoard.tsx`, `DateTabs.tsx` |
| `renderGameCardComponent` | `features/games/GameCard.tsx`, `MarketCell.tsx` |
| `openGameResearch`, `selectGameSection` | Links from `lib/routes.ts`; tabs in `features/game-detail/GameNav.tsx` |
| `renderGameResearchScreen` | `app/[league]/games/[gameId]/layout.tsx`, `features/game-detail/GameHero.tsx` |
| `renderGameSectionBody` (Matchup) | `StartingLineups.tsx`, `TeamComparison.tsx`, `RadarChart.tsx`, `StatBars.tsx` |
| `renderGameSectionBody` (Players) | `RotationTable.tsx`, `PlayersSection.tsx` |
| `renderGameSectionBody` (Lines, Injuries) | `GameLinesCards.tsx`, `InjuryReport.tsx` |
| `renderWindowControlComponent`, `setWindowScope` | `features/game-detail/WindowControl.tsx`, `gameParams.ts` |
| `setMatchupDirection`, `setTeamCompView` | `gameParams.ts` (`?dir`, `?view`) |
| `renderPlayerWorkspaceScreen` | `features/player-research/PlayerResearchPage.tsx`, `PlayerHeader.tsx`, `StatStrip.tsx`, `RosterSidebar.tsx` |
| `renderHeroChartSection` | `HitRateChart.tsx`, `ActiveFilterBar.tsx`; scales in `lib/research/chart.ts`, the model in `lib/research/view.ts` |
| `renderLowerPlayerModules` | `LowerModules.tsx`, `ShotZones.tsx`, `ShotTypes.tsx`, `PlayTypes.tsx`, `SimilarPlayers.tsx` |
| `renderFilterToolTray` | `FilterDrawer.tsx` |
| `selectStatFamily`, `setSamplePreset`, `setChartOverlayMetric`, `setLowerPlayerTab`, `toggleFilterPanel` | `playerParams.ts` (URL parameters) |
| `toggleFilterChip`, `removeFilterChip`, `resetAllFilters`, `updateFilterRange`, `applyRankPreset` | `lib/research/filters.ts` |
| `SUGGESTED_FILTERS`, `gameMatchesSingleFilter`, `getFilteredTatumGames` | `lib/research/filters.ts` (`FILTER_DEFS`, `matchesFilter`, `applyFilters`), `lib/research/sample.ts` |
| `STAT_FAMILIES`, `getStatValueForGame` | `lib/research/stats.ts` |
| `renderLeadersScreen`, `HIT_RATE_LEADERS_DATA` | `features/leaders/`; rows computed by `getLeaders` in `data/repository.ts`, selection in `lib/research/leaders.ts` |
| `renderDockedBetSlip`, `toggleBetSlipDock`, `toggleQuickBetSlip` | `features/slip/`, shown in `components/shell/SidePanel.tsx` |
| `renderTeamBadge`, `renderPlayerAvatar`, `NBA_TEAM_LOGOS`, `NBA_PLAYER_IDS` | `components/media/`, `data/fixtures/nba/teams.ts`, `headshots.ts` |
| `NBA_GAMES`, `MATCHUP_TEAM_STATS`, `GAME_PLAYERS`, `TATUM_GAMES` | `data/fixtures/nba/`, completed by `data/generate/` |

## What changed from the prototype

Fixed:

- **Every filter has its own data.** In the prototype 14 of the 22 filters read the same placeholder field. Each now tests its own field of the game log.
- **Nothing on screen is typed in by hand.** The stat strip, hit rates, slip count and leaders are computed from the game logs, so they always agree with the chart. Two prototype figures changed as a result: Tatum's points over 28.5 is 8 of 12, and Boston's record is 9-3 to match his 12 games.
- **Every game and every listed player works**, each with its own data. In the prototype only Knicks at Celtics and Jayson Tatum did.
- **Odds can be saved from anywhere**: game cards, rotation tables, game lines, the player header and the leaders board.
- **Phone layout.** Bottom tab bar, the slip, filters and roster as full-height sheets, sideways-scrolling tables with a fixed name column, a chart that scrolls and opens bar details on tap, and leaders as cards.
- **Keyboard and screen-reader support.** Focus rings, labelled controls, arrow keys on the sliders, and loading, empty and not-found states.

Deliberately different:

- The slip starts empty and does not open by itself when a pick is added.
- "Clear All" and "Reset" clear filters only. The prototype also reset the sample window.
- The stat strip shows a difference from the season average only when a sample or filter narrows the games.
- Stat tabs appear only for stats that have a posted prop.
- The chart's left axis is fixed by the season's highest game, so bars do not change height when the sample changes.
- The roster sidebar lists bench players as well as starters.
- Game lines has a fourth card for the moneyline.
- The play-type module is titled "Play Types". "Synergy" is a data vendor's name and should only be used if that vendor is licensed.
- Dates other than the sample slate show an empty state.
- Every page is left-aligned at one width, with a Stand Outs panel on the right, which the prototype did not have. The slip opens in that panel instead of in a dock of its own.
- The player page's filter drawer opens on the left, in the roster's place, so the side panel stays in view.

## How to

### Add a page

1. Add a function to `src/lib/routes.ts` that builds its URL.
2. If it needs new data, add the type to `src/data/types.ts` and an `async` function to `src/data/repository.ts`.
3. Create the route file under `src/app/[league]/…/page.tsx`. Copy the shape of `src/app/[league]/leaders/page.tsx`: a plain function that returns `<Suspense>`, and inside it an `async` component that awaits `params` and loads data.
4. Build the screen in a new folder under `src/features/`, inside `PageColumn` so it lines up with every other page.
5. Give it stand-outs (next recipe). Without them the side panel says "Nothing stands out here".
6. If it belongs in the navigation, add it to `src/components/shell/useNavItems.ts`. The rail and the phone tab bar both read that list.

### Add stand-outs to a page

1. Write the calculation in `src/lib/research/standOuts/<page>.ts`: a pure function that takes the data the page already loads and returns `StandOut[]` (`standOut.ts`). Sort each kind of finding strongest first and pass the kinds to `pickStandOuts`, which takes turns between them and stops at four good and four bad. Reuse the shared thresholds (`hitRateTone`, `formSwing`, `isSoftMatchup`, `isTopGrade`) so the panel agrees with the page. Add a test next to it.
2. Add a `…StandOuts` component to the page's feature folder that calls the function and renders `StandOutList`. If the page has URL state, compute one list per value on the server and let a small client component pick by the URL parameter (see `features/game-detail/GameStandOuts.tsx` and `WindowStandOuts.tsx`). Only the player page computes in the browser, because its filters are free-form.
3. Add `src/app/[league]/@standouts/<same path as the page>/page.tsx`. Copy `@standouts/leaders/page.tsx`: `<Suspense fallback={<StandOutListSkeleton />}>` around an `async` component that awaits `params`, calls the repository and hands the data to the feature's component. When the data is missing it renders an empty `StandOutList`; the page itself shows "not found".

A stand-out is a finding with its numbers, never a typed-in sentence. It carries one figure (the number or short word the row leads with, such as "82%" or "OUT") and `targets`: the keys, from `standOuts/targets.ts`, of what it points at on the page, most specific first. Mark the element that shows each thing with `flashKey`, so selecting the stand-out can light it up. "Good" favours the Over or is a team strength. "Bad" works against the Over, is a team weakness or an unavailable player. Anything in between is left out, and a rate with too few games behind it is not called out.

### Add URL state to a page

1. Define the parameters with nuqs parsers in a `…Params.ts` file next to the feature (see `features/game-detail/gameParams.ts`).
2. Split the component in two: a view that takes values and callbacks as props, and a small container that reads the URL with `useQueryStates` and renders the view.
3. Export a `…Fallback` that renders the view with default values, and use it as the `<Suspense fallback>` around the container. The server shows the fallback; the browser swaps in the real state.

### Add a filter

All in `src/lib/research/filters.ts`:

1. Add its code to `FILTER_IDS`.
2. Add a row to `FILTER_DEFS` with its category, group and rule. If none of the existing rule kinds fits, add one to `FilterRule` and handle it in `matchesFilter`.
3. Add its labels in `buildFilterCatalog`.
4. If it needs a new opponent rank, add the metric to `OppRankMetric` in `src/data/types.ts` and to the generator in `src/data/generate/ranks.ts`.
5. Add a test to `filters.test.ts`.

The drawer, the chips, the URL and the hit-rate maths pick it up with no other change.

### Add a stat

1. Add the code to `StatId` in `src/data/types.ts`.
2. Add it to `STAT_IDS` and `STAT_FAMILIES` in `src/lib/research/stats.ts`, with how it is read from a box score.
3. Give players a prop for it in `src/data/generate/props.ts`. A stat tab appears for every stat a player has a prop on.

### Add a league

The first URL segment is the league, and every repository function takes it. To add one:

1. Add its id to `LeagueId` in `src/data/types.ts`.
2. Add fixtures under `src/data/fixtures/<league>/` and make `src/data/generate/dataset.ts` build a dataset per league (today it builds one).
3. Add the league to `generateStaticParams` in `src/app/[league]/layout.tsx`.
4. Move what is specific to basketball behind the league: the stat list (`lib/research/stats.ts`), positions, the filter list, and the half-court map in `ShotZones.tsx`. In the full product this is the `sports-config` package from the tech plan.
5. Add a league switcher to `components/shell/TopBar.tsx`.

### Connect the real backend

1. Replace the body of each function in `src/data/repository.ts` with a request. Keep the signatures.
2. Delete `src/data/fixtures/` and `src/data/generate/`. Keep `types.ts`.
3. Change the two functions in `src/components/media/imageUrls.ts` to point at licensed image storage.

`docs/DATABASE.md` lists which tables each repository function will read.

## Next.js rules this project follows

This project uses Next.js 16 with Cache Components and partial prefetching switched on (`next.config.ts`). A few things differ from older Next.js versions:

- **`params` is a promise.** Pages and layouts are plain functions that pass `params` to an `async` child inside `<Suspense>`. Awaiting it at the top of the page would block the shared, prefetched shell.
- **Every dynamic segment has `generateStaticParams`**, so game and player pages are built ahead of time.
- **The side panel's content is a parallel route.** `app/[league]/@standouts/` mirrors the page URLs, and the league layout receives it as the `standouts` prop next to `children`. Each page URL needs a matching file there. `@standouts/default.tsx` covers any URL that has none; without it a full page load of that URL would be a 404.
- **Functions cannot be passed from a server component to a client component.** This is why each URL-state container has a client `…Fallback` instead of receiving callbacks from the page.
- **No `Math.random()` or `Date.now()` while rendering.** The mock data uses a seeded generator and a fixed slate date (`SLATE_DATE` in `src/data/fixtures/nba/league.ts`), so the server and the browser always render the same thing. "Today" in the app means that date.
- **Redirects live in `next.config.ts`**, not in page files.
- **Anything saved in the browser** (the slip, the last game opened) is read through `useSlip()` or after `useHydrated()` is true, so the first render matches the server.

`AGENTS.md` points coding assistants at the Next.js documentation bundled in `node_modules/next/dist/docs/`.

## Tests

Unit tests sit next to the code they test (`*.test.ts`) and cover the research maths and the mock data:

- `src/lib/research/research.test.ts`, `filters.test.ts`: stats, hit rates, samples, the 22 filters and their URL form
- `src/lib/research/view.test.ts`: what the player page shows for a given stat, sample and set of filters
- `src/lib/research/leaders.test.ts`: leader selection, and that a leader's numbers match the player's page
- `src/lib/research/standOuts/*.test.ts`: what each page calls good or bad, the limits, and that small samples and missing data are never called out
- `src/data/repository.test.ts`: that the mock data is complete and consistent

There are no browser tests yet. Playwright is the planned tool.

## Not in this project yet

- Database, API, sign-in, payments and live data feeds
- App manifest and service worker (the installable, offline part of the PWA)
- Leagues other than the NBA
- Licensed images: team logos and headshots load from NBA.com, which is fine for development and **not licensed for a public launch**
