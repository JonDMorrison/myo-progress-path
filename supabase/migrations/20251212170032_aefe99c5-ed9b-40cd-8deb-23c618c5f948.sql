-- 1. Add 'standard' to program_variant enum
ALTER TYPE program_variant ADD VALUE IF NOT EXISTS 'standard';

-- 2. Create ai_feedback_status enum
DO $$ BEGIN
  CREATE TYPE ai_feedback_status AS ENUM ('pending', 'complete', 'error');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Add ai_feedback_status column to uploads table
ALTER TABLE uploads 
ADD COLUMN IF NOT EXISTS ai_feedback_status ai_feedback_status DEFAULT NULL;

-- 4. Create function to trigger AI analysis (fire-and-forget via pg_net)
CREATE OR REPLACE FUNCTION public.trigger_ai_video_analysis()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only trigger if ai_feedback is null (not already analyzed)
  IF NEW.ai_feedback IS NULL AND NEW.file_url IS NOT NULL THEN
    -- Set status to pending
    NEW.ai_feedback_status := 'pending';
    
    -- Fire-and-forget HTTP call to analyze-video edge function
    BEGIN
      PERFORM net.http_post(
        url := current_setting('app.settings.supabase_url', true) || '/functions/v1/analyze-video',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key', true)
        ),
        body := jsonb_build_object('uploadId', NEW.id::text)
      );
    EXCEPTION WHEN OTHERS THEN
      -- Log failure but don't block the insert
      RAISE NOTICE 'AI analysis trigger failed: %', SQLERRM;
      NEW.ai_feedback_status := 'error';
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 5. Create trigger on uploads table
DROP TRIGGER IF EXISTS trigger_ai_analysis_on_upload ON uploads;
CREATE TRIGGER trigger_ai_analysis_on_upload
  BEFORE INSERT ON uploads
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_ai_video_analysis();

-- 6. Add index for faster status queries
CREATE INDEX IF NOT EXISTS idx_uploads_ai_feedback_status ON uploads(ai_feedback_status);