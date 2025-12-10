-- Add media_approved column to exercises table
ALTER TABLE public.exercises 
ADD COLUMN media_approved boolean DEFAULT false;