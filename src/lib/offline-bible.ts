// Offline Bible — downloads the full KJV (66 books) into IndexedDB so the
// entire Bible is readable in-app with no network. Source: aruljohn/Bible-kjv
// (public domain KJV), one JSON file per book.

import { useCallback, useEffect, useState } from "react";
import { BIBLE_BOOKS } from "@/data/books";

const DB_NAME = "selah-bible";
const STORE = "books";
const META_KEY = "__downloaded_books";
const SOURCE = "https://raw.githubusercontent.com/aruljohn/Bible-kjv/master";

type StoredChapter = { chapter: string; verses: { verse: string; text: string }[] };
type StoredBook = { book: string; chapters: StoredChapter[] };

export type OfflineVerse = { book_name: string; chapter: number; verse: number; text: string };

function fileName(book: string) {
  return book.replace(/\s+/g, "");
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const r = tx.objectStore(STORE).get(key);
    r.onsuccess = () => resolve(r.result as T | undefined);
    r.onerror = () => reject(r.error);
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbClear(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineChapter(book: string, chapter: number): Promise<OfflineVerse[] | null> {
  if (typeof indexedDB === "undefined") return null;
  try {
    const stored = await idbGet<StoredBook>(`book:${book}`);
    if (!stored) return null;
    const ch = stored.chapters.find((c) => Number(c.chapter) === chapter);
    if (!ch) return null;
    return ch.verses.map((v) => ({
      book_name: book,
      chapter,
      verse: Number(v.verse),
      text: v.text,
    }));
  } catch {
    return null;
  }
}

async function downloadedSet(): Promise<string[]> {
  if (typeof indexedDB === "undefined") return [];
  return (await idbGet<string[]>(META_KEY)) ?? [];
}

export function useOfflineBible() {
  const [downloaded, setDownloaded] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const refresh = useCallback(async () => {
    setDownloaded(await downloadedSet());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const total = BIBLE_BOOKS.length;
  const isComplete = downloaded.length >= total;

  const download = useCallback(async () => {
    if (typeof indexedDB === "undefined") return;
    setDownloading(true);
    const done = new Set(await downloadedSet());
    setProgress(done.size);
    try {
      for (const b of BIBLE_BOOKS) {
        if (done.has(b.name)) continue;
        const res = await fetch(`${SOURCE}/${fileName(b.name)}.json`);
        if (!res.ok) throw new Error(`Failed ${b.name}`);
        const data = (await res.json()) as StoredBook;
        await idbSet(`book:${b.name}`, data);
        done.add(b.name);
        await idbSet(META_KEY, Array.from(done));
        setProgress(done.size);
        setDownloaded(Array.from(done));
      }
    } finally {
      setDownloading(false);
      await refresh();
    }
  }, [refresh]);

  const clear = useCallback(async () => {
    await idbClear();
    setDownloaded([]);
    setProgress(0);
  }, []);

  return { downloaded: downloaded.length, total, isComplete, downloading, progress, download, clear };
}
