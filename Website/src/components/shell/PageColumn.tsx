import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Right padding of the page area. 2.5rem to the edge of the screen while nothing
 * is docked; from xl up the side panel's card sits there, one card gap away.
 * The player page has its own layout and uses this to end where every page ends.
 */
export const PAGE_RIGHT_EDGE = "lg:pr-10 xl:pr-5";

interface PageColumnProps extends ComponentProps<"div"> {
  /** Classes for the column itself. Everything else lands on the scroll area around it. */
  columnClassName?: string;
}

/**
 * The column every page sits in. It starts at the left edge of the page area
 * and never grows past the Matchup page's width, so every screen lines up and
 * the room that is left over on the right belongs to the side panel.
 *
 * min-h-full lets a page stretch to fill a tall screen without ever clipping on a short one.
 *
 * The column is a size container. The side panel takes 20rem off the page from
 * xl up, so the screen's width no longer says how much room a page has. A
 * layout that goes side by side asks the column instead, with a container
 * variant such as `@6xl:grid-cols-2`.
 */
export function PageColumn({ children, className, columnClassName, ...props }: PageColumnProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5 lg:pl-10", PAGE_RIGHT_EDGE, className)} {...props}>
      <div className={cn("@container flex min-h-full w-full max-w-7xl flex-col gap-4 lg:gap-5", columnClassName)}>{children}</div>
    </div>
  );
}
