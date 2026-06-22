// Ambient background images for the Reflect feed.
//
// Primary source is Cloudinary (203+ curated images), fetched a batch at a time
// via the `fetchCloudinaryBatch` server function and consumed without repeats.
// This module keeps a fast, curated fallback set used while Cloudinary "warms
// up" (the first three slides) and whenever Cloudinary is unavailable or slow.

// Curated fallback (calm, ambient, full-bleed friendly). These have proven to
// load fast, so they cover the first slides and any Cloudinary gaps.
export const FALLBACK_BACKGROUNDS: string[] = [
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1505820013142-f86a3439c5b2?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1475924156734-496f6968f1f5?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1465101162946-4377e57745c3?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
];

// Backwards-compatible alias used by other routes (e.g. the assistant).
export const BACKGROUNDS: string[] = FALLBACK_BACKGROUNDS;

/** Number of opening slides that should always use the fast fallback set. */
export const WARMUP_SLIDES = 3;

/** Fisher–Yates shuffle producing a new array (does not mutate input). */
export function shuffle<T>(input: readonly T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Pick a random fallback background, optionally avoiding `exclude`. */
export function randomFallbackBackground(exclude?: string): string {
  if (FALLBACK_BACKGROUNDS.length === 1) return FALLBACK_BACKGROUNDS[0];
  let b = FALLBACK_BACKGROUNDS[Math.floor(Math.random() * FALLBACK_BACKGROUNDS.length)];
  while (exclude && b === exclude) {
    b = FALLBACK_BACKGROUNDS[Math.floor(Math.random() * FALLBACK_BACKGROUNDS.length)];
  }
  return b;
}

/** Legacy name kept for existing callers. */
export const randomBackground = randomFallbackBackground;
