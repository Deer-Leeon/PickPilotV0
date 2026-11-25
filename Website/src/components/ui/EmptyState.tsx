import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  /** A link or button that gets the user moving again. */
  action?: ReactNode;
  className?: string;
}

/** Shown wherever a list or module has nothing to display. */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-1.5 px-6 py-10 text-center", className)}>
      <p className="text-sm font-semibold text-fg">{title}</p>
      {description ? <p className="max-w-sm text-xs leading-relaxed text-fg-muted">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
