-- Fix the patients table to add unique constraint on user_id
-- This is required for the handle_new_user() trigger's ON CONFLICT clause

-- First, make user_id NOT NULL (security best practice for RLS)
ALTER TABLE public.patients 
  ALTER COLUMN user_id SET NOT NULL;

-- Add unique constraint on user_id
ALTER TABLE public.patients 
  ADD CONSTRAINT patients_user_id_key UNIQUE (user_id);