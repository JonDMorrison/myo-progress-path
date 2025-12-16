-- Update the init_exercise_completions trigger to be more robust
-- and to clean up stale exercise IDs

CREATE OR REPLACE FUNCTION public.init_exercise_completions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  exercise_record RECORD;
  completions JSONB := '{}'::JSONB;
BEGIN
  -- Always rebuild exercise_completions from current week's exercises
  -- This ensures no orphaned/stale exercise IDs remain
  FOR exercise_record IN 
    SELECT id FROM public.exercises WHERE week_id = NEW.week_id
  LOOP
    -- Preserve existing completion count if exercise still exists, otherwise start at 0
    IF NEW.exercise_completions IS NOT NULL AND NEW.exercise_completions ? exercise_record.id::text THEN
      completions := completions || jsonb_build_object(exercise_record.id::text, (NEW.exercise_completions->>(exercise_record.id::text))::int);
    ELSE
      completions := completions || jsonb_build_object(exercise_record.id::text, 0);
    END IF;
  END LOOP;
  
  -- Set the cleaned completions (only current week's exercises)
  NEW.exercise_completions := completions;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for both INSERT and UPDATE to keep exercise_completions clean
DROP TRIGGER IF EXISTS init_exercise_completions_trigger ON patient_week_progress;

CREATE TRIGGER init_exercise_completions_trigger
  BEFORE INSERT OR UPDATE ON patient_week_progress
  FOR EACH ROW
  EXECUTE FUNCTION init_exercise_completions();

-- Clean up existing stale exercise_completions data
-- This updates all existing records to only include valid exercise IDs for their week
UPDATE patient_week_progress pwp
SET exercise_completions = (
  SELECT COALESCE(
    jsonb_object_agg(
      e.id::text, 
      COALESCE((pwp.exercise_completions->>(e.id::text))::int, 0)
    ),
    '{}'::jsonb
  )
  FROM exercises e
  WHERE e.week_id = pwp.week_id
)
WHERE exercise_completions IS NOT NULL AND exercise_completions != '{}'::jsonb;