-- Add Photo C image to elastic hold exercises for better patient understanding
-- Photo C shows proper tongue position comparison

UPDATE public.exercises
SET demo_video_url = '/images/learn/tongue-position-comparison.png'
WHERE title ILIKE '%Middle of Tongue%Elastic Hold%'
  AND (demo_video_url IS NULL OR demo_video_url = '');