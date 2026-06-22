import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

export type Prayer = {
  id: string;
  title: string;
  body: string;
  source: "written" | "generated";
  createdAt: number;
  updatedAt: number;
  /** When a requested prayer becomes visible. Undefined = visible immediately. */
  revealAt?: number;
  /** Whether the user has seen this prayer after it was revealed. */
  acknowledged?: boolean;
};

const KEY = "selah:prayers";
/** A requested prayer is "answered" one minute after the request. */
export const REVEAL_DELAY_MS = 60_000;

function makeId() {
  return `prayer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function usePrayers() {
  const [items, setItems] = useLocalStorage<Prayer[]>(KEY, []);

  const add = useCallback(
    (p: Pick<Prayer, "title" | "body" | "source">) => {
      const now = Date.now();
      const prayer: Prayer = {
        ...p,
        id: makeId(),
        createdAt: now,
        updatedAt: now,
        acknowledged: true,
      };
      setItems((prev) => [prayer, ...prev]);
      return prayer;
    },
    [setItems],
  );

  /** Submit a prayer request — it is fetched now but revealed after a delay. */
  const requestPrayer = useCallback(
    (p: Pick<Prayer, "title" | "body">) => {
      const now = Date.now();
      const prayer: Prayer = {
        ...p,
        source: "generated",
        id: makeId(),
        createdAt: now,
        updatedAt: now,
        revealAt: now + REVEAL_DELAY_MS,
        acknowledged: false,
      };
      setItems((prev) => [prayer, ...prev]);
      return prayer;
    },
    [setItems],
  );

  const update = useCallback(
    (id: string, patch: Partial<Pick<Prayer, "title" | "body">>) =>
      setItems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p)),
      ),
    [setItems],
  );

  const remove = useCallback(
    (id: string) => setItems((prev) => prev.filter((p) => p.id !== id)),
    [setItems],
  );

  /** Mark all revealed prayers as seen (call while the user is on /prayers). */
  const acknowledgeRevealed = useCallback(() => {
    const now = Date.now();
    setItems((prev) => {
      let changed = false;
      const next = prev.map((p) => {
        if (p.revealAt && p.revealAt <= now && !p.acknowledged) {
          changed = true;
          return { ...p, acknowledged: true };
        }
        return p;
      });
      return changed ? next : prev;
    });
  }, [setItems]);

  return { items, add, requestPrayer, update, remove, acknowledgeRevealed };
}

/** Ticking clock used to reveal pending prayers over time. */
export function useNow(intervalMs = 4000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** Lightweight read of prayer state for the navigation badge. */
export function usePrayerBadge() {
  const [items] = useLocalStorage<Prayer[]>(KEY, []);
  const now = useNow(3000);
  return items.filter((p) => p.revealAt && p.revealAt <= now && !p.acknowledged).length;
}
