import { useSyncExternalStore } from "react";

/**
 * Lightweight, client-side operations log for the Performance page.
 *
 * Records app operations (especially Cloudinary image fetches) into an
 * in-memory ring buffer that the `/performance` route renders. Nothing here
 * touches the network — it only observes work happening elsewhere in the app.
 */

export type PerfCategory = "cloudinary" | "fallback" | "reflect" | "system";

export type PerfEvent = {
  id: string;
  at: number; // epoch ms
  category: PerfCategory;
  message: string;
  /** Optional structured detail (durations, counts, cursors, etc.). */
  meta?: Record<string, string | number | boolean | null | undefined>;
};

const MAX_EVENTS = 200;

let events: PerfEvent[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

/** Record a single operation. Newest events are kept at the front. */
export function logPerf(
  category: PerfCategory,
  message: string,
  meta?: PerfEvent["meta"],
) {
  const event: PerfEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: Date.now(),
    category,
    message,
    meta,
  };
  events = [event, ...events].slice(0, MAX_EVENTS);
  emit();
}

export function clearPerf() {
  events = [];
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return events;
}

const EMPTY: PerfEvent[] = [];

/** Subscribe to the live operations log. */
export function usePerfLog(): PerfEvent[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
