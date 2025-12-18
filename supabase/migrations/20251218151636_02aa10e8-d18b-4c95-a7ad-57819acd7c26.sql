-- Add modified_video_url column to exercises table
ALTER TABLE public.exercises ADD COLUMN modified_video_url text;

-- Add exercise_id column to uploads table for per-exercise video uploads
ALTER TABLE public.uploads ADD COLUMN exercise_id uuid REFERENCES public.exercises(id);

-- Add comment for clarity
COMMENT ON COLUMN public.exercises.modified_video_url IS 'Optional second video URL for modified/bite-block version of exercise';
COMMENT ON COLUMN public.uploads.exercise_id IS 'Optional reference to specific exercise for per-exercise video uploads';