import { Suspense } from "react";
import Link from "next/link";
import type { League, NavIndex } from "@/data/types";
import { SlipToggle } from "@/features/slip/SlipToggle";
import { routes } from "@/lib/routes";
import { Breadcrumb } from "./Breadcrumb";
import { LogoMark } from "./icons";
import { StandOutsToggle } from "./StandOutsToggle";

interface TopBarProps {
  league: League;
  nav: NavIndex;
}

/** Brand, active league, breadcrumb, and the stand-outs and slip buttons. */
export function TopBar({ league, nav }: TopBarProps) {
  return (
    <header className="z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-inset px-4">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <Link href={routes.games(league.id)} className="group flex shrink-0 select-none items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg border border-border-strong bg-raised shadow-inner transition group-hover:border-good/50">
            <LogoMark className="size-4 text-good-fg" />
          </span>
          <span className="text-base font-bold tracking-tight text-fg">PickPilot</span>
        </Link>

        <span className="flex shrink-0 select-none items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black shadow-sm">
          <span aria-hidden="true">{league.emoji}</span>
          <span>{league.name}</span>
        </span>

        {/* Client components that read the URL sit in Suspense so the rest of the shell can prerender. */}
        <Suspense fallback={null}>
          <Breadcrumb league={league.id} leagueName={league.name} nav={nav} />
        </Suspense>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* From xl up the side panel is docked and always shows the stand-outs, so the button is not needed. */}
        <StandOutsToggle className="xl:hidden" />
        <SlipToggle className="hidden md:flex" />
      </div>
    </header>
  );
}
