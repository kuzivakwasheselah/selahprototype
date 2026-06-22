import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bookmark, BookOpen, ChevronDown, ChevronUp, Volume2, VolumeX, Check } from "lucide-react";
import { toast } from "sonner";

import { VERSES, randomVerse, getVerseById, type Verse } from "@/data/verses";
import { randomBackground } from "@/data/backgrounds";
import { downloadWallpaper } from "@/lib/wallpaper";
import { useSavedWallpapers } from "@/lib/saved-store";
import { cn } from "@/lib/utils";

type Search = {
  verseId?: string;
  book?: string;
  chapter?: number;
  verse?: number;
  text?: string;
};

export const Route = createFileRoute("/reflect")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    verseId: typeof s.verseId === "string" ? s.verseId : undefined,
    book: typeof s.book === "string" ? s.book : undefined,
    chapter: s.chapter != null ? Number(s.chapter) : undefined,
    verse: s.verse != null ? Number(s.verse) : undefined,
    text: typeof s.text === "string" ? s.text : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Reflect — Selah" },
      {
        name: "description",
        content: "An ambient, scroll-paced feed of Scripture over calm imagery. The antidote to doomscrolling.",
      },
    ],
  }),
  component: ReflectPage,
});

type FeedItem = { key: string; verse: Verse; bg: string };

function buildVerseFromSearch(s: Search): Verse | null {
  if (s.verseId) {
    const found = getVerseById(s.verseId);
    if (found) return found;
  }
  if (s.book && s.chapter && s.verse && s.text) {
    return {
      id: `${s.book.replace(/\s+/g, "-").toLowerCase()}-${s.chapter}-${s.verse}`,
      book: s.book,
      chapter: s.chapter,
      verse: s.verse,
      text: s.text,
      testament: "OT",
    };
  }
  return null;
}

function ReflectPage() {
  const search = Route.useSearch();
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<FeedItem[]>(() => {
    const seed = buildVerseFromSearch(search);
    const list: FeedItem[] = [];
    let lastV = "";
    let lastB = "";
    if (seed) {
      const bg = randomBackground();
      list.push({ key: `seed-${seed.id}`, verse: seed, bg });
      lastV = seed.id;
      lastB = bg;
    }
    for (let i = 0; i < 8; i++) {
      const v = randomVerse(lastV);
      const bg = randomBackground(lastB);
      list.push({ key: `init-${i}-${v.id}`, verse: v, bg });
      lastV = v.id;
      lastB = bg;
    }
    return list;
  });

  // Re-seed when navigating into reflect with new verse params.
  useEffect(() => {
    const seed = buildVerseFromSearch(search);
    if (!seed) return;
    setItems((prev) => {
      if (prev[0]?.verse.id === seed.id && prev[0]?.key.startsWith("seed")) return prev;
      const bg = randomBackground();
      return [{ key: `seed-${seed.id}-${Date.now()}`, verse: seed, bg }, ...prev];
    });
    containerRef.current?.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.verseId, search.book, search.chapter, search.verse]);

  const appendMore = useCallback(() => {
    setItems((prev) => {
      const lastV = prev[prev.length - 1]?.verse.id;
      const lastB = prev[prev.length - 1]?.bg;
      const next: FeedItem[] = [];
      let lv = lastV ?? "";
      let lb = lastB ?? "";
      for (let i = 0; i < 5; i++) {
        const v = randomVerse(lv);
        const bg = randomBackground(lb);
        next.push({ key: `more-${prev.length + i}-${v.id}-${Math.random().toString(36).slice(2, 6)}`, verse: v, bg });
        lv = v.id;
        lb = bg;
      }
      return [...prev, ...next];
    });
  }, []);

  const scrollByDir = (dir: 1 | -1) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ top: dir * el.clientHeight, behavior: "smooth" });
  };

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-black">
      {/* Mute toggle (ambient audio — reserved) */}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute" : "Mute"}
        className="fixed right-4 top-4 z-40 grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/50"
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      {/* Scroll arrows */}
      <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 sm:flex">
        <button
          type="button"
          onClick={() => scrollByDir(-1)}
          aria-label="Previous verse"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByDir(1)}
          aria-label="Next verse"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={containerRef}
        className="reflect-snap no-scrollbar h-full overflow-y-scroll"
      >
        {items.map((item, i) => (
          <ReflectSlide
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

function ReflectSlide({
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
  const ref = useRef<HTMLElement>(null);
  const [saving, setSaving] = useState(false);
  const saved = isSaved(item.verse.id, item.bg);

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
    const v = item.verse;
    toggle({
      verseId: v.id,
      book: v.book,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text,
      image: item.bg,
    });
    if (!saved) {
      setSaving(true);
      try {
        await downloadWallpaper(v, item.bg);
        toast.success("Saved to your wallpapers", { description: `${v.book} ${v.chapter}:${v.verse}` });
      } catch {
        toast.success("Saved to your collection", {
          description: "Wallpaper image couldn't be downloaded, but the verse is saved.",
        });
      } finally {
        setSaving(false);
      }
    } else {
      toast("Removed from saved");
    }
  };

  const handleRead = () => {
    const v = item.verse;
    navigate({
      to: "/bible",
      search: { book: v.book, chapter: v.chapter, verse: v.verse },
    });
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
        <p className="font-verse text-[1.7rem] font-medium leading-snug text-white text-shadow-soft sm:text-4xl">
          “{item.verse.text}”
        </p>
        <p className="mt-7 font-verse text-lg italic text-white/85 text-shadow-soft sm:text-xl">
          — {item.verse.book} {item.verse.chapter}:{item.verse.verse}
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
