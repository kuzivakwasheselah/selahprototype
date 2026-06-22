import { useMemo, useState, useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Download,
  ArrowLeft,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { BIBLE_BOOKS, getBook } from "@/data/books";
import { cn } from "@/lib/utils";

type Search = {
  book?: string;
  chapter?: number;
  verse?: number;
};

export const Route = createFileRoute("/bible")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    book: typeof s.book === "string" ? s.book : undefined,
    chapter: s.chapter != null ? Number(s.chapter) : undefined,
    verse: s.verse != null ? Number(s.verse) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Bible — Selah" },
      { name: "description", content: "An easy-to-read Bible. All 66 books, searchable, with a calm reading experience." },
    ],
  }),
  component: BiblePage,
});

function BiblePage() {
  const { book, chapter, verse } = Route.useSearch();

  if (book && chapter) return <ReadingView book={book} chapter={chapter} highlight={verse} />;
  if (book) return <ChaptersView book={book} />;
  return <BooksView />;
}

/* ---------------------------------- Books --------------------------------- */

function BooksView() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const results = useMemo(
    () => BIBLE_BOOKS.filter((b) => b.name.toLowerCase().includes(q.trim().toLowerCase())),
    [q],
  );

  return (
    <div className="mx-auto min-h-[100dvh] max-w-2xl px-5 pb-16 pt-20">
      <div className="flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-3xl font-semibold text-foreground">
          <BookMarked className="h-6 w-6 text-primary" />
          Bible
        </h1>
        <button
          type="button"
          onClick={() => toast("Offline Bible", { description: "Download for offline reading is coming soon." })}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <Download className="h-4 w-4" />
          Offline
        </button>
      </div>

      <label className="mt-5 flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search books..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      <div className="mt-6 space-y-3">
        {results.map((b) => (
          <button
            key={b.name}
            type="button"
            onClick={() => navigate({ to: "/bible", search: { book: b.name } })}
            className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 text-left transition hover:border-primary/40 hover:shadow-soft"
          >
            <span>
              <span className="block font-serif text-xl text-foreground">{b.name}</span>
              <span className="text-sm text-muted-foreground">{b.chapters} chapters</span>
            </span>
            <TestamentBadge t={b.testament} compact />
          </button>
        ))}
        {results.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">No books found.</p>
        )}
      </div>
    </div>
  );
}

/* -------------------------------- Chapters -------------------------------- */

function ChaptersView({ book }: { book: string }) {
  const navigate = useNavigate();
  const meta = getBook(book);
  const chapters = Array.from({ length: meta?.chapters ?? 0 }, (_, i) => i + 1);

  return (
    <div className="mx-auto min-h-[100dvh] max-w-4xl px-5 pb-16 pt-20">
      <button
        type="button"
        onClick={() => navigate({ to: "/bible", search: {} })}
        className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Books
      </button>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-foreground">{book}</h1>
          <p className="text-sm text-muted-foreground">{meta?.chapters} chapters</p>
        </div>
        {meta && <TestamentBadge t={meta.testament} />}
      </div>

      <div className="mt-7 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
        {chapters.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => navigate({ to: "/bible", search: { book, chapter: c } })}
            className="grid aspect-square place-items-center rounded-2xl border border-border bg-card text-lg text-foreground transition hover:border-primary/40 hover:bg-accent/50"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- Reading --------------------------------- */

type ApiVerse = { book_name: string; chapter: number; verse: number; text: string };

function useChapter(book: string, chapter: number) {
  return useQuery({
    queryKey: ["bible", book, chapter],
    queryFn: async (): Promise<ApiVerse[]> => {
      const ref = encodeURIComponent(`${book} ${chapter}`);
      const res = await fetch(`https://bible-api.com/${ref}?translation=kjv`);
      if (!res.ok) throw new Error("Could not load chapter");
      const data = (await res.json()) as { verses: ApiVerse[] };
      return data.verses;
    },
    staleTime: 1000 * 60 * 60,
  });
}

function ReadingView({ book, chapter, highlight }: { book: string; chapter: number; highlight?: number }) {
  const navigate = useNavigate();
  const meta = getBook(book);
  const total = meta?.chapters ?? 1;
  const { data, isLoading, isError } = useChapter(book, chapter);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlight && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlight, data]);

  const goChapter = (c: number) =>
    navigate({ to: "/bible", search: { book, chapter: c } });

  const openReflect = (v: ApiVerse) =>
    navigate({
      to: "/reflect",
      search: { book, chapter, verse: v.verse, text: v.text.trim() },
    });

  return (
    <div className="mx-auto min-h-[100dvh] max-w-2xl px-5 pb-28 pt-20">
      <button
        type="button"
        onClick={() => navigate({ to: "/bible", search: { book } })}
        className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Chapters
      </button>

      <div className="mt-4 flex items-center justify-between gap-3">
        <h1 className="font-serif text-3xl text-foreground">
          {book} {chapter}
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            type="button"
            disabled={chapter <= 1}
            onClick={() => goChapter(chapter - 1)}
            className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card transition enabled:hover:bg-secondary disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>{chapter} / {total}</span>
          <button
            type="button"
            disabled={chapter >= total}
            onClick={() => goChapter(chapter + 1)}
            className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card transition enabled:hover:bg-secondary disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-1">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading chapter…
          </div>
        )}
        {isError && (
          <p className="py-20 text-center text-muted-foreground">
            This chapter couldn't be loaded. Check your connection and try again.
          </p>
        )}
        {data?.map((v) => {
          const isHi = highlight === v.verse;
          return (
            <div
              key={v.verse}
              ref={isHi ? highlightRef : undefined}
              onClick={() => openReflect(v)}
              className={cn(
                "group relative cursor-pointer rounded-2xl px-4 py-3 font-verse text-[1.35rem] leading-relaxed text-foreground transition",
                isHi ? "bg-accent/60" : "hover:bg-secondary/70",
              )}
            >
              <span className="mr-2 align-super text-sm font-semibold text-primary">{v.verse}</span>
              {v.text.trim()}
              <Maximize2 className="absolute right-3 top-3 h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
            </div>
          );
        })}
      </div>

      {data && (
        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <button
            type="button"
            disabled={chapter <= 1}
            onClick={() => goChapter(chapter - 1)}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm transition enabled:hover:bg-secondary disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <button
            type="button"
            disabled={chapter >= total}
            onClick={() => goChapter(chapter + 1)}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground transition enabled:hover:brightness-105 disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- Badge ---------------------------------- */

function TestamentBadge({ t, compact }: { t: "OT" | "NT"; compact?: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
        t === "OT" ? "bg-ot text-ot-foreground" : "bg-nt text-nt-foreground",
      )}
    >
      {compact ? t : t === "OT" ? "Old Testament" : "New Testament"}
    </span>
  );
}
