"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { locateStandOut } from "@/lib/flash";
import type { StandOut, StandOutTone } from "@/lib/research/standOuts/standOut";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "./Skeleton";

const GROUPS: readonly { tone: StandOutTone; label: string; empty: string }[] = [
  { tone: "good", label: "Good", empty: "Nothing good stands out." },
  { tone: "bad", label: "Bad", empty: "Nothing bad stands out." },
];

/** The figure carries the tone. The group label does too, so a row without a figure still reads. */
const TONE_MARK: Record<StandOutTone, string> = {
  good: "bg-good/15 text-good-fg",
  bad: "bg-bad/15 text-bad-fg",
};

/** Rows arrive one after another, this far apart. */
const STAGGER_MS = 45;

/** An arrow that points up for good and down for bad, used where a finding has no figure. */
function ToneArrow({ tone, className }: { tone: StandOutTone; className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={tone === "good" ? "M6 10V2M2.5 5.5 6 2l3.5 3.5" : "M6 2v8M2.5 6.5 6 10l3.5-3.5"} />
    </svg>
  );
}

function StandOutRow({ item, order }: { item: StandOut; order: number }) {
  const style: CSSProperties = { animationDelay: `${order * STAGGER_MS}ms` };
  return (
    <li className="animate-rise-in" style={style}>
      <div className="flex items-stretch rounded-xl bg-raised transition hover:bg-active">
        <button
          type="button"
          onClick={() => locateStandOut(item.targets, item.tone)}
          className="flex min-w-0 flex-1 items-center gap-3 p-2.5 text-left"
        >
          <span className={cn("flex h-10 w-14 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold", TONE_MARK[item.tone])}>
            {item.figure ?? <ToneArrow tone={item.tone} className="size-3.5" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-fg">{item.subject}</span>
            <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-fg-muted">{item.text}</span>
          </span>
        </button>
        {/* The row itself shows the spot on this page. The arrow is the way to go and research it. */}
        {item.href ? (
          <Link
            href={item.href}
            aria-label={`Research ${item.subject}`}
            className="flex shrink-0 items-center pr-3 text-fg-subtle transition hover:text-fg"
          >
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
    </li>
  );
}

interface StandOutListProps {
  /** Finished stand-outs, strongest first. The list only groups and draws them. */
  items: readonly StandOut[];
  className?: string;
}

/** What stands out on a page, in two groups: good, then bad. Selecting one lights it up on the page. */
export function StandOutList({ items, className }: StandOutListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        className={cn("flex-1", className)}
        title="Nothing stands out here"
        description="Nothing on this page is far enough from average to call good or bad."
      />
    );
  }

  const good = items.filter((item) => item.tone === "good");
  return (
    <div className={cn("space-y-5 p-4", className)}>
      {GROUPS.map(({ tone, label, empty }) => {
        const group = tone === "good" ? good : items.filter((item) => item.tone === "bad");
        // The bad rows carry on where the good ones stopped, so the whole list arrives top to bottom.
        const first = tone === "good" ? 0 : good.length;
        return (
          <section key={tone} aria-label={label}>
            <h3 className="mb-2.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
              <span className={cn("flex items-center gap-1 rounded-full py-1 pl-1.5 pr-2 font-bold", TONE_MARK[tone])}>
                <ToneArrow tone={tone} className="size-2.5" />
                {label}
              </span>
              <span className="text-fg-subtle">{group.length}</span>
            </h3>
            {group.length === 0 ? (
              <p className="text-[11px] text-fg-subtle">{empty}</p>
            ) : (
              <ul className="space-y-2">
                {group.map((item, index) => (
                  <StandOutRow key={item.id} item={item} order={first + index} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

/** Stand-in for the list while a page's data is on the way. */
export function StandOutListSkeleton() {
  return (
    <div role="status" aria-label="Loading stand-outs" className="space-y-5 p-4">
      {[0, 1].map((group) => (
        <div key={group} className="space-y-2">
          <Skeleton className="mb-2.5 h-5 w-16 rounded-full" />
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-3 rounded-xl bg-raised p-2.5">
              <Skeleton className="h-10 w-14 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-2.5 w-full" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
