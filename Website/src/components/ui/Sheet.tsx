"use client";

import type { ReactNode } from "react";
import { Dialog } from "radix-ui";
import { cn } from "@/lib/cn";

type Side = "right" | "left" | "bottom";

const SIDES: Record<Side, string> = {
  right: "inset-y-0 right-0 w-full max-w-sm animate-sheet-right",
  left: "inset-y-0 left-0 w-full max-w-sm animate-sheet-left",
  bottom: "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-2xl animate-sheet-up",
};

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Read by screen readers. Shown as the heading unless `header` is given. */
  title: string;
  side?: Side;
  /** Replaces the default heading row. The close button is always present. */
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * A panel that slides over the page: the research slip, the filter drawer
 * and the roster picker on phones. Focus is trapped and Escape closes it.
 */
export function Sheet({ open, onOpenChange, title, side = "right", header, children, className }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 animate-fade-in bg-black/60 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn("fixed z-50 flex flex-col bg-panel shadow-2xl outline-none", SIDES[side], className)}
        >
          {/* No edge or title line: the dimmed page and the shadow set the sheet apart. */}
          <div className="flex shrink-0 items-center justify-between gap-3 bg-card px-4 py-3">
            {header ? (
              <>
                <Dialog.Title className="sr-only">{title}</Dialog.Title>
                <div className="min-w-0 flex-1">{header}</div>
              </>
            ) : (
              <Dialog.Title className="text-xs font-bold uppercase tracking-wider text-fg">{title}</Dialog.Title>
            )}
            <Dialog.Close className="shrink-0 rounded-md px-1.5 py-1 text-xs text-fg-muted transition hover:text-fg">
              Close ×
            </Dialog.Close>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-safe">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
