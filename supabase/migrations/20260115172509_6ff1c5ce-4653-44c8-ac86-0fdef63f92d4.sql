-- Add video_required column to exercises table
-- This allows therapists to control which exercises require video submissions
ALTER TABLE public.exercises 
ADD COLUMN video_required boolean NOT NULL DEFAULT false;

-- Set video_required to true for all 'active' type exercises by default
-- since those typically require form verification
UPDATE public.exercises 
SET video_required = true 
WHERE type = 'active';