-- Add video fields to weeks table
ALTER TABLE public.weeks
ADD COLUMN IF NOT EXISTS video_title TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT;