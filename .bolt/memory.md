# Project memory

## Product intent & audience

- NBA odds/matchup app; audience is sports bettors/analysts wanting fast, focused game-odds views.
- Core data: teams, point spreads, moneylines, totals, tip times; "Call" computed from odds (pick'em, slim spread, big favourite).
- Existing Games page uses in-memory game data (not Supabase); broadcast concept reuses same data source.

## Brand personality & voice

- Minimal, confident, no-frills. Broadcast concept strips all chrome for a full-screen focal experience.

## Visual design & UX direction

- Broadcast page: one hero matchup fills the screen — team city + nickname stacked large left/right, two-sided spread (e.g. `-4.5 / +4.5`) even larger centered, moneyline + total below in smaller type, one-line "Call" underneath.
- Rest of slate: slim bottom strip (abbreviation, spread, tip time) linking to each game's research page.
- Palette: deep charcoal background, warm off-white type, single amber accent — used only on "Call" tag and selected date.
- Avoid: rails, side panels, game cards, market columns, gradients.
- Responsive: phone-width must be checked.

## Decisions, constraints & rationale

- Stack: Next.js route groups/layouts, TypeScript, Supabase (non-broadcast pages), lint, test suite (132 tests).
- Route restructure: existing NBA pages moved into a route group inside the app-frame layout (same URLs, no visual change); broadcast page gets a shell-free layout to opt out of the frame.
- Broadcast page intentionally bypasses Supabase; reuses in-memory game data per instruction.
- Verification gate: typecheck + lint + all tests must pass before marking work done.

## Open questions & assumptions

- Visual QA pending — no browser in environment; dev server must be previewed manually.
- It's assumed in-memory game data is sufficient for the broadcast concept; Supabase integration not yet needed there.