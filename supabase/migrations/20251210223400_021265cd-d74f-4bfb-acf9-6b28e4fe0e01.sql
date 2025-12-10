-- Add clinician tracking fields to exercises table
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS media_waiting_on_clinician boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_clinician_confirmation boolean DEFAULT false;

-- Fix Tongue Stretch naming to "Tongue Stretch (Alternating)" in Weeks 7, 8, 10
UPDATE public.exercises e
SET title = 'Tongue Stretch (Alternating)'
FROM public.weeks w
WHERE e.week_id = w.id
AND e.title = 'Tongue Stretch'
AND w.number IN (7, 8, 10);

-- Set media_waiting_on_clinician = true for exercises needing clinician media
UPDATE public.exercises
SET media_waiting_on_clinician = true
WHERE title ILIKE '%Belly/Diaphragm Breathing%'
   OR title ILIKE '%4-7-8 Breathing%'
   OR title ILIKE '%Middle of Tongue%Elastic Hold%'
   OR title ILIKE '%Mouth Taping%';

-- Set requires_clinician_confirmation = true for Floor of Mouth Massage
UPDATE public.exercises
SET requires_clinician_confirmation = true
WHERE title ILIKE '%Floor of Mouth Massage%';