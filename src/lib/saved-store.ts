import { useLocalStorage } from "@/hooks/use-local-storage";

export type SavedWallpaper = {
  id: string; // verseId + image hash
  verseId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  image: string;
  savedAt: number;
};

const KEY = "selah:saved-wallpapers";

export function useSavedWallpapers() {
  const [items, setItems] = useLocalStorage<SavedWallpaper[]>(KEY, []);

  const isSaved = (verseId: string, image: string) =>
    items.some((i) => i.verseId === verseId && i.image === image);

  const toggle = (w: Omit<SavedWallpaper, "id" | "savedAt">) => {
    const id = `${w.verseId}__${btoa(w.image).slice(-12)}`;
    setItems((prev) => {
      const exists = prev.some((i) => i.id === id);
      if (exists) return prev.filter((i) => i.id !== id);
      return [{ ...w, id, savedAt: Date.now() }, ...prev];
    });
    return !items.some((i) => i.id === id);
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  return { items, isSaved, toggle, remove, clear };
}
