import { PageColumn } from "@/components/shell/PageColumn";
import { cn } from "@/lib/cn";

/** A pulsing placeholder block for loading states. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-white/[0.06]", className)} />;
}

/** Stand-in for a page while its data is on the way. */
export function PageSkeleton() {
  return (
    <PageColumn role="status" aria-label="Loading">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </PageColumn>
  );
}
