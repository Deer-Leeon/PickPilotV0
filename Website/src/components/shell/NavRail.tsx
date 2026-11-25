"use client";

import Link from "next/link";
import type { NavIndex } from "@/data/types";
import { useSlip } from "@/features/slip/useSlip";
import { cn } from "@/lib/cn";
import { useNavItems } from "./useNavItems";

interface NavProps {
  league: string;
  nav: NavIndex;
}

/** Desktop navigation: a narrow icon rail down the left edge. */
export function NavRail({ league, nav }: NavProps) {
  const items = useNavItems(league, nav);
  const { legs, isOpen, setOpen } = useSlip();

  return (
    <aside className="z-20 hidden w-16 shrink-0 select-none flex-col items-center justify-between border-r border-border bg-inset py-4 md:flex">
      <nav aria-label="Main" className="flex w-full flex-col items-center gap-3 px-2">
        {items.map(({ id, label, href, active, Icon }) => (
          <Link
            key={id}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex w-full flex-col items-center gap-1 rounded-xl border py-2.5 text-[10px] transition",
              active
                ? "border-border-strong bg-raised font-semibold text-fg shadow"
                : "border-transparent font-medium text-fg-muted hover:bg-white/[0.04] hover:text-fg-soft",
            )}
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="w-full px-2">
        <button
          type="button"
          onClick={() => setOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={`Research slip, ${legs.length} ${legs.length === 1 ? "pick" : "picks"}`}
          className="relative flex w-full flex-col items-center gap-1 rounded-xl border border-border bg-raised py-2 font-mono text-[10px] text-fg-muted transition hover:text-fg"
        >
          {legs.length > 0 ? <span className="absolute right-2 top-1.5 size-2 rounded-full bg-good-fg" /> : null}
          <span className="text-xs font-bold text-fg">{legs.length}</span>
          <span>Slip</span>
        </button>
      </div>
    </aside>
  );
}
