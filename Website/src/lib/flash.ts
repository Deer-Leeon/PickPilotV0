import type { StandOutTone } from "@/lib/research/standOuts/standOut";

/**
 * Showing where a stand-out lives on the page.
 *
 * A component marks what it draws with `flashKey` (see `standOuts/targets.ts`).
 * Selecting a stand-out asks the page to reveal anything that is hidden, then
 * draws a frame over the first marked element that is on screen. The frame
 * fades away on its own.
 */

export const LOCATE_STAND_OUT = "pickpilot:locate-stand-out";

/** How long to wait for a page to reveal the exact spot before falling back to a wider one. */
const REVEAL_WAIT_MS = 1000;
/** Long enough for the phone sheet to leave before the frame is drawn over the page. */
const SHEET_WAIT_MS = 320;

const TONE_COLOR: Record<StandOutTone, string> = { good: "var(--color-good)", bad: "var(--color-bad)" };

/** Room between the information and the mark, so the frame is not tight against it. */
const OUTSET = 6;
/** Square targets still get a rounded mark. */
const MIN_RADIUS = 12;
/** Long enough for the fade in, the hold and the fade out. Reduced motion skips the fades. */
const FLASH_MS = 2200;
const FLASH_REDUCED_MS = 800;

let current: { stop: () => void } | null = null;

function marked(key: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-flash="${CSS.escape(key)}"]`)];
}

/** On screen in the sense that it has a box. A scrolled-away element still counts; a hidden one does not. */
function isLaidOut(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width >= 1 && rect.height >= 1;
}

/** A box clipped to the viewport and to every scroll area around the element, so the mark cannot cover the top bar. */
function clipToView(element: HTMLElement, box: { top: number; left: number; right: number; bottom: number }): DOMRect | null {
  let top = Math.max(box.top, 0);
  let left = Math.max(box.left, 0);
  let right = Math.min(box.right, window.innerWidth);
  let bottom = Math.min(box.bottom, window.innerHeight);

  let parent = element.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    if (/(auto|scroll|hidden)/.test(style.overflow + style.overflowY + style.overflowX)) {
      const bounds = parent.getBoundingClientRect();
      top = Math.max(top, bounds.top);
      left = Math.max(left, bounds.left);
      right = Math.min(right, bounds.right);
      bottom = Math.min(bottom, bounds.bottom);
    }
    parent = parent.parentElement;
  }
  if (right - left < 2 || bottom - top < 2) return null;
  return new DOMRect(left, top, right - left, bottom - top);
}

/** The part of an element that is actually on screen. */
function visibleRect(element: HTMLElement): DOMRect | null {
  const rect = element.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;
  return clipToView(element, rect);
}

/** The mark: the element, plus a little room around it, then clipped back to the scroll area. */
function frameRect(element: HTMLElement): DOMRect | null {
  const rect = element.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;
  return clipToView(element, {
    top: rect.top - OUTSET,
    left: rect.left - OUTSET,
    right: rect.right + OUTSET,
    bottom: rect.bottom + OUTSET,
  });
}

function cornerRadius(element: HTMLElement): string {
  const parsed = Number.parseFloat(getComputedStyle(element).borderRadius);
  const radius = Number.isFinite(parsed) ? Math.max(parsed, MIN_RADIUS) : MIN_RADIUS;
  return `${radius}px`;
}

/** The first key that has an element drawn on the page, even if it sits below the fold. */
function findShown(keys: readonly string[]): HTMLElement | null {
  for (const key of keys) {
    const shown = marked(key).find(isLaidOut);
    if (shown) return shown;
  }
  return null;
}

/** A wide row clipped sideways is still in view. Only scrolling it off the top or bottom counts as out of view. */
function inView(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const visible = visibleRect(element);
  if (!visible || rect.height < 1) return false;
  return visible.height / rect.height > 0.6;
}

/** Draws the frame over an element. It fades in, holds, then fades out. A later call replaces it. */
function flashElement(element: HTMLElement, tone: StandOutTone) {
  current?.stop();
  if (!inView(element)) element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

  const frame = document.createElement("div");
  const color = TONE_COLOR[tone];
  frame.setAttribute("aria-hidden", "true");
  frame.style.position = "fixed";
  frame.style.zIndex = "70";
  frame.style.pointerEvents = "none";
  frame.style.boxShadow = `0 0 0 1.5px ${color}`;
  frame.style.background = `color-mix(in srgb, ${color} 12%, transparent)`;
  document.body.appendChild(frame);

  // Writing a style on every frame restarts the fade, so the box is only moved when the target actually moves.
  let placed = "";
  let shown = "";
  const place = () => {
    const box = frameRect(element);
    const visibility = box ? "visible" : "hidden";
    if (visibility !== shown) {
      shown = visibility;
      frame.style.visibility = visibility;
    }
    if (!box) return;
    // Whole pixels: a fraction of a pixel of movement would rewrite the box and restart the fade.
    const next = [box.left, box.top, box.width, box.height].map((value) => Math.round(value)).join("|");
    if (next === placed) return;
    placed = next;
    const [left, top, width, height] = next.split("|");
    frame.style.left = `${left}px`;
    frame.style.top = `${top}px`;
    frame.style.width = `${width}px`;
    frame.style.height = `${height}px`;
    frame.style.borderRadius = cornerRadius(element);
  };
  place();

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    // Fades live here rather than in a stylesheet class: rewriting the box must not restart them.
    frame.animate(
      [
        { opacity: 0, easing: "ease-in-out" },
        { opacity: 1, offset: 0.18, easing: "linear" },
        { opacity: 1, offset: 0.62, easing: "ease-in-out" },
        { opacity: 0, offset: 1 },
      ],
      { duration: FLASH_MS, fill: "forwards" },
    );
  }

  let raf = 0;
  const track = () => {
    place();
    raf = requestAnimationFrame(track);
  };
  raf = requestAnimationFrame(track);

  const stop = () => {
    cancelAnimationFrame(raf);
    frame.remove();
    if (current?.stop === stop) current = null;
  };
  current = { stop };
  // A little past the animation, so the fade out finishes before the frame is removed.
  window.setTimeout(stop, reduce ? FLASH_REDUCED_MS : FLASH_MS + 100);
}

/**
 * Lights up what a stand-out points at.
 *
 * Pages listen for `LOCATE_STAND_OUT` and, when the exact spot is hidden behind
 * a control, reveal it and cancel the event. Cancelling holds the frame back
 * until that spot appears. Otherwise the first spot already on screen is used,
 * and a phone sheet is given time to close first.
 */
export function locateStandOut(targets: readonly string[], tone: StandOutTone) {
  if (targets.length === 0) return;
  const sheetWasOpen = Boolean(document.querySelector('[role="dialog"][data-state="open"]'));
  const event = new CustomEvent<readonly string[]>(LOCATE_STAND_OUT, { cancelable: true, detail: targets });
  window.dispatchEvent(event);

  const started = performance.now();
  const tick = () => {
    const elapsed = performance.now() - started;
    const waitedForSheet = !sheetWasOpen || elapsed >= SHEET_WAIT_MS;
    const exact = waitedForSheet ? findShown(targets.slice(0, 1)) : null;
    if (exact) {
      flashElement(exact, tone);
      return;
    }
    const stillWaiting = elapsed < (event.defaultPrevented ? REVEAL_WAIT_MS : SHEET_WAIT_MS);
    if (!waitedForSheet || (event.defaultPrevented && stillWaiting)) {
      requestAnimationFrame(tick);
      return;
    }
    const fallback = findShown(targets);
    if (fallback) flashElement(fallback, tone);
  };
  setTimeout(tick, 0);
}
