-- Add completion_note field to patients table for therapist-written program completion notes
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS completion_note TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add comment explaining the field
COMMENT ON COLUMN public.patients.completion_note IS 'Therapist-written personalized completion note emphasizing habit awareness, long-term carryover, and self-monitoring';
COMMENT ON COLUMN public.patients.completed_at IS 'Timestamp when the program was officially completed (final module approved)';