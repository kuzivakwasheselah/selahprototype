import { createServerFn } from "@tanstack/react-start";

/**
 * Shared Christian video feed, powered by the YouTube Data API.
 *
 * The feed is stored in the database so every visitor on Selah is served the
 * exact same set of videos. A fresh batch of 25 videos is loaded once every 24
 * hours (or on demand from the Performance dashboard). Reads are public; writes
 * happen server-side with the service-role client.
 */

export type FeedVideo = {
  id: string;
  videoId: string;
  title: string;
  channelTitle: string | null;
  thumbnailUrl: string | null;
  description: string | null;
  publishedAt: string | null;
  position: number;
};

export type FeedBatch = {
  id: string;
  source: string;
  itemCount: number;
  query: string | null;
  error: string | null;
  createdAt: string;
};

export type MediaFeed = {
  configured: boolean;
  stale: boolean;
  batch: FeedBatch | null;
  videos: FeedVideo[];
  error?: string;
};

/** How many videos make up a daily feed. */
export const FEED_SIZE = 25;

/** A feed older than this is considered stale and eligible for a daily refresh. */
export const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

/** Rotating Christian search queries so the daily feed stays varied. */
const QUERIES = [
  "Christian worship songs",
  "gospel sermon preaching",
  "bible study teaching",
  "praise and worship live",
  "christian devotional encouragement",
  "hymns and worship",
  "faith testimony christian",
  "scripture meditation prayer",
];

type DbBatchRow = {
  id: string;
  source: string;
  item_count: number;
  query: string | null;
  error: string | null;
  created_at: string;
};

type DbItemRow = {
  id: string;
  video_id: string;
  title: string;
  channel_title: string | null;
  thumbnail_url: string | null;
  description: string | null;
  published_at: string | null;
  position: number;
};

function mapBatch(row: DbBatchRow): FeedBatch {
  return {
    id: row.id,
    source: row.source,
    itemCount: row.item_count,
    query: row.query,
    error: row.error,
    createdAt: row.created_at,
  };
}

function mapItem(row: DbItemRow): FeedVideo {
  return {
    id: row.id,
    videoId: row.video_id,
    title: row.title,
    channelTitle: row.channel_title,
    thumbnailUrl: row.thumbnail_url,
    description: row.description,
    publishedAt: row.published_at,
    position: row.position,
  };
}

/** Read the latest stored feed batch and its videos (public, no write). */
async function readLatestFeed(): Promise<MediaFeed> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: batch, error: batchErr } = await supabaseAdmin
    .from("media_feed_batches")
    .select("id, source, item_count, query, error, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (batchErr) {
    return { configured: true, stale: true, batch: null, videos: [], error: batchErr.message };
  }
  if (!batch) {
    return { configured: true, stale: true, batch: null, videos: [] };
  }

  const { data: items, error: itemsErr } = await supabaseAdmin
    .from("media_feed_items")
    .select("id, video_id, title, channel_title, thumbnail_url, description, published_at, position")
    .eq("batch_id", batch.id)
    .order("position", { ascending: true });

  if (itemsErr) {
    return {
      configured: true,
      stale: true,
      batch: mapBatch(batch as DbBatchRow),
      videos: [],
      error: itemsErr.message,
    };
  }

  const ageMs = Date.now() - new Date(batch.created_at).getTime();
  return {
    configured: true,
    stale: ageMs > REFRESH_INTERVAL_MS,
    batch: mapBatch(batch as DbBatchRow),
    videos: (items ?? []).map((r) => mapItem(r as DbItemRow)),
  };
}

type YouTubeSearchResponse = {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      channelTitle?: string;
      description?: string;
      publishedAt?: string;
      thumbnails?: Record<string, { url?: string }>;
    };
  }>;
  error?: { message?: string };
};

/** Fetch a fresh batch of Christian videos from the YouTube Data API. */
async function fetchYouTubeVideos(query: string): Promise<{
  videos: Omit<FeedVideo, "id">[];
  error?: string;
}> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return { videos: [], error: "not_configured" };

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: String(FEED_SIZE),
    safeSearch: "strict",
    relevanceLanguage: "en",
    videoEmbeddable: "true",
    order: "relevance",
    key: apiKey,
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
  const json = (await res.json()) as YouTubeSearchResponse;

  if (!res.ok || json.error) {
    return { videos: [], error: json.error?.message ?? `YouTube responded ${res.status}` };
  }

  const videos: Omit<FeedVideo, "id">[] = [];
  let position = 0;
  for (const item of json.items ?? []) {
    const videoId = item.id?.videoId;
    if (!videoId) continue;
    const snip = item.snippet ?? {};
    const thumbs = snip.thumbnails ?? {};
    const thumbnailUrl =
      thumbs.high?.url ?? thumbs.medium?.url ?? thumbs.default?.url ?? null;
    videos.push({
      videoId,
      title: snip.title ?? "Untitled",
      channelTitle: snip.channelTitle ?? null,
      thumbnailUrl,
      description: snip.description ?? null,
      publishedAt: snip.publishedAt ?? null,
      position: position++,
    });
  }

  return { videos };
}

/**
 * Get the shared video feed. Does not write — call `refreshMediaFeed` to
 * fetch a new batch. The returned `stale` flag tells the client whether a
 * 24-hour refresh is due.
 */
export const getMediaFeed = createServerFn({ method: "GET" }).handler(
  async (): Promise<MediaFeed> => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const feed = await readLatestFeed();
    return { ...feed, configured: Boolean(apiKey) };
  },
);

/**
 * Fetch a fresh batch from YouTube and store it as the new shared feed.
 *
 * When `force` is false (the automatic daily refresh), it skips fetching if the
 * current feed is still within the 24-hour window. When `force` is true (the
 * manual reload button), it always fetches a new batch.
 */
export const refreshMediaFeed = createServerFn({ method: "POST" })
  .inputValidator((data: { force?: boolean } | undefined) => ({
    force: Boolean(data?.force),
  }))
  .handler(async ({ data }): Promise<MediaFeed> => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      const existing = await readLatestFeed();
      return { ...existing, configured: false };
    }

    const existing = await readLatestFeed();
    if (!data.force && existing.batch && !existing.stale) {
      return existing; // still fresh — no need to refetch
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const query = QUERIES[Math.floor(Math.random() * QUERIES.length)];
    const { videos, error } = await fetchYouTubeVideos(query);

    if (error || videos.length === 0) {
      // Record the failed attempt for the Performance log, keep serving the
      // previous feed.
      await supabaseAdmin.from("media_feed_batches").insert({
        source: "youtube",
        item_count: 0,
        query,
        error: error ?? "no_results",
      });
      return { ...existing, configured: true, error: error ?? "no_results" };
    }

    const { data: batch, error: batchErr } = await supabaseAdmin
      .from("media_feed_batches")
      .insert({ source: "youtube", item_count: videos.length, query })
      .select("id, source, item_count, query, error, created_at")
      .single();

    if (batchErr || !batch) {
      return { ...existing, configured: true, error: batchErr?.message ?? "insert_failed" };
    }

    const { error: itemsErr } = await supabaseAdmin.from("media_feed_items").insert(
      videos.map((v) => ({
        batch_id: batch.id,
        video_id: v.videoId,
        title: v.title,
        channel_title: v.channelTitle,
        thumbnail_url: v.thumbnailUrl,
        description: v.description,
        published_at: v.publishedAt,
        position: v.position,
      })),
    );

    if (itemsErr) {
      return { ...existing, configured: true, error: itemsErr.message };
    }

    return {
      configured: true,
      stale: false,
      batch: mapBatch(batch as DbBatchRow),
      videos: videos.map((v, i) => ({ id: `${batch.id}-${i}`, ...v })),
    };
  });
