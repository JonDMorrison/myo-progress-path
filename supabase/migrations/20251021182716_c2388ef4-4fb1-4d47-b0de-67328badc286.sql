-- Add frequency, duration, and completion tracking to exercises table
ALTER TABLE exercises 
ADD COLUMN frequency text,
ADD COLUMN duration text,
ADD COLUMN completion_target integer DEFAULT 0;

-- Add frenectomy consultation and exercise completion tracking to patient_week_progress
ALTER TABLE patient_week_progress
ADD COLUMN frenectomy_consult_booked boolean DEFAULT false,
ADD COLUMN exercise_completions jsonb DEFAULT '{}'::jsonb;

-- Add comments for clarity
COMMENT ON COLUMN exercises.frequency IS 'How often per day (e.g., "2x/day", "1x/day")';
COMMENT ON COLUMN exercises.duration IS 'Duration per session (e.g., "2 minutes", "5 minutes")';
COMMENT ON COLUMN exercises.completion_target IS 'Total completions required over the week period (e.g., 28 for active exercises done 2x/day for 14 days)';
COMMENT ON COLUMN patient_week_progress.exercise_completions IS 'Tracks daily completion count for each exercise by exercise_id: {"exercise_id": count}';