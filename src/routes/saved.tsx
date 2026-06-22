import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bookmark, Trash2, X, Download } from "lucide-react";
import { toast } from "sonner";

import { useSavedWallpapers } from "@/lib/saved-store";
import { getVerseById } from "@/data/verses";
import { downloadWallpaper } from "@/lib/wallpaper";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved — Selah" },
      { name: "description", content: "Your saved wallpapers — verse and image combinations, ready to re-download anytime." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const navigate = useNavigate();
  const { items, remove, clear } = useSavedWallpapers();

  const open = (verseId: string, image: string, book: string, chapter: number, verse: number, text: string) => {
    navigate({ to: "/reflect", search: { verseId, book, chapter, verse, text, bg: image } });
  };

  const redownload = async (book: string, chapter: number, verse: number, text: string, image: string, verseId: string) => {
    const v = getVerseById(verseId) ?? { id: verseId, book, chapter, verse, text, testament: "OT" as const };
    try {
      await downloadWallpaper(v, image);
      toast.success("Wallpaper downloaded");
    } catch {
      toast.error("Couldn't download this image");
    }
  };

  return (
    <div className="mx-auto min-h-[100dvh] max-w-5xl px-5 pb-16 pt-20">
      <div className="flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-3xl font-semibold text-foreground">
          <Bookmark className="h-6 w-6 text-primary" />
          Saved
        </h1>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              clear();
              toast("Cleared all saved wallpapers");
            }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? "wallpaper" : "wallpapers"} · Only the verse + image
        combination is stored, never the photo itself.
      </p>

      {items.length === 0 ? (
        <div className="mt-20 text-center">
          <p className="font-serif text-2xl text-foreground">Nothing saved yet</p>
          <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
            Tap <span className="font-medium text-foreground">Save</span> on any verse in Reflect to
            keep it here as a re-downloadable wallpaper.
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/reflect" })}
            className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground transition hover:brightness-105"
          >
            Go to Reflect
          </button>
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((w) => (
            <div
              key={w.id}
              className="group relative overflow-hidden rounded-2xl border border-border shadow-soft"
            >
              <button
                type="button"
                onClick={() => open(w.verseId, w.image, w.book, w.chapter, w.verse, w.text)}
                className="block aspect-[9/16] w-full text-left"
              >
                <img src={w.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/70" />
                <div className="absolute inset-0 flex flex-col justify-end p-3">
                  <p className="font-verse text-sm leading-snug text-white text-shadow-soft line-clamp-4">
                    “{w.text}”
                  </p>
                  <p className="mt-2 font-verse text-xs italic text-white/85">
                    {w.book} {w.chapter}:{w.verse}
                  </p>
                </div>
              </button>

              <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => redownload(w.book, w.chapter, w.verse, w.text, w.image, w.verseId)}
                  aria-label="Re-download"
                  className="grid h-8 w-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    remove(w.id);
                    toast("Removed from saved");
                  }}
                  aria-label="Remove"
                  className="grid h-8 w-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
