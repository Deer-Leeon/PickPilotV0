import Link from "next/link";
import { PageColumn } from "@/components/shell/PageColumn";
import { buttonClass } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DEFAULT_LEAGUE, routes } from "@/lib/routes";

/** Shown inside the app frame when a game or player id is not on the slate. */
export default function LeagueNotFound() {
  return (
    <PageColumn>
      <EmptyState
        className="flex-1"
        title="Not on the slate"
        description="That game or player could not be found. It may have been moved, or the link is out of date."
        action={
          <Link href={routes.games(DEFAULT_LEAGUE)} className={buttonClass("primary")}>
            Back to tonight&apos;s games
          </Link>
        }
      />
    </PageColumn>
  );
}
