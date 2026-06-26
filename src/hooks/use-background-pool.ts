import { useCallback, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";

import { fetchCloudinaryBatch } from "@/lib/backgrounds.functions";
import { randomFallbackBackground, shuffle, WARMUP_SLIDES } from "@/data/backgrounds";
import { logPerf } from "@/lib/perf-log";

/**
 * Background source for the Reflect feed.
 *
 * - Primary: Cloudinary, fetched a batch at a time and consumed in a shuffled
 *   order so images don't repeat across scrolls.
 * - Warm-up: the first `WARMUP_SLIDES` slides always use the fast curated
 *   fallback set while Cloudinary loads.
 * - Fallback: if Cloudinary is unconfigured, slow, or exhausted, fall back to
 *   the curated set.
 *
 * `take()` is synchronous (reads from a ref-backed pool) so the feed can build
 * slides without awaiting, while batches are prefetched in the background.
 */
export function useBackgroundPool() {
  const poolRef = useRef<string[]>([]); // shuffled, not-yet-shown Cloudinary URLs
  const usedRef = useRef<Set<string>>(new Set());
  const cursorRef = useRef<string | null>(null);
  const exhaustedRef = useRef(false);
  const fetchingRef = useRef(false);
  const takeCountRef = useRef(0);

  const fetchBatch = useServerFn(fetchCloudinaryBatch);

  const loadMore = useCallback(async () => {
    if (fetchingRef.current || exhaustedRef.current) return;
    fetchingRef.current = true;
    try {
      const res = await fetchBatch({
        data: { cursor: cursorRef.current ?? undefined },
      });
      if (res.configured && res.images.length > 0) {
        const fresh = res.images.filter((u) => !usedRef.current.has(u));
        poolRef.current.push(...shuffle(fresh));
      }
      cursorRef.current = res.cursor;
      // No cursor, or Cloudinary not configured/failed → stop paging.
      if (!res.cursor || !res.configured) exhaustedRef.current = true;
    } catch {
      exhaustedRef.current = true;
    } finally {
      fetchingRef.current = false;
    }
  }, [fetchBatch]);

  // Prefetch the first batch as soon as the feed mounts.
  useEffect(() => {
    void loadMore();
  }, [loadMore]);

  const take = useCallback(
    (exclude?: string): string => {
      const n = takeCountRef.current++;

      // Opening slides + any time the pool is empty → fast fallback.
      if (n < WARMUP_SLIDES || poolRef.current.length === 0) {
        return randomFallbackBackground(exclude);
      }

      const url = poolRef.current.shift()!;
      usedRef.current.add(url);

      // Top up before we run dry.
      if (poolRef.current.length < 5) void loadMore();

      return url;
    },
    [loadMore],
  );

  // Reset the slide counter (used when the feed is rebuilt from a seed verse) so
  // the warm-up rule applies to the new opening slides.
  const resetCount = useCallback(() => {
    takeCountRef.current = 0;
  }, []);

  return { take, resetCount };
}
