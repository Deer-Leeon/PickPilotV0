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

/** Phone navigation: a tab bar along the bottom edge. */
export function BottomNav({ league, nav }: NavProps) {
  const items = useNavItems(league, nav);
  const { legs, isOpen, setOpen } = useSlip();
  const itemClass = (active: boolean) =>
    cn(
      "flex h-14 flex-1 flex-col items-center justify-center gap-1 text-[10px] transition",
      active ? "font-semibold text-fg" : "font-medium text-fg-subtle",
    );

  return (
    <nav aria-label="Main" className="z-30 flex shrink-0 select-none border-t border-border bg-inset pb-safe md:hidden">
      {items.map(({ id, label, href, active, Icon }) => (
        <Link key={id} href={href} aria-current={active ? "page" : undefined} className={itemClass(active)}>
          <Icon className="size-5" />
          <span>{label}</span>
        </Link>
      ))}
      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`Research slip, ${legs.length} ${legs.length === 1 ? "pick" : "picks"}`}
        className={itemClass(isOpen)}
      >
        <span className="relative flex h-5 min-w-5 items-center justify-center rounded-md bg-white/10 px-1 font-mono text-[11px] font-bold text-fg">
          {legs.length}
          {legs.length > 0 ? <span className="absolute -right-1 -top-1 size-2 rounded-full bg-good-fg" /> : null}
        </span>
        <span>Slip</span>
      </button>
    </nav>
  );
}
