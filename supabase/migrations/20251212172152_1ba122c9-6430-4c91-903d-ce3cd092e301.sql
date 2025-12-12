-- Add dedicated reviewing_by column for concurrent reviewer tracking
-- This avoids conflicts with ai_summary field

ALTER TABLE public.patient_week_progress 
ADD COLUMN IF NOT EXISTS reviewing_by uuid REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS reviewing_since timestamptz;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_pwp_reviewing ON public.patient_week_progress(reviewing_by) WHERE reviewing_by IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.patient_week_progress.reviewing_by IS 'ID of therapist currently reviewing this submission';
COMMENT ON COLUMN public.patient_week_progress.reviewing_since IS 'When the review lock started, auto-releases after 30 minutes';

-- Create function to auto-release stale review locks
CREATE OR REPLACE FUNCTION public.release_stale_review_locks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE patient_week_progress
  SET reviewing_by = NULL, reviewing_since = NULL
  WHERE reviewing_since < NOW() - INTERVAL '30 minutes';
END;
$$;