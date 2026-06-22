import { useLocalStorage } from "@/hooks/use-local-storage";

export type Donation = {
  id: string;
  to: string;
  amount: number;
  at: number;
};

const KEY = "selah:donations";

export function useDonations() {
  const [items, setItems] = useLocalStorage<Donation[]>(KEY, []);
  const total = items.reduce((sum, d) => sum + d.amount, 0);
  const add = (to: string, amount: number) =>
    setItems((prev) => [{ id: `don-${Date.now()}`, to, amount, at: Date.now() }, ...prev]);
  return { items, total, add };
}
