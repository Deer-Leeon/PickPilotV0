import { Suspense } from "react";
import type { Metadata } from "next";
import { getSlate, getSlateDates } from "@/data/repository";
import { BroadcastContainer } from "./BroadcastContainer";

export const metadata: Metadata = { title: "Games — Broadcast" };

type Props = PageProps<"/[league]/games/concepts/broadcast">;

export default function BroadcastPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="h-full bg-charcoal" />}>
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
  // is read, the fallback shows today's slate, so the built page is complete.
  return (
    <Suspense
      fallback={
        <BroadcastContainer
          league={league}
          dates={dates}
          slates={slates}
        />
      }
    >
      <BroadcastContainer league={league} dates={dates} slates={slates} />
    </Suspense>
  );
}
