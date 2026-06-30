import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bookmark, BookOpen, ChevronDown, ChevronUp, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { SCROLL_PRAYERS, randomScrollPrayer, type ScrollPrayer } from "@/data/scroll-prayers";
import { downloadPrayerWallpaper } from "@/lib/wallpaper";
import { useSavedWallpapers } from "@/lib/saved-store";
import { usePrayers } from "@/lib/prayers-store";
import { useBackgroundPool } from "@/hooks/use-background-pool";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reflect/prayers")({
  head: () => ({
    meta: [
      { title: "Prayers — Reflect — Selah" },
      {
        name: "description",
        content: "An ambient, scroll-paced feed of short, meaningful prayers over calm imagery.",
      },
    ],
  }),
  component: ReflectPrayersPage,
});

type FeedItem = { key: string; prayer: ScrollPrayer; bg: string };

function ReflectPrayersPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<FeedItem[]>([]);
  const { take, resetCount } = useBackgroundPool();

  useEffect(() => {
    resetCount();
    const list: FeedItem[] = [];
    let lastP = "";
    let lastB = "";
    for (let i = 0; i < 8; i++) {
      const p = randomScrollPrayer(lastP);
      const bg = take(lastB);
      list.push({ key: `init-${i}-${p.id}`, prayer: p, bg });
      lastP = p.id;
      lastB = bg;
    }
    setItems(list);
    containerRef.current?.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appendMore = useCallback(() => {
    setItems((prev) => {
      const lastP = prev[prev.length - 1]?.prayer.id;
      const lastB = prev[prev.length - 1]?.bg;
      const next: FeedItem[] = [];
      let lp = lastP ?? "";
      let lb = lastB ?? "";
      for (let i = 0; i < 5; i++) {
        const p = randomScrollPrayer(lp);
        const bg = take(lb);
        next.push({
          key: `more-${prev.length + i}-${p.id}-${Math.random().toString(36).slice(2, 6)}`,
          prayer: p,
          bg,
        });
        lp = p.id;
        lb = bg;
      }
      return [...prev, ...next];
    });
  }, [take]);

  const scrollByDir = useCallback((dir: 1 | -1) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ top: dir * el.clientHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        scrollByDir(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollByDir(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scrollByDir]);

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-black">
      {/* Back to Prayers */}
      <button
        type="button"
        onClick={() => navigate({ to: "/prayers" })}
        aria-label="Back to Prayers"
        className="fixed right-4 top-4 z-40 grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/50"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 sm:flex">
        <button
          type="button"
          onClick={() => scrollByDir(-1)}
          aria-label="Previous prayer"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByDir(1)}
          aria-label="Next prayer"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>

      <div ref={containerRef} className="reflect-snap no-scrollbar h-full overflow-y-scroll">
        {items.map((item, i) => (
          <PrayerSlide
            key={item.key}
            item={item}
            isLast={i === items.length - 1}
            onReachEnd={appendMore}
          />
        ))}
      </div>
    </div>
  );
}

function PrayerSlide({
  item,
  isLast,
  onReachEnd,
}: {
  item: FeedItem;
  isLast: boolean;
  onReachEnd: () => void;
}) {
  const navigate = useNavigate();
  const { isSaved, toggle } = useSavedWallpapers();
  const { add } = usePrayers();
  const ref = useRef<HTMLElement>(null);
  const [saving, setSaving] = useState(false);
  const saved = isSaved(item.prayer.id, item.bg);

  useEffect(() => {
    if (!isLast || !ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && onReachEnd()),
      { threshold: 0.6 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [isLast, onReachEnd]);

  const handleSave = async () => {
    const p = item.prayer;
    toggle({
      verseId: p.id,
      book: p.title,
      chapter: 0,
      verse: 0,
      text: p.text,
      image: item.bg,
    });
    if (!saved) {
      setSaving(true);
      try {
        await downloadPrayerWallpaper(p.title, p.text, item.bg);
        toast.success("Saved to your wallpapers", { description: p.title });
      } catch {
        toast.success("Saved to your collection", {
          description: "Image couldn't be downloaded, but the prayer is saved.",
        });
      } finally {
        setSaving(false);
      }
    } else {
      toast("Removed from saved");
    }
  };

  const handleRead = () => {
    const p = item.prayer;
    add({ title: p.title, body: p.text, source: "written" });
    toast.success("Added to your Prayers", { description: p.title });
    navigate({ to: "/prayers" });
  };

  return (
    <section
      ref={ref}
      className="reflect-snap-item relative grid h-[100dvh] w-full place-items-center"
    >
      <img
        src={item.bg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/60" />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
        <p className="font-verse text-lg italic text-white/85 text-shadow-soft sm:text-xl">
          {item.prayer.title}
        </p>
        <p className="mt-5 font-verse text-[1.55rem] font-medium leading-snug text-white text-shadow-soft sm:text-[2rem]">
          {item.prayer.text}
        </p>

        <div className="mt-9 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-6 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-black/50",
              saved && "border-primary/60 bg-primary/30",
            )}
          >
            {saved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {saved ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={handleRead}
            className="flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-6 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-black/50"
          >
            <BookOpen className="h-4 w-4" />
            Read
          </button>
        </div>
      </div>
    </section>
  );
}
