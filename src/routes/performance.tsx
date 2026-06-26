import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "lucide-react";

import { cn } from "@/lib/utils";
import { usePerfLog, clearPerf, type PerfCategory } from "@/lib/perf-log";
import { VERSES, TOTAL_VERSES_TARGET } from "@/data/verses";
import { FALLBACK_BACKGROUNDS } from "@/data/backgrounds";

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
  system: { label: "System", cls: "bg-secondary text-muted-foreground" },
};

function fmtTime(at: number) {
  return new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function PerformancePage() {
  const events = usePerfLog();

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
