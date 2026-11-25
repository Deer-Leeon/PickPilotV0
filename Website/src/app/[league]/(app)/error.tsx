"use client";

import { PageColumn } from "@/components/shell/PageColumn";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

/** Catches anything a page throws, and keeps the navigation usable around it. */
export default function LeagueError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PageColumn>
      <EmptyState
        className="flex-1"
        title="Something went wrong"
        description="This page could not be loaded. Your research slip is safe."
        action={
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
        }
      />
    </PageColumn>
  );
}
