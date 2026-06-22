import { useCallback, useEffect, useState } from "react";

/**
 * SSR-safe localStorage-backed state. Reads on mount (client only), writes on
 * change, and syncs across tabs/components via a custom event.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setHydrated(true);

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key: string } | undefined;
      if (detail?.key !== key) return;
      try {
        const raw = localStorage.getItem(key);
        setValue(raw != null ? (JSON.parse(raw) as T) : initial);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("selah:storage", onChange as EventListener);
    return () => window.removeEventListener("selah:storage", onChange as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
          window.dispatchEvent(new CustomEvent("selah:storage", { detail: { key } }));
        } catch {
          /* ignore */
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}
