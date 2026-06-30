import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ImageIcon,
  BookOpen,
  Gauge,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Cloud,
  Clock,
  Youtube,
  RefreshCw,
  ListVideo,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { usePerfLog, clearPerf, logPerf, type PerfCategory } from "@/lib/perf-log";
import { VERSES, TOTAL_VERSES_TARGET } from "@/data/verses";
import { FALLBACK_BACKGROUNDS } from "@/data/backgrounds";
import { getMediaFeed, refreshMediaFeed } from "@/lib/media-feed.functions";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Performance — Selah" },
      {
        name: "description",
        content:
          "Live operations log for Selah: Cloudinary image fetches, Reflect verses and production-readiness.",
      },
    ],
  }),
  component: PerformancePage,
});

const CATEGORY_STYLE: Record<PerfCategory, { label: string; cls: string }> = {
  cloudinary: { label: "Cloudinary", cls: "bg-accent text-accent-foreground" },
  fallback: { label: "Fallback", cls: "bg-secondary text-muted-foreground" },
  reflect: { label: "Reflect", cls: "bg-primary/10 text-primary" },
  media: { label: "Media feed", cls: "bg-primary/15 text-primary" },
  system: { label: "System", cls: "bg-secondary text-muted-foreground" },
};

function fmtTime(at: number) {
  return new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function PerformancePage() {
  const events = usePerfLog();
  const feed = useMediaFeedAdmin();


  const cloudinaryEvents = events.filter((e) => e.category === "cloudinary");
  const imagesLoaded = cloudinaryEvents.reduce(
    (sum, e) => sum + (typeof e.meta?.new === "number" ? e.meta.new : 0),
    0,
  );
  const fetches = cloudinaryEvents.filter((e) => typeof e.meta?.new === "number").length;
  const timed = cloudinaryEvents
    .map((e) => (typeof e.meta?.timeMs === "number" ? e.meta.timeMs : null))
    .filter((n): n is number => n !== null);
  const avgFetchMs = timed.length
    ? Math.round(timed.reduce((a, b) => a + b, 0) / timed.length)
    : null;
  const lastCloudinary = cloudinaryEvents[0]?.at ?? null;
  const cloudinaryActive = imagesLoaded > 0;

  const versePct = Math.min(100, (VERSES.length / TOTAL_VERSES_TARGET) * 100);

  // Production-readiness checklist → score out of 100%.
  const checks = [
    { label: "Cloudinary backgrounds active", ok: cloudinaryActive },
    { label: "Fast fallback set available", ok: FALLBACK_BACKGROUNDS.length >= 3 },
    { label: "Reflect verses loaded", ok: VERSES.length > 0 },
    { label: "Image fetch under 1.5s", ok: avgFetchMs !== null && avgFetchMs < 1500 },
    { label: "Video feed connected", ok: Boolean(feed.data?.configured) },
    { label: "Today's video feed loaded", ok: (feed.data?.videos.length ?? 0) > 0 },
    { label: "No fetch failures logged", ok: !events.some((e) => /fail|error/i.test(e.message)) },
  ];
  const readiness = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);

  return (
    <div className="mx-auto min-h-[100dvh] max-w-2xl px-5 pb-20 pt-20">
      <h1 className="flex items-center gap-2 text-3xl font-semibold text-foreground">
        <Activity className="h-6 w-6 text-primary" />
        Performance
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Live operations log — refreshes as you use the app.
      </p>

      {/* Production readiness */}
      <section className="mt-6 rounded-3xl border border-border bg-card p-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-xl text-foreground">
              <Gauge className="h-5 w-5 text-primary" /> Production readiness
            </h2>
            <p className="text-sm text-muted-foreground">{readiness}% of checks passing</p>
          </div>
          <span className="font-serif text-3xl text-primary">{readiness}%</span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.66_0.1_60)] transition-all"
            style={{ width: `${Math.max(readiness, 2)}%` }}
          />
        </div>
        <ul className="mt-4 space-y-2">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2 text-sm">
              {c.ok ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span className={cn(c.ok ? "text-foreground" : "text-muted-foreground")}>{c.label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Stat cards */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat icon={ImageIcon} label="Images loaded" value={imagesLoaded.toString()} />
        <Stat icon={Cloud} label="Cloudinary fetches" value={fetches.toString()} />
        <Stat
          icon={Clock}
          label="Avg fetch time"
          value={avgFetchMs !== null ? `${avgFetchMs} ms` : "—"}
        />
        <Stat
          icon={BookOpen}
          label="Reflect verses"
          value={`${VERSES.length} / ${TOTAL_VERSES_TARGET.toLocaleString()}`}
          sub={`${versePct.toFixed(1)}% curated`}
        />
      </div>

      {/* Today's video feed */}
      <FeedSection feed={feed} />



      {/* Operations log */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-foreground">Operations log</h2>
          {events.length > 0 && (
            <button
              type="button"
              onClick={clearPerf}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-muted-foreground transition hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Clear
            </button>
          )}
        </div>

        <div className="mt-3 space-y-2">
          {events.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card/50 py-10 text-center text-sm text-muted-foreground">
              No operations recorded yet. Open{" "}
              <Link to="/reflect" className="text-primary underline-offset-2 hover:underline">
                Reflect
              </Link>{" "}
              to start fetching backgrounds.
            </p>
          ) : (
            events.map((e) => {
              const style = CATEGORY_STYLE[e.category];
              return (
                <div
                  key={e.id}
                  className="rounded-2xl border border-border bg-card p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                        style.cls,
                      )}
                    >
                      {style.label}
                    </span>
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {fmtTime(e.at)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-foreground">{e.message}</p>
                  {e.meta && (
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                      {Object.entries(e.meta)
                        .filter(([, v]) => v !== undefined && v !== null)
                        .map(([k, v]) => (
                          <span key={k} className="tabular-nums">
                            {k}: <span className="text-foreground/70">{String(v)}</span>
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {lastCloudinary && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Last Cloudinary activity at {fmtTime(lastCloudinary)}
        </p>
      )}
    </div>
  );
}

/* ----------------------------- Media feed admin ---------------------------- */

function useMediaFeedAdmin() {
  const queryClient = useQueryClient();
  const refreshFn = useServerFn(refreshMediaFeed);
  const [reloading, setReloading] = useState(false);

  const query = useQuery({
    queryKey: ["media-feed"],
    queryFn: () => getMediaFeed(),
  });

  async function reload(force: boolean) {
    setReloading(true);
    const startedAt = performance.now();
    try {
      const res = await refreshFn({ data: { force } });
      const ms = Math.round(performance.now() - startedAt);
      if (!res.configured) {
        logPerf("media", "YouTube feed not configured — add an API key", { timeMs: ms });
      } else if (res.error) {
        logPerf("media", `Feed refresh failed — ${res.error}`, { timeMs: ms });
      } else {
        logPerf("media", `Loaded ${res.videos.length} videos for today's feed`, {
          videos: res.videos.length,
          query: res.batch?.query ?? null,
          timeMs: ms,
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["media-feed"] });
    } catch (err) {
      logPerf("media", "Feed refresh request failed", {
        error: err instanceof Error ? err.message : "unknown",
      });
    } finally {
      setReloading(false);
    }
  }

  // Auto-load a fresh batch the first time the dashboard sees a stale/empty feed.
  const triggered = useRef(false);
  useEffect(() => {
    const data = query.data;
    if (!data || triggered.current) return;
    if (data.configured && (data.stale || data.videos.length === 0)) {
      triggered.current = true;
      void reload(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  return { data: query.data, reload, reloading };
}

type FeedAdmin = ReturnType<typeof useMediaFeedAdmin>;

function FeedSection({ feed }: { feed: FeedAdmin }) {
  const data = feed.data;
  const batch = data?.batch ?? null;
  const fetchedAt = batch ? new Date(batch.createdAt) : null;

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl text-foreground">
            <Youtube className="h-5 w-5 text-primary" /> Today's video feed
          </h2>
          <p className="text-sm text-muted-foreground">
            Shared with everyone · refreshes every 24 hours
          </p>
        </div>
        <button
          type="button"
          onClick={() => feed.reload(true)}
          disabled={feed.reloading}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-105 disabled:opacity-60"
        >
          <RefreshCw className={cn("h-4 w-4", feed.reloading && "animate-spin")} />
          {feed.reloading ? "Refreshing…" : "Reload feed"}
        </button>
      </div>

      {data && !data.configured && (
        <p className="mt-4 rounded-2xl border border-dashed border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
          The YouTube Data API key isn't set yet. Once it's added, the daily feed
          will load automatically.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat icon={ListVideo} label="Videos today" value={(data?.videos.length ?? 0).toString()} />
        <Stat
          icon={Clock}
          label="Last fetched"
          value={fetchedAt ? fmtTime(fetchedAt.getTime()) : "—"}
          sub={fetchedAt ? fetchedAt.toLocaleDateString() : undefined}
        />
      </div>

      {batch?.query && (
        <p className="mt-3 text-xs text-muted-foreground">
          Topic: <span className="text-foreground/70">{batch.query}</span>
          {data?.stale && <span className="ml-2 text-primary">· refresh due</span>}
        </p>
      )}
      {batch?.error && (
        <p className="mt-2 text-xs text-destructive">Last error: {batch.error}</p>
      )}

      {data && data.videos.length > 0 && (
        <ul className="mt-4 space-y-2">
          {data.videos.slice(0, 6).map((v) => (
            <li key={v.id} className="flex items-center gap-3">
              {v.thumbnailUrl && (
                <img
                  src={v.thumbnailUrl}
                  alt=""
                  className="h-10 w-16 shrink-0 rounded-md object-cover"
                  loading="lazy"
                />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{v.title}</p>
                {v.channelTitle && (
                  <p className="truncate text-xs text-muted-foreground">{v.channelTitle}</p>
                )}
              </div>
            </li>
          ))}
          {data.videos.length > 6 && (
            <li className="text-xs text-muted-foreground">
              + {data.videos.length - 6} more in{" "}
              <Link to="/media" className="text-primary underline-offset-2 hover:underline">
                Media
              </Link>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-2 font-serif text-2xl text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
