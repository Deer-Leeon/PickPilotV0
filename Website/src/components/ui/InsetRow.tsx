import type { LiHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const DENSITIES = {
  compact: "p-2.5",
  regular: "p-3",
  roomy: "p-3.5",
} as const;

const LAYOUTS = {
  /** Content at one end, value or action at the other. */
  row: "flex items-center justify-between gap-3",
  /** Children stacked: a text line above a bar, for example. */
  stack: "space-y-1.5",
} as const;

interface InsetRowProps extends LiHTMLAttributes<HTMLLIElement> {
  density?: keyof typeof DENSITIES;
  layout?: keyof typeof LAYOUTS;
}

/** A darker rounded row that sits on a card. Its shade alone sets it apart. Use inside a list. */
export function InsetRow({ density = "roomy", layout = "row", className, ...props }: InsetRowProps) {
  return <li className={cn("rounded-xl bg-inset", LAYOUTS[layout], DENSITIES[density], className)} {...props} />;
}
