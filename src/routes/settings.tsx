import { createFileRoute } from "@tanstack/react-router";
import {
  Settings as SettingsIcon,
  Download,
  Bookmark,
  Users,
  Sparkles,
  Heart,
  RefreshCw,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import { VERSES, TOTAL_VERSES_TARGET } from "@/data/verses";
import { useSavedWallpapers } from "@/lib/saved-store";
import { usePrayers } from "@/lib/prayers-store";
import { useGroups } from "@/lib/groups-store";
import { useDonations } from "@/lib/donations-store";
import { useProfile, initials } from "@/lib/profile-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Selah" },
      { name: "description", content: "Manage your Selah account, download the Bible offline and track your journey." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { items: saved } = useSavedWallpapers();
  const { items: prayers } = usePrayers();
  const { groups } = useGroups();
  const { total } = useDonations();
  const { profile, update } = useProfile();

  const pct = Math.min(100, (VERSES.length / TOTAL_VERSES_TARGET) * 100);
  const generated = prayers.filter((p) => p.source === "generated").length;

  const stats = [
    { icon: Bookmark, label: "Verses saved", value: saved.length },
    { icon: Users, label: "Groups", value: groups.length },
    { icon: Sparkles, label: "Prayers generated", value: generated },
    { icon: Heart, label: "Donated", value: `$${total}` },
  ];

  return (
    <div className="mx-auto min-h-[100dvh] max-w-2xl px-5 pb-20 pt-20">
      <h1 className="flex items-center gap-2 text-3xl font-semibold text-foreground">
        <SettingsIcon className="h-6 w-6 text-primary" />
        Settings
      </h1>

      {/* Verses progress */}
      <section className="mt-6 rounded-3xl border border-border bg-card p-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-serif text-xl text-foreground">Verses in Reflect</h2>
            <p className="text-sm text-muted-foreground">
              {VERSES.length.toLocaleString()} of {TOTAL_VERSES_TARGET.toLocaleString()} verses curated
            </p>
          </div>
          <span className="font-serif text-2xl text-primary">{pct.toFixed(1)}%</span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.66_0.1_60)] transition-all" style={{ width: `${Math.max(pct, 1.5)}%` }} />
        </div>
      </section>

      {/* Offline */}
      <button
        type="button"
        onClick={() => toast("Offline Bible", { description: "Downloading the Bible for in-app offline reading is coming soon." })}
        className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary/40"
      >
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Download className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="block font-medium text-foreground">Download offline Bible</span>
          <span className="text-sm text-muted-foreground">Read all 66 books without Wi-Fi</span>
        </span>
      </button>

      {/* My account */}
      <section className="mt-6">
        <h2 className="font-serif text-2xl text-foreground">My Account</h2>

        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-lg font-semibold text-white"
            style={{ backgroundColor: profile.color }}
          >
            {initials(profile.name) || "F"}
          </div>
          <input
            value={profile.name}
            onChange={(e) => update({ name: e.target.value })}
            className="min-w-0 flex-1 bg-transparent font-serif text-xl text-foreground outline-none"
            aria-label="Your name"
          />
          <Check className="h-5 w-5 text-primary" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4">
              <Icon className="h-5 w-5 text-primary" />
              <p className="mt-2 font-serif text-2xl text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Update */}
      <button
        type="button"
        onClick={() => toast.success("Selah is up to date", { description: "You're on the latest version." })}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-medium transition hover:border-primary/40"
      >
        <RefreshCw className="h-4 w-4 text-primary" /> Update app
      </button>

      <p className="mt-6 text-center text-xs text-muted-foreground">Selah · v0.1 · Be still and know</p>
    </div>
  );
}
