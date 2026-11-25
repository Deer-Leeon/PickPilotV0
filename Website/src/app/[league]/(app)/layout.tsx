import { Suspense, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { getLeague, getNavIndex } from "@/data/repository";
import { DEFAULT_LEAGUE } from "@/lib/routes";

/** Leagues that are built ahead of time. Add a league here when it has data. */
export function generateStaticParams() {
  return [{ league: DEFAULT_LEAGUE }];
}

type Params = Promise<Record<string, string>>;

/**
 * `standOuts` is the `@standouts` parallel route: for every page URL it holds
 * a second route that loads what stands out on that page, and the shell shows
 * it in the side panel.
 */
export default function LeagueLayout({
  children,
  standouts,
  params,
}: {
  children: ReactNode;
  standouts: ReactNode;
  params: Params;
}) {
  return (
    <Suspense fallback={<div className="h-dvh bg-canvas" />}>
      <LeagueShell params={params} standOuts={standouts}>
        {children}
      </LeagueShell>
    </Suspense>
  );
}

async function LeagueShell({ params, standOuts, children }: { params: Params; standOuts: ReactNode; children: ReactNode }) {
  const { league: leagueId } = await params;
  const league = await getLeague(leagueId);
  if (!league) notFound();
  const nav = await getNavIndex(league.id);

  return (
    <AppShell league={league} nav={nav} standOuts={standOuts}>
      {children}
    </AppShell>
  );
}
