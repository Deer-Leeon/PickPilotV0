import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { DEFAULT_LEAGUE, routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-2 px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-wider text-fg-subtle">404</p>
      <h1 className="text-lg font-bold tracking-tight text-fg">This page does not exist</h1>
      <p className="max-w-sm text-xs leading-relaxed text-fg-muted">
        The link may be out of date, or the game or player is not on the current slate.
      </p>
      <Link href={routes.games(DEFAULT_LEAGUE)} className={buttonClass("primary", "md", "mt-4")}>
        Go to tonight&apos;s games
      </Link>
    </div>
  );
}
