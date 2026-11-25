"use client";

import { cn } from "@/lib/cn";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  /** Accessible name for the group, e.g. "Sample window". */
  label: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** "mono" for numeric or code-like labels (L5, '26-'27), "sans" for words. */
  font?: "mono" | "sans";
  size?: "sm" | "md";
  className?: string;
}

/** A small set of mutually exclusive choices, shown as one darker pill with the active choice filled. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  font = "mono",
  size = "sm",
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex shrink-0 select-none items-center rounded-lg bg-inset p-[5px]", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "whitespace-nowrap rounded-md transition",
              size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
              font === "mono" ? "font-mono" : "font-medium",
              active ? "bg-active font-semibold text-fg shadow-sm" : "text-fg-muted hover:text-fg-soft",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
