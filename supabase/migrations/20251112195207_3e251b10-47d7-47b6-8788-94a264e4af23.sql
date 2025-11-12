-- Function to auto-initialize exercise_completions when a patient_week_progress record is created
CREATE OR REPLACE FUNCTION public.init_exercise_completions()
RETURNS TRIGGER AS $$
DECLARE
  exercise_record RECORD;
  completions JSONB := '{}'::JSONB;
BEGIN
  -- Only initialize if exercise_completions is empty
  IF NEW.exercise_completions = '{}'::JSONB OR NEW.exercise_completions IS NULL THEN
    -- Get all exercises for this week
    FOR exercise_record IN 
      SELECT id FROM public.exercises WHERE week_id = NEW.week_id
    LOOP
      completions := completions || jsonb_build_object(exercise_record.id::text, 0);
    END LOOP;
    
    -- Set the initial completions
    NEW.exercise_completions := completions;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-initialize exercise_completions
DROP TRIGGER IF EXISTS init_exercise_completions_trigger ON public.patient_week_progress;

CREATE TRIGGER init_exercise_completions_trigger
  BEFORE INSERT ON public.patient_week_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.init_exercise_completions();