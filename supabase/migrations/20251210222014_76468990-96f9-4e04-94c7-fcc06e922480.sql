-- Phase 1: Database Cleanup Based on Sam's Notes

-- 1. Create media_status enum type
CREATE TYPE public.media_status AS ENUM ('has_video', 'needs_ai_video', 'needs_photo', 'description_only', 'pending');

-- 2. Add media_status column to exercises table
ALTER TABLE public.exercises 
ADD COLUMN media_status public.media_status DEFAULT 'pending';

-- 3. Delete 5 drill items (NOT exercises per Sam's notes)
DELETE FROM public.exercises 
WHERE title IN (
  'Conversation Breathing',
  'Power Hold', 
  'Read Aloud Drill',
  'Daily Life Drill',
  'Relaxed Holds'
);

-- 4. Get Week 1 ID and add Posture Scan exercise
INSERT INTO public.exercises (week_id, title, type, instructions, media_status)
SELECT w.id, 'Posture Scan', 'posture', 
  'Stand with your back against a wall. Check that your head, shoulders, and hips are aligned. Focus on proper tongue posture with the tip resting on "the spot" behind your upper front teeth.',
  'needs_photo'
FROM public.weeks w
JOIN public.programs p ON w.program_id = p.id
WHERE w.number = 1 AND p.title LIKE '%24%';

-- 5. Move "Tongue Points" exercises from Week 1 to Week 3
UPDATE public.exercises e
SET week_id = (
  SELECT w3.id FROM public.weeks w3
  JOIN public.programs p ON w3.program_id = p.id
  WHERE w3.number = 3 AND p.title LIKE '%24%'
  LIMIT 1
)
FROM public.weeks w1
JOIN public.programs p ON w1.program_id = p.id
WHERE e.week_id = w1.id 
  AND w1.number = 1 
  AND p.title LIKE '%24%'
  AND e.title ILIKE '%tongue point%';

-- 6. Update media_status for specific exercises

-- Belly/Diaphragm Breathing needs AI video
UPDATE public.exercises 
SET media_status = 'needs_ai_video'
WHERE title ILIKE '%belly%breathing%' 
   OR title ILIKE '%diaphragm%breathing%';

-- 4-7-8 Breathing Pattern needs AI video
UPDATE public.exercises 
SET media_status = 'needs_ai_video'
WHERE title ILIKE '%4-7-8%' 
   OR title ILIKE '%4–7–8%';

-- Middle of Tongue Elastic Hold needs photo
UPDATE public.exercises 
SET media_status = 'needs_photo'
WHERE title ILIKE '%middle%tongue%elastic%';

-- Mouth Taping needs photo
UPDATE public.exercises 
SET media_status = 'needs_photo'
WHERE title ILIKE '%mouth%tap%';

-- Over Breathing Awareness is description only
UPDATE public.exercises 
SET media_status = 'description_only'
WHERE title ILIKE '%over%breathing%awareness%';

-- Mark exercises that already have videos
UPDATE public.exercises 
SET media_status = 'has_video'
WHERE demo_video_url IS NOT NULL 
  AND demo_video_url != ''
  AND media_status = 'pending';