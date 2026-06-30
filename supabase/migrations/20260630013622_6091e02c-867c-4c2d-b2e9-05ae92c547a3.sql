CREATE TABLE public.media_feed_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'youtube',
  item_count INTEGER NOT NULL DEFAULT 0,
  query TEXT,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.media_feed_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.media_feed_batches(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  channel_title TEXT,
  thumbnail_url TEXT,
  description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_feed_items_batch ON public.media_feed_items(batch_id);
CREATE INDEX idx_media_feed_batches_created ON public.media_feed_batches(created_at DESC);

GRANT SELECT ON public.media_feed_batches TO anon, authenticated;
GRANT ALL ON public.media_feed_batches TO service_role;
GRANT SELECT ON public.media_feed_items TO anon, authenticated;
GRANT ALL ON public.media_feed_items TO service_role;

ALTER TABLE public.media_feed_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_feed_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feed batches"
ON public.media_feed_batches FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can view feed items"
ON public.media_feed_items FOR SELECT
TO anon, authenticated
USING (true);