import { useLocalStorage } from "@/hooks/use-local-storage";

export type Prayer = {
  id: string;
  title: string;
  body: string;
  source: "written" | "generated";
  createdAt: number;
  updatedAt: number;
};

const KEY = "selah:prayers";

export function usePrayers() {
  const [items, setItems] = useLocalStorage<Prayer[]>(KEY, []);

  const add = (p: Pick<Prayer, "title" | "body" | "source">) => {
    const now = Date.now();
    const prayer: Prayer = { ...p, id: `prayer-${now}`, createdAt: now, updatedAt: now };
    setItems((prev) => [prayer, ...prev]);
    return prayer;
  };

  const update = (id: string, patch: Partial<Pick<Prayer, "title" | "body">>) =>
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p)),
    );

  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));

  return { items, add, update, remove };
}
