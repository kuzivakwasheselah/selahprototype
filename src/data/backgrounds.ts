// Ambient background images for the Reflect feed.
//
// In production these load from Cloudinary. To switch the source, set
// CLOUDINARY_CLOUD_NAME and list the public IDs in CLOUDINARY_PUBLIC_IDS — the
// module will build delivery URLs automatically. Until then we fall back to a
// curated set of high-quality ambient photographs.

const CLOUDINARY_CLOUD_NAME = ""; // e.g. "selah"
const CLOUDINARY_PUBLIC_IDS: string[] = [
  // "reflect/ocean-cliffs",
  // "reflect/night-sky",
];

// Curated fallback (calm, ambient, full-bleed friendly).
const FALLBACK_BACKGROUNDS: string[] = [
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

function cloudinaryUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_1600/${publicId}`;
}

export const BACKGROUNDS: string[] =
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_PUBLIC_IDS.length > 0
    ? CLOUDINARY_PUBLIC_IDS.map(cloudinaryUrl)
    : FALLBACK_BACKGROUNDS;

export function randomBackground(exclude?: string): string {
  if (BACKGROUNDS.length === 1) return BACKGROUNDS[0];
  let b = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
  while (exclude && b === exclude) {
    b = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
  }
  return b;
}
