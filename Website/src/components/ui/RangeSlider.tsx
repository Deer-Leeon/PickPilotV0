"use client";

import { Slider } from "radix-ui";
import { cn } from "@/lib/cn";

interface RangeSliderProps {
  /** Accessible name, e.g. "Opponent rank range". */
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  /** Called once when the user lets go, for work that should not run on every step. */
  onCommit?: (value: [number, number]) => void;
  className?: string;
}

const thumbClass =
  "block size-4 rounded-full border-2 border-good bg-white shadow-[0_2px_6px_rgba(0,0,0,0.7)] outline-none transition focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-panel";

/**
 * A slider with two handles. The handles can be dragged or moved with the
 * arrow keys, and they stop one step apart instead of crossing.
 */
export function RangeSlider({ label, min, max, value, onChange, onCommit, className }: RangeSliderProps) {
  return (
    <Slider.Root
      min={min}
      max={max}
      step={1}
      minStepsBetweenThumbs={1}
      value={value}
      onValueChange={(next) => onChange([next[0], next[1]])}
      onValueCommit={onCommit ? (next) => onCommit([next[0], next[1]]) : undefined}
      className={cn("relative flex h-5 w-full touch-none select-none items-center", className)}
    >
      <Slider.Track className="relative h-1.5 grow rounded-full bg-active">
        <Slider.Range className="absolute h-full rounded-full bg-good" />
      </Slider.Track>
      <Slider.Thumb aria-label={`${label}: lowest`} className={thumbClass} />
      <Slider.Thumb aria-label={`${label}: highest`} className={thumbClass} />
    </Slider.Root>
  );
}
