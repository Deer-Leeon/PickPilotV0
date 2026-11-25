"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

const tabClass = (active: boolean) =>
  cn(
    "-mb-px select-none whitespace-nowrap border-b-2 py-2.5 text-xs transition",
    active ? "border-fg font-semibold text-fg" : "border-transparent font-medium text-fg-muted hover:text-fg-soft",
  );

interface LinkTabsProps {
  label: string;
  tabs: readonly { href: string; label: string; active: boolean }[];
  className?: string;
}

/** Underlined tabs where each tab is its own page. */
export function LinkTabs({ label, tabs, className }: LinkTabsProps) {
  return (
    <nav aria-label={label} className={cn("no-scrollbar flex items-center gap-7 overflow-x-auto", className)}>
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href} aria-current={tab.active ? "page" : undefined} className={tabClass(tab.active)}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

interface ButtonTabsProps<T extends string> {
  label: string;
  tabs: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /** Spread the tabs evenly across the full width. */
  stretch?: boolean;
}

/** Underlined tabs that switch content within a page. */
export function ButtonTabs<T extends string>({ label, tabs, value, onChange, className, stretch }: ButtonTabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className={cn("no-scrollbar flex items-center overflow-x-auto", !stretch && "gap-6", className)}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(tabClass(active), stretch && "flex-1 px-2 text-center")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
