"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavIndex } from "@/data/types";
import { GAME_SECTION_LABELS, routes, type GameSection } from "@/lib/routes";

interface Crumb {
  label: string;
  href?: string;
  mono?: boolean;
}

function crumbsFor(pathname: string, league: string, leagueName: string, nav: NavIndex): Crumb[] {
  const [, , section, detail, sub] = pathname.split("/");
  const games: Crumb = { label: "Games", href: routes.games(league) };

  if (section === "games" && detail) {
    const game = nav.games.find((item) => item.id === detail);
    if (!game) return [games];
    const sectionLabel = GAME_SECTION_LABELS[sub as GameSection] ?? GAME_SECTION_LABELS.matchup;
    return [games, { label: game.label, mono: true }, { label: sectionLabel }];
  }
  if (section === "players" && detail) {
    const player = nav.players.find((item) => item.id === detail);
    const game = nav.games.find((item) => item.id === player?.gameId);
    if (!player) return [games];
    return [
      games,
      ...(game ? [{ label: game.label, href: routes.game(league, game.id), mono: true }] : []),
      { label: player.name },
    ];
  }
  if (section === "players") return [games, { label: "Player Props" }];
  if (section === "leaders") return [{ label: "Hit-Rate Leaders" }];
  const count = nav.todayGameCount;
  return [{ label: `All ${count} ${leagueName} ${count === 1 ? "Matchup" : "Matchups"}` }];
}

interface BreadcrumbProps {
  league: string;
  leagueName: string;
  nav: NavIndex;
}

/** Where the user is, in the top bar. The last crumb is the current page. */
export function Breadcrumb({ league, leagueName, nav }: BreadcrumbProps) {
  const pathname = usePathname();
  const crumbs = crumbsFor(pathname, league, leagueName, nav);

  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 border-l border-border pl-3 text-xs text-fg-muted md:flex">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        const font = crumb.mono ? "font-mono" : "";
        return (
          <Fragment key={`${crumb.label}-${index}`}>
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {crumb.href && !isLast ? (
              <Link href={crumb.href} className={`whitespace-nowrap transition hover:text-fg ${font}`}>
                {crumb.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? "page" : undefined}
                className={`truncate ${font} ${isLast ? "font-semibold text-fg" : "text-fg-soft"}`}
              >
                {crumb.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
