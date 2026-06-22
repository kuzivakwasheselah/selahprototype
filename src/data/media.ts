// Curated Christian media for the Media page (prototype dataset).
// No likes, no comments — only content.

export type MediaImage = { id: string; type: "image"; src: string; title: string; h: number };
export type MediaVideo = { id: string; type: "video"; poster: string; src: string; title: string };
export type MediaAudio = {
  id: string;
  type: "audio";
  cover: string;
  src: string;
  title: string;
  kind: "Podcast" | "Gospel";
  by: string;
};
export type MediaItem = MediaImage | MediaVideo | MediaAudio;

const img = (id: string, photo: string, title: string, h: number): MediaImage => ({
  id,
  type: "image",
  src: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=800&q=80`,
  title,
  h,
});

export const IMAGES: MediaImage[] = [
  img("i1", "photo-1438232992991-995b7058bbb3", "Cross at dawn", 5),
  img("i2", "photo-1507692049790-de58290a4334", "Open Bible", 4),
  img("i3", "photo-1490578474895-699cd4e2cf59", "Worship hands", 6),
  img("i4", "photo-1519681393784-d120267933ba", "Mountain glory", 4),
  img("i5", "photo-1445820200644-3b3f9b40d3d2", "Cathedral light", 6),
  img("i6", "photo-1499209974431-9dddcece7f88", "Candle prayer", 4),
  img("i7", "photo-1473773508845-188df298d2d1", "Stained glass", 5),
  img("i8", "photo-1504052434569-70ad5836ab65", "Quiet chapel", 5),
  img("i9", "photo-1469474968028-56623f02e42e", "Wilderness", 4),
  img("i10", "photo-1518173946687-a4c8892bbd9f", "Bread & vine", 6),
  img("i11", "photo-1510590337019-5ef8d3d32116", "Field of light", 4),
  img("i12", "photo-1444703686981-a3abbc4d4fe3", "Dawn sky", 5),
];

export const VIDEOS: MediaVideo[] = [
  {
    id: "v1",
    type: "video",
    poster: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    title: "Be Still — a meditation",
  },
  {
    id: "v2",
    type: "video",
    poster: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    title: "Creation's morning",
  },
  {
    id: "v3",
    type: "video",
    poster: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=800&q=80",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    title: "Hands lifted high",
  },
];

export const AUDIOS: MediaAudio[] = [
  {
    id: "a1",
    type: "audio",
    cover: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=600&q=80",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    title: "Morning Devotion",
    kind: "Podcast",
    by: "Selah Voices",
  },
  {
    id: "a2",
    type: "audio",
    cover: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    title: "Amazing Grace (Instrumental)",
    kind: "Gospel",
    by: "Hymnal",
  },
  {
    id: "a3",
    type: "audio",
    cover: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=600&q=80",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    title: "Walking in Faith",
    kind: "Podcast",
    by: "The Quiet Hour",
  },
  {
    id: "a4",
    type: "audio",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    title: "Hymns of Hope",
    kind: "Gospel",
    by: "Sunday Choir",
  },
];

export const ALL_MEDIA: MediaItem[] = shuffle([...IMAGES, ...VIDEOS, ...AUDIOS]);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
