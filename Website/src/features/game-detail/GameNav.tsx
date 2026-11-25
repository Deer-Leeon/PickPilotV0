"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { useRecentStore } from "@/components/shell/recentStore";
import { LinkTabs } from "@/components/ui/Tabs";
import { cn } from "@/lib/cn";
import { GAME_SECTIONS, GAME_SECTION_LABELS, routes, type GameSection } from "@/lib/routes";

/** The tab the user is on, read from the URL segment below the game layout. */
function useGameSection(): GameSection {
  const segment = useSelectedLayoutSegment();
  return GAME_SECTIONS.includes(segment as GameSection) ? (segment as GameSection) : "matchup";
}

interface GameSwitcherProps {
  league: string;
  activeGameId: string;
  games: readonly { id: string; label: string }[];
}

/** Links for jumping to another game on the slate, staying on the same tab. Only the current game is a pill. */
export function GameSwitcher({ league, activeGameId, games }: GameSwitcherProps) {
  const section = useGameSection();
  return (
    <nav aria-label="Games on this slate" className="no-scrollbar flex select-none items-center gap-0.5 overflow-x-auto">
      {games.map((game) => {
        const active = game.id === activeGameId;
        return (
          <Link
            key={game.id}
            href={routes.game(league, game.id, section)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1.5 font-mono text-xs transition",
              active ? "bg-white font-bold text-black" : "text-fg-muted hover:bg-white/[0.07] hover:text-fg",
            )}
          >
            {game.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Matchup / Players / Game lines / Injuries. Each tab is its own page. */
export function SectionTabs({ league, gameId }: { league: string; gameId: string }) {
  const section = useGameSection();
  return (
    <LinkTabs
      label="Game sections"
      tabs={GAME_SECTIONS.map((id) => ({
        href: routes.game(league, gameId, id),
        label: GAME_SECTION_LABELS[id],
        active: id === section,
      }))}
    />
  );
}

/** Remembers the game so the "Matchup" nav item can return to it. Renders nothing. */
export function TrackRecentGame({ gameId }: { gameId: string }) {
  const setLastGameId = useRecentStore((state) => state.setLastGameId);
  useEffect(() => {
    setLastGameId(gameId);
  }, [gameId, setLastGameId]);
  return null;
}
