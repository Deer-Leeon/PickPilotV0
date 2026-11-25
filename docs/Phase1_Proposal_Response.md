# PickPilot Phase 1 Proposal

Prepared for Clark Williams, PickPilot LLC · November 2026

Thank you for the blueprint and for the clear Phase 1 boundary. This proposal covers Phase 1 as you defined it: the **Games** and **Pilot** tabs, plus the shared functionality needed to launch and operate them. Players, News and Community are treated as future phases. I have flagged every place where the blueprint conflicts with that boundary or needs a decision (section 6), along with a few recommendations that simplify the first build without weakening the core experience. Each recommendation is labeled so you can accept or decline it.

---

## 1. Development scope and cost

### Recommended Phase 1 definition

- **Tabs:** Games (home, research slip, basketball matchup page) and Pilot (discovery, Ask Pilot, player detail).
- **League at launch: NBA.** *Recommendation.* The blueprint's working launch set is six leagues. Launching with all six in May is not realistic at this budget, and it isn't useful either: NFL and college football are out of season in May. The NBA is live throughout the build, so every feature is tested on real games, and launch lands during the playoffs. The other leagues are priced as fixed add-ons, timed to their seasons. WNBA is the natural first addition in June.
- **Platform:** responsive web app (desktop, tablet, phone), installable on phones, with an iOS app possible later on the same foundation.

### Fixed price: $44,000

| Area | What is delivered | Price |
| --- | --- | --- |
| Discovery and data validation | Coverage matrix mapping every Phase 1 requirement to its data source; provider testing; projection/rating source decision; settled open decisions | $2,000 |
| Design (UI/UX) | Design system (type, color, components) built on the blueprint palette; high-fidelity desktop and mobile screens for every Phase 1 view and state; clickable prototype | $7,000 |
| Shared foundation | Data pipeline and NBA ingestion; one calculation engine for hit rates, samples and filters; API; app shell with sport, date and sportsbook selection; responsive layouts; installable web app | $9,500 |
| Accounts and settings | Sign-up and sign-in, saved sportsbook and preference settings, account page | $1,200 |
| Subscriptions and payments | Stripe checkout and billing portal, free versus paid access rules, Ask Pilot allowances by plan | $1,800 |
| Administration | Internal admin: user and subscription lookup, data-feed health, AI usage and cost, ability to hide a pick or refresh an AI Overview | $1,500 |
| **Games tab** | Home slate with best price among selected books; research slip (samples, filters, game log, correlation, sportsbook comparison, sharing, saved drafts); basketball matchup page (AI Overview, Odds, Matchup, Players, Usage Share, Injuries and rest, Game Lines) | $9,500 |
| **Pilot tab** | Discovery grid (Trending, Top Rated, filters); player detail (projection, rating, reasons, current trends); Ask Pilot (grounded answers, streaming, Stop, follow-ups, usage limits); all supporting states | $7,500 |
| QA, launch hardening and launch | Accessibility, performance and load testing, security review, analytics, production launch | $2,500 |
| Project management and demos | Weekly demos and written updates, milestone reviews, documentation and handover | $1,500 |
| **Total** | | **$44,000** |

### What is included, excluded, optional, or dependent on discovery

**Included:** everything in the table above, every loading, empty, error, stale and "Unavailable" state the blueprint specifies for these screens, mobile layouts for all Phase 1 views, and 30 days of post-launch bug fixes.

**Excluded:**
- Players, News and Community tabs (future phases).
- Native iOS or Android apps.
- Third-party fees: data, hosting, AI usage and payments (section 4). These are paid directly by PickPilot LLC.
- Legal work: terms of service, privacy policy, responsible-gambling language, sportsbook and affiliate compliance. These are for your attorney; I implement whatever is provided.
- Logo and brand identity creation, marketing site, written content beyond interface text.

**Optional add-ons (fixed prices, on request):**

| Add-on | Price | Notes |
| --- | --- | --- |
| WNBA (Games and Pilot) | $3,500 | Reuses the basketball framework; recommended for June |
| MLB (Games and Pilot) | $8,000 | Batting order, pitcher comparison, ballpark and weather panel |
| NFL (Games and Pilot) | $8,500 | Football modules and weather; recommended for the September kickoff |
| College football (Games and Pilot) | $4,500 | Reuses NFL components |
| College basketball (Games and Pilot) | $4,000 | Reuses basketball components; thinner data (see section 3) |
| Cross-device saved slips and multiple named slips | $2,000 | The blueprint lists this as separate scope |
| Saved Ask Pilot history across devices | $1,500 | Phase 1 keeps one conversation per browser session, as specified |

**Dependent on discovery** (resolved in the first two weeks, before any fixed commitment depends on it):
- **Projection and rating source for Pilot.** The blueprint requires an agreed source or method. The fixed price assumes licensed projections from a data provider plus a documented rating method agreed with you in discovery. Building a custom predictive model is not included; I would quote it separately if you want one.
- **Complete-slip and same-game pricing** (RS08). No affordable provider supplies this. Phase 1 shows individual prices and labels the complete quote as unavailable, exactly as the blueprint allows. A specialist feed can be added later.
- **Tracking-based stats** such as potential assists and rebound chances. The blueprint marks these "when licensed". They are omitted or shown as unavailable unless an enterprise feed is licensed.

### Pricing model, changes and overruns

- **Fixed price, paid by milestone** (section 2). If my estimate is wrong, that is my cost, not yours.
- **Scope changes:** any new or changed requirement gets a written estimate of cost and schedule impact. Nothing is built until you approve it. Small changes can be swapped against items of similar size at no cost.
- **What can move the price or dates:** only approved changes, data gaps found in discovery (each comes with options and costs before you decide), and delays in decisions, feedback or vendor accounts on PickPilot's side.

---

## 2. Timeline and team

### Start and duration

- **Design trial:** can start the week of November 23.
- **Full project:** can start immediately after signing. Phase 1 takes about **24 weeks** from kickoff. With a kickoff in early December, **public launch is the week of May 17, 2027**.

### Milestones and payments

Target dates assume a kickoff on December 7, 2026. If kickoff moves, every date moves with it by the same amount. Each milestone is paid after you accept it against the blueprint's own acceptance checks.

| Milestone | Delivered | Target | Payment |
| --- | --- | --- | --- |
| M0 | Kickoff, discovery and coverage matrix complete; provider accounts set up; projection source decided | December 18, 2026 | $6,600 (less the design trial credit) |
| M1 | Design approved: Games, Pilot, accounts and subscriptions, desktop and mobile | January 15, 2027 | $6,600 |
| M2 | Foundation live: today's NBA games with best prices, accounts, installable, on a private link | January 29, 2027 | $6,600 |
| M3 | Games tab complete: slip, sportsbook comparison and full matchup page | March 12, 2027 | $8,800 |
| M4 | Pilot tab, subscriptions and admin complete; private beta opens | April 23, 2027 | $8,800 |
| M5 | Public launch, followed by 30 days of bug-fix coverage | Week of May 17, 2027 | $6,600 |
| | | **Total** | **$44,000** |

### Dependencies that could affect delivery

- Signed agreements with data providers (RotoWire and the image license need written quotes).
- The projection and rating decision for Pilot (by M0).
- Design feedback within 5 business days at each review.
- Free versus paid access rules and pricing tiers (by M1).
- Stripe account approval for PickPilot LLC (section 3).
- Legal copy from your attorney before launch.

### Team

You work directly with me. I personally handle design, development, testing and project management, so there are no account managers or hand-offs between people and every decision has one accountable owner. No work is subcontracted. If a specialist would add value, for example an independent security test before launch, I would propose it in writing first, and it would only proceed with your approval.

### Reviews and demos

- **Weekly:** a 30-minute call with a live demo and a short written update (done, next, decisions needed).
- **Every change:** a private preview link you can open on your phone or computer.
- **Each milestone:** a formal demo and acceptance review.
- **Shared tracker:** a board showing every Phase 1 requirement and its status.

---

## 3. Sports data and third-party subscriptions

### Recommended providers for Phase 1 (NBA)

| Provider | Role | Pricing status |
| --- | --- | --- |
| **BallDontLie** | Primary: schedules, scores, box scores, play-by-play, standings, game odds, player props, sportsbook links, lineups, injuries | **Confirmed public price:** ALL-ACCESS (all leagues) $299.99/mo or $2,879.90/yr. Cheaper per-league plans exist; I will confirm whether the NBA-only plan covers odds, props and lineups. |
| **The Odds API** | Additional sportsbooks, alternate lines, backup odds feed, optional historical odds | **Confirmed public pricing:** credit plans from $30/mo; about $59/mo during the build and $119/mo after launch |
| **RotoWire** | Licensed injury news and status, expected lineups, player news, and projections for Pilot | **Estimate:** $500–1,000/mo; written quote required |
| **Licensed headshots and logos** | Player headshots (required in Pilot by the blueprint) and team logos | **Estimate:** about $2,500/yr; quote and legal review required |
| **AI model provider** | AI Overviews and Ask Pilot | Usage-based (section 4) |

The X stream and the weather feed are not needed in Phase 1. They serve the News tab and the outdoor sports, and are added with those phases.

### Feature-to-provider map

| Phase 1 feature (blueprint IDs) | Source |
| --- | --- |
| Schedule, start times, status, scores, records (GH01–GH05, GH16, BM02) | BallDontLie |
| Spread, moneyline, total and best price among selected books (GH09, BM04) | BallDontLie plus The Odds API |
| Player prop lines for slip and Pilot cards (BM08, Pilot cards) | BallDontLie plus The Odds API |
| Historical results, hit rates, H2H, Game Lines, alternate thresholds (RS03–RS06, BM11) | BallDontLie history, calculated by PickPilot |
| Player participation for With and Without filters (RS05) | BallDontLie box scores |
| Opponent ranks as of each date, pace, offensive and defensive rating, usage rate (RS05, BM06, BM09) | Calculated by PickPilot from BallDontLie data; definitions documented in discovery |
| Expected and confirmed lineups (BM05) | RotoWire (expected) and BallDontLie (confirmed) |
| Injuries, attributed news, status updates (BM10) | RotoWire, with BallDontLie as a status backup |
| Rest days and back-to-backs (BM10) | Calculated from the schedule |
| Correlation (RS07) | Calculated from historical game logs; "Unavailable" where data is insufficient |
| Sportsbook "Open at" links (RS11) | BallDontLie links for DraftKings, FanDuel, BetMGM, BetRivers and Caesars; coverage confirmed per market in discovery |
| Pilot projections and ratings | RotoWire projections (to confirm) plus a rating method agreed in discovery |
| Pilot trends: selected stat, related stat, minutes | BallDontLie game logs |
| Pilot Trending | Measured by PickPilot (deduplicated 24-hour opens) |
| AI Overview and Ask Pilot evidence | PickPilot's own data, with RotoWire attribution for news |

### Blueprint features these providers do not support

| Feature | Status | What it would take |
| --- | --- | --- |
| Complete-slip and same-game pricing (RS08) | Not supported | A specialist odds feed (for example OpticOdds), quote-only; Phase 1 labels it unavailable as the blueprint allows |
| Potential assists, rebound chances and other tracking stats (Pilot trend mappings) | Not supported | An enterprise tracking feed; omitted or shown as unavailable |
| HOF-style matchup grades (BM07) | No source | Only if a defined metric and source are agreed; not fabricated |
| Player prop history from before our feed starts | Limited | BallDontLie does not keep a historical prop archive, so PickPilot stores its own from day one. The Odds API has historical props since May 2023 if needed. |
| College basketball props, injuries and lineups (future add-on) | Not in BallDontLie | RotoWire covers injuries; props come from The Odds API where books offer them |

### Setup and recurring costs

- **Setup:** no setup fees from the recommended providers. The only upfront costs are yearly prepayments: BallDontLie $2,880 if billed yearly (saves $720 compared with monthly), the image license (estimate), and a domain (about $20/yr).
- **Recurring:** see section 4.

### Permissions to confirm before launch

| Item | What to confirm |
| --- | --- |
| BallDontLie | Commercial display in a paid product (permitted on paid plans; resale of raw data is not); storing and caching history; use of data in AI-generated summaries |
| The Odds API | Public commercial display of odds, storage of history, attribution requirements |
| RotoWire | Display rights for news text, required attribution and links, use in AI summaries, how long news can be stored, per-league pricing |
| Player headshots and team logos | A license for commercial use. The images in the blueprint mockups (NBA.com, ESPN) are not licensed for PickPilot. |
| Sportsbook names, logos and links | Trademark permission or affiliate-program terms; state rules on promoting sportsbooks (attorney) |
| AI provider | Terms for processing licensed data and for data retention |
| Stripe | Account approval. Stripe's US restricted list covers sports forecasting "with a monetary or material prize". A research subscription without prizes should qualify, but approval must be confirmed at onboarding, and any future Community contests with prizes would need review. |
| Responsible gambling | Age and location disclaimers and help resources (attorney) |

---

## 4. Ongoing operating costs and support

All accounts are in PickPilot LLC's name and billed directly to you, without markup.

### Before launch (November 2026 to May 2027): about $8,900

| Item | Amount | Basis |
| --- | --- | --- |
| BallDontLie ALL-ACCESS, yearly | $2,880 | Confirmed public price; a per-league plan may cost less (to confirm) |
| The Odds API | $355 | About $59/mo, December to May |
| RotoWire | $1,500 | Estimate, April and May only |
| Headshot and logo license | $2,500 | Estimate, yearly |
| Hosting, database, worker, cache, image storage, domain | $710 | Small plans while building |
| AI usage | $950 | About $50/mo building, about $250/mo during the April beta |
| Monitoring and email | $30 | Free tiers until launch |

### After launch: about $1,900–2,800 per month

| Item | Per month |
| --- | --- |
| BallDontLie (yearly plan, monthly equivalent) | $240 |
| The Odds API | $119 |
| RotoWire (estimate) | $750 |
| Headshot and logo license (monthly equivalent, estimate) | $210 |
| Hosting and servers (Vercel, Supabase, Railway, Upstash, Cloudflare) | $180–430 |
| AI usage, capped by plan allowances | $300–1,000 |
| Monitoring and email (Sentry, Better Stack, PostHog, Resend, Langfuse) | $70 |
| Payments | Stripe's standard fees per transaction, no monthly fee |
| **Total** | **about $1,900–2,800** |

**Usage assumptions:** up to about 10,000 monthly users at beta scale and a few percent of them paying. Ask Pilot runs under daily allowances by plan. AI Overviews are generated per game rather than per user. Odds refresh every 30–60 seconds for games starting within 36 hours.

**As traffic grows:** the architecture prepares shared data once and serves it through a global cache, so costs grow much more slowly than users.

| Scale | Estimated monthly cost |
| --- | --- |
| 10,000 monthly users | about $1.9k–2.8k |
| 100,000 monthly users | about $3k–7.5k |
| 1,000,000 monthly users | about $15k–50k, mostly enterprise data contracts and larger plans |

Each additional league adds roughly $100–300/mo (more odds credits, and weather for outdoor sports). Adding the News tab adds the X stream at about $150–250/mo.

### Ways to reduce pre-launch costs

- **Start RotoWire after launch.** BallDontLie injuries cover status in the meantime. Saves about $1,500 before launch, but Pilot projections would then need another source.
- **Start on BallDontLie's NBA-only plan,** if it covers the needed features, and upgrade when other leagues are added.

### Post-launch support

- **30 days of bug fixes after launch,** included in the fixed price.
- **Optional support retainer: $2,000/mo** for up to 30 hours of monitoring, data-feed fixes, provider changes and small improvements. Critical issues get a same-day response, and everything else is answered the next business day. Additional work is $60/hr or fixed-price quoted.
- **Monitoring from day one:** a heartbeat on every data feed, error tracking, and alerts. Users see honest "updates delayed" states if a provider fails.

---

## 5. Technical approach and handover

### Technology

| Layer | Choice | Why it fits PickPilot |
| --- | --- | --- |
| Web app | Next.js, React, Tailwind CSS, installable web app | Fast first loads, pages that rank in search, one codebase for desktop and phone |
| Language | TypeScript throughout | One language for web, server and data engine, which keeps calculations identical everywhere |
| Database and accounts | Supabase (Postgres and Auth) | Industry-standard database with backups and secure sign-in |
| Data engine | Always-on worker on Railway | Pulls every feed on a schedule, prepares shared data and holds live connections |
| Cache and limits | Upstash Redis | Live odds boards, Ask Pilot allowances and Trending counts |
| Hosting and CDN | Vercel | Global delivery, a preview link for every change, one-click rollback |
| Images | Cloudflare R2 | Headshots and logos with no download fees |
| Payments | Stripe | Subscriptions, billing portal and receipts |
| AI | Vercel AI SDK with tool-based grounding, Langfuse | Answers built only from PickPilot's data, with cost and quality tracked per answer |
| Monitoring | Sentry, Better Stack, PostHog | Errors, feed health, analytics and safe feature releases |

### Fast charts and filters

Data that is the same for every user, such as the odds board, game logs and matchup modules, is prepared once by the data engine and served from a global cache. When a user opens a matchup or adds a selection, their browser receives a compact game-log file and computes hit rates, samples, filters and correlation instantly on the device. Changing a filter or threshold is immediate and puts no load on the servers. Charts are drawn as lightweight vector graphics, and long lists render only what is on screen.

### Reliable data updates

The worker refreshes each feed on its own schedule: odds every 30–60 seconds near game time, injuries every 1–2 minutes on game days, and box scores as each game ends. Every update is timestamped. If a feed stops, screens keep the last good data with a stale label, and I am alerted. Jobs retry automatically and never duplicate data. Every blueprint calculation rule, such as pushes leaving the denominator and DNPs never counting as zeros, is an automated test that runs before any release.

### Expansion into the remaining tabs

One shared calculation engine and one data model serve every tab. League differences live in configuration rather than duplicated code. Players, News and Community will reuse the same data, components and design system. Adding a league means adding its data mapping and its sport-specific modules, not rebuilding the product.

### Ownership and access

- **Source code:** in a GitHub organization owned by PickPilot LLC from day one. All work product is assigned to PickPilot LLC upon payment of each milestone.
- **Design files:** in a Figma team owned by PickPilot LLC, or transferred at each milestone.
- **Infrastructure and third-party accounts:** created in PickPilot LLC's name (hosting, database, payments, data providers, AI, monitoring), with me as an invited team member. You hold the owner roles and billing.
- **Handover:** technical documentation, a runbook for common operations, environment setup notes and a walkthrough session. My access is removed whenever you choose.

---

## 6. Blueprint items that need clarification for Phase 1

| Item | Issue | Recommendation |
| --- | --- | --- |
| Links into the Players tab | Pilot's "View full research" and player names in the Games matchup open the Players tab, which is outside Phase 1 | Point them to the matchup page's expanded player research (BM08) in Phase 1, then switch to the Players tab when it ships |
| Pilot reuses "existing Players data and components" | The Players workspace is not built in Phase 1 | Build the shared player game-log data and trend components in Phase 1, so the Players tab reuses them later |
| Launch leagues | The blueprint lists six launch leagues | NBA at launch, then add-ons timed to each season |
| Projection and rating source | Unresolved in the blueprint | Decide in discovery (licensed projections plus an agreed rating method) |
| Headshots across all six leagues | Required in Pilot by the blueprint | License for the NBA at launch, expanding with each league |
| Free, paid and anonymous access | Open decision (Games section 7) | Settle before design approval |
| Complete-slip pricing | Needs a specialist feed | Phase 1 uses individual prices with the "complete quote unavailable" state |

### Questions for you

1. Which leagues must be live on launch day? Is NBA at launch with WNBA in June acceptable?
2. Do you have a preferred projection provider, or a view on how the Pilot rating should be defined?
3. What should anonymous, free and paid users each be able to see and do? What subscription prices and Ask Pilot allowances do you have in mind?
4. What does your team need to do day to day in the admin area?
5. Is the PickPilot name and logo final, and are there brand assets beyond the blueprint palette?
6. Which sportsbooks should be supported at launch, and in which states do you plan to operate?
7. Have you engaged an attorney for terms, privacy, responsible-gambling and sportsbook compliance?
8. How firm is the late-May launch date? Would an earlier private beta in April be useful for marketing?

---

## 7. Paid design trial

**Fixed price: $2,000.** It is credited in full against the project if PickPilot is selected.

**Timeline:** 10 business days from the kickoff call.

| Day | Step |
| --- | --- |
| 1 | Kickoff call to confirm references (HOF, Props.cash, Outlier, JuiceReel) and goals |
| 4 | First direction for the Games home |
| 7 | Complete screen set |
| 10 | Final files after two revision rounds |

**Screens:**
1. Games home: slate with game cards and best prices, populated research slip (desktop).
2. Games home on mobile, including the research slip.
3. Basketball matchup page: header, section navigation, AI Overview, Odds and Matchup sections (desktop).
4. Research slip expanded: game log, filters and sportsbook comparison (desktop).
5. Pilot home: Ask Pilot input and four-column discovery grid (desktop).
6. Pilot player detail: projection, rating, reasons and current trends (desktop).
7. Pilot player detail on mobile.
8. One key state, such as missing odds or projection unavailable.

**Deliverables:**
- High-fidelity designs in Figma.
- A starter design system: colors, type scale, spacing, and the core components (game card, odds button, slip row, pick card, chips, filters).
- A clickable prototype connecting the screens.
- A short design rationale.

**Revisions:** two rounds of consolidated feedback are included.

The trial is designed to show exactly what you said matters most: a cleaner, more refined product than the reference mockups, while respecting the blueprint's palette and HOF-based layout.

---

I look forward to discussing this on our call next week. If it helps before then, I am happy to answer any questions in writing.
