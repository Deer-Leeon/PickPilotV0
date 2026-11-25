"use client";

import type { ComponentType, SVGProps } from "react";
import { usePathname } from "next/navigation";
import type { NavIndex } from "@/data/types";
import { useHydrated } from "@/hooks/useHydrated";
import { routes } from "@/lib/routes";
import { GamesIcon, LeadersIcon, MatchupIcon, PropsIcon } from "./icons";
import { useRecentStore } from "./recentStore";

export interface NavItem {
  id: "games" | "matchup" | "props" | "leaders";
  label: string;
  href: string;
  active: boolean;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/**
 * The four destinations shared by the desktop rail and the phone tab bar.
 * "Matchup" opens the game the user looked at last, or the first game on the slate.
 */
export function useNavItems(league: string, nav: NavIndex): NavItem[] {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const lastGameId = useRecentStore((state) => state.lastGameId);

  const [, , section, detail] = pathname.split("/");
  const onGameDetail = section === "games" && Boolean(detail);

  const remembered = hydrated && nav.games.some((game) => game.id === lastGameId) ? lastGameId : null;
  const matchupGameId = (onGameDetail ? detail : remembered) ?? nav.games[0]?.id;

  return [
    { id: "games", label: "Games", href: routes.games(league), active: section === "games" && !detail, Icon: GamesIcon },
    {
      id: "matchup",
      label: "Matchup",
      href: matchupGameId ? routes.game(league, matchupGameId) : routes.games(league),
      active: onGameDetail,
      Icon: MatchupIcon,
    },
    { id: "props", label: "Props", href: routes.players(league), active: section === "players", Icon: PropsIcon },
    { id: "leaders", label: "Leaders", href: routes.leaders(league), active: section === "leaders", Icon: LeadersIcon },
  ];
}
