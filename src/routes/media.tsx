import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clapperboard, Play, Headphones, X, Mic, Youtube } from "lucide-react";

import { IMAGES, AUDIOS, type MediaItem } from "@/data/media";
import { getMediaFeed, type FeedVideo } from "@/lib/media-feed.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Media — Selah" },
      { name: "description", content: "A curated stream of Christian images, videos, podcasts and gospel — content only, no noise." },
    ],
  }),
  component: MediaPage,
});

const TABS = ["Explore", "Images", "Videos", "Audios"] as const;
type Tab = (typeof TABS)[number];

const mediaFeedQuery = {
  queryKey: ["media-feed"],
  queryFn: () => getMediaFeed(),
};

function MediaPage() {
  const [tab, setTab] = useState<Tab>("Explore");
  const [active, setActive] = useState<MediaItem | null>(null);
  const [activeVideo, setActiveVideo] = useState<FeedVideo | null>(null);

  const queryClient = useQueryClient();
  const refresh = useServerFn(
    // lazy import avoided — server fn imported below
    () => Promise.resolve(),
  );

  const { data: feed } = useQuery(mediaFeedQuery);
  const videos = feed?.videos ?? [];

  // Trigger the daily 24-hour refresh when the stored feed is stale or empty.
  const refreshFn = useServerFnRefresh();
  const triggered = useRef(false);
  useEffect(() => {
    if (!feed || triggered.current) return;
    if (feed.configured && (feed.stale || feed.videos.length === 0)) {
      triggered.current = true;
      refreshFn({ data: { force: false } })
        .then(() => queryClient.invalidateQueries({ queryKey: ["media-feed"] }))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feed]);

  void refresh;

  return (
    <div className="mx-auto min-h-[100dvh] max-w-6xl px-4 pb-20 pt-20 sm:px-5">
      <h1 className="flex items-center gap-2 px-1 text-3xl font-semibold text-foreground">
        <Clapperboard className="h-6 w-6 text-primary" />
        Media
      </h1>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-full px-5 py-2 text-sm font-medium transition",
              tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Videos" && videos.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 py-12 text-center text-sm text-muted-foreground">
          {feed && !feed.configured
            ? "The video feed isn't connected yet. Add a YouTube API key to load today's Christian videos."
            : "Loading today's Christian videos…"}
        </p>
      )}

      {/* Masonry grid */}
      <div className="mt-6 [column-fill:_balance] gap-4 [column-count:2] sm:[column-count:3] lg:[column-count:4]">
        {tab === "Videos"
          ? videos.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveVideo(v)}
                className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card text-left shadow-soft transition hover:shadow-float"
              >
                <YouTubeTile video={v} />
              </button>
            ))
          : (tab === "Images" ? IMAGES : tab === "Audios" ? AUDIOS : exploreItems(videos)).map((m) =>
              "videoId" in m ? (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveVideo(m)}
                  className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card text-left shadow-soft transition hover:shadow-float"
                >
                  <YouTubeTile video={m} />
                </button>
              ) : (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActive(m)}
                  className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card text-left shadow-soft transition hover:shadow-float"
                >
                  <MediaTile item={m} />
                </button>
              ),
            )}
      </div>

      {active && <MediaViewer item={active} onClose={() => setActive(null)} />}
      {activeVideo && <YouTubeViewer video={activeVideo} onClose={() => setActiveVideo(null)} />}
    </div>
  );
}

/** Interleave curated images/audios with the live YouTube videos for Explore. */
function exploreItems(videos: FeedVideo[]): (MediaItem | FeedVideo)[] {
  const out: (MediaItem | FeedVideo)[] = [];
  const lists: (MediaItem | FeedVideo)[][] = [IMAGES, videos, AUDIOS];
  const max = Math.max(...lists.map((l) => l.length));
  for (let i = 0; i < max; i++) {
    for (const l of lists) if (l[i]) out.push(l[i]);
  }
  return out;
}

function YouTubeTile({ video }: { video: FeedVideo }) {
  return (
    <div className="relative aspect-video">
      {video.thumbnailUrl ? (
        <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="grid h-full w-full place-items-center bg-secondary">
          <Youtube className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <div className="absolute inset-0 grid place-items-center bg-black/25">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-white/85 text-foreground shadow-float transition group-hover:scale-110">
          <Play className="ml-0.5 h-6 w-6 fill-current" />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="line-clamp-2 text-sm font-medium text-white">{video.title}</p>
        {video.channelTitle && <p className="mt-0.5 text-xs text-white/75">{video.channelTitle}</p>}
      </div>
    </div>
  );
}

function YouTubeViewer({ video, onClose }: { video: FeedVideo; onClose: () => void }) {
  return (
    <div className="animate-fade-in fixed inset-0 z-[60] flex flex-col bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
      >
        <X className="h-5 w-5" />
      </button>
      <div className="grid flex-1 place-items-center p-5" onClick={(e) => e.stopPropagation()}>
        <div className="w-full max-w-3xl">
          <div className="aspect-video w-full overflow-hidden rounded-2xl">
            <iframe
              src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`}
              title={video.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="mt-3 text-center text-sm text-white/80">{video.title}</p>
          {video.channelTitle && <p className="text-center text-xs text-white/60">{video.channelTitle}</p>}
        </div>
      </div>
    </div>
  );
}

function MediaTile({ item }: { item: MediaItem }) {
  if (item.type === "image") {
    return (
      <div className="relative" style={{ aspectRatio: `4 / ${item.h}` }}>
        <img src={item.src} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition group-hover:opacity-100" />
        <p className="absolute bottom-2 left-3 right-3 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
          {item.title}
        </p>
      </div>
    );
  }
  if (item.type === "video") {
    return (
      <div className="relative aspect-video">
        <img src={item.poster} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 grid place-items-center bg-black/25">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/85 text-foreground shadow-float transition group-hover:scale-110">
            <Play className="ml-0.5 h-6 w-6 fill-current" />
          </span>
        </div>
        <p className="absolute bottom-2 left-3 right-3 text-sm font-medium text-white">{item.title}</p>
      </div>
    );
  }
  return (
    <div className="relative aspect-square">
      <img src={item.cover} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">
        {item.kind === "Podcast" ? <Mic className="h-3 w-3" /> : <Headphones className="h-3 w-3" />}
        {item.kind}
      </span>
      <div className="absolute bottom-2 left-3 right-3">
        <p className="text-sm font-semibold text-white">{item.title}</p>
        <p className="text-xs text-white/75">{item.by}</p>
      </div>
    </div>
  );
}

function MediaViewer({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  return (
    <div className="animate-fade-in fixed inset-0 z-[60] flex flex-col bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
      >
        <X className="h-5 w-5" />
      </button>
      <div className="grid flex-1 place-items-center p-5" onClick={(e) => e.stopPropagation()}>
        {item.type === "image" && (
          <figure className="max-h-full">
            <img src={item.src.replace("w=800", "w=1400")} alt={item.title} className="max-h-[82dvh] rounded-2xl object-contain" />
            <figcaption className="mt-3 text-center text-sm text-white/80">{item.title}</figcaption>
          </figure>
        )}
        {item.type === "video" && (
          <div className="w-full max-w-3xl">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video src={item.src} poster={item.poster} controls autoPlay className="w-full rounded-2xl" />
            <p className="mt-3 text-center text-sm text-white/80">{item.title}</p>
          </div>
        )}
        {item.type === "audio" && (
          <div className="w-full max-w-md rounded-3xl bg-card p-6 text-center">
            <img src={item.cover} alt={item.title} className="mx-auto aspect-square w-56 rounded-2xl object-cover shadow-float" />
            <p className="mt-5 font-serif text-2xl text-foreground">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.by} · {item.kind}</p>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio src={item.src} controls autoPlay className="mt-5 w-full" />
          </div>
        )}
      </div>
    </div>
  );
}
