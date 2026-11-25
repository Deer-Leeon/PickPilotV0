import { StandOutList } from "@/components/ui/StandOutList";

/**
 * Shown in the side panel for any URL that has no stand-outs route of its
 * own. Next.js needs this file: without it, a full page load of such a URL
 * would be a 404 for the whole page.
 */
export default function StandOutsDefault() {
  return <StandOutList items={[]} />;
}
