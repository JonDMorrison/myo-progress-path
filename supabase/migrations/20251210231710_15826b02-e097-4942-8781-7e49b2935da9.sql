-- Add admin_notes column to exercises table for clinician comments
ALTER TABLE public.exercises ADD COLUMN admin_notes TEXT;