import { Suspense } from "react";
import type { Metadata } from "next";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { getSlate, getSlateDates } from "@/data/repository";
import { GamesBoard, GamesBoardFallback } from "@/features/games/GamesBoard";

export const metadata: Metadata = { title: "Upcoming Games" };

type Props = PageProps<"/[league]/games">;

export default function GamesPage({ params }: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Slate params={params} />
    </Suspense>
  );
}

async function Slate({ params }: Pick<Props, "params">) {
  const { league } = await params;
  const dates = await getSlateDates(league);
  const entries = await Promise.all(dates.map(async (entry) => [entry.date, await getSlate(league, entry.date)] as const));
  const slates = Object.fromEntries(entries);

  // The selected date lives in the URL, which only the browser knows. Until it
  // is read, the fallback shows today's board, so the built page is complete.
  return (
    <Suspense fallback={<GamesBoardFallback league={league} dates={dates} slates={slates} />}>
      <GamesBoard league={league} dates={dates} slates={slates} />
    </Suspense>
  );
}
