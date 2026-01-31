-- Migration: therapist_dashboard_fixes
-- Description: Adds AI summary and review tracking columns, and updates progress calculation RPC

-- Add columns for AI summary and therapist review locking
ALTER TABLE public.patient_week_progress ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE public.patient_week_progress ADD COLUMN IF NOT EXISTS reviewing_by UUID REFERENCES auth.users(id);
ALTER TABLE public.patient_week_progress ADD COLUMN IF NOT EXISTS reviewing_since TIMESTAMP WITH TIME ZONE;

-- Update the calc_week_progress function to include detailed exercise tracking
CREATE OR REPLACE FUNCTION public.calc_week_progress(_patient_id uuid, _week_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  progress_record RECORD;
  week_record RECORD;
  patient_record RECORD;
  missing_items TEXT[] := ARRAY[]::TEXT[];
  percent_complete INTEGER := 0;
  total_required INTEGER := 0;
  completed_count INTEGER := 0;
  upload_count INTEGER;
  exercise_completions_json JSONB;
  exercise_record RECORD;
  target_met BOOLEAN;
BEGIN
  -- Get week details
  SELECT * INTO week_record FROM weeks WHERE id = _week_id;
  
  -- Get patient details
  SELECT * INTO patient_record FROM patients WHERE id = _patient_id;
  
  -- Get progress
  SELECT * INTO progress_record 
  FROM patient_week_progress 
  WHERE patient_id = _patient_id AND week_id = _week_id;
  
  IF progress_record IS NULL THEN
    RETURN jsonb_build_object(
      'percent_complete', 0,
      'missing', ARRAY['Progress not started']
    );
  END IF;

  exercise_completions_json := progress_record.exercise_completions;
  
  -- Check BOLT if required
  IF week_record.requires_bolt THEN
    total_required := total_required + 1;
    IF progress_record.bolt_score IS NOT NULL AND progress_record.bolt_score > 0 THEN
      completed_count := completed_count + 1;
    ELSE
      missing_items := array_append(missing_items, 'BOLT score');
    END IF;
  END IF;
  
  -- Check nasal breathing %
  total_required := total_required + 1;
  IF progress_record.nasal_breathing_pct IS NOT NULL AND progress_record.nasal_breathing_pct >= 0 THEN
    completed_count := completed_count + 1;
  ELSE
    missing_items := array_append(missing_items, '% Nasal Breathing');
  END IF;
  
  -- Check tongue on spot %
  total_required := total_required + 1;
  IF progress_record.tongue_on_spot_pct IS NOT NULL AND progress_record.tongue_on_spot_pct >= 0 THEN
    completed_count := completed_count + 1;
  ELSE
    missing_items := array_append(missing_items, '% Tongue on Spot');
  END IF;
  
  -- Check video uploads if required
  IF week_record.requires_video_first THEN
    total_required := total_required + 1;
    SELECT COUNT(*) INTO upload_count 
    FROM uploads 
    WHERE patient_id = _patient_id 
    AND week_id = _week_id 
    AND kind = 'first_attempt';
    
    IF upload_count > 0 THEN
      completed_count := completed_count + 1;
    ELSE
      missing_items := array_append(missing_items, 'First attempt video');
    END IF;
  END IF;
  
  IF week_record.requires_video_last THEN
    total_required := total_required + 1;
    SELECT COUNT(*) INTO upload_count 
    FROM uploads 
    WHERE patient_id = _patient_id 
    AND week_id = _week_id 
    AND kind = 'last_attempt';
    
    IF upload_count > 0 THEN
      completed_count := completed_count + 1;
    ELSE
      missing_items := array_append(missing_items, 'Last attempt video');
    END IF;
  END IF;
  
  -- Check frenectomy consult for Week 1 frenectomy pathway
  IF week_record.number = 1 AND patient_record.program_variant = 'frenectomy' THEN
    total_required := total_required + 1;
    IF progress_record.frenectomy_consult_booked = true THEN
      completed_count := completed_count + 1;
    ELSE
      missing_items := array_append(missing_items, 'Frenectomy consult booked');
    END IF;
  END IF;
  
  -- Check learn hub
  IF week_record.number = 1 THEN
    total_required := total_required + 1;
    IF progress_record.learn_hub_reviewed = true THEN
      completed_count := completed_count + 1;
    ELSE
      missing_items := array_append(missing_items, 'Learning Hub reviewed');
    END IF;
  END IF;

  -- NEW: Check all exercises for this week
  FOR exercise_record IN SELECT id, title, completion_target FROM exercises WHERE week_id = _week_id LOOP
    -- Only count as a requirement if target > 0
    IF exercise_record.completion_target > 0 THEN
      total_required := total_required + 1;
      target_met := FALSE;
      
      IF exercise_completions_json ? exercise_record.id::text THEN
        IF (exercise_completions_json->>exercise_record.id::text)::int >= exercise_record.completion_target THEN
          target_met := TRUE;
        END IF;
      END IF;
      
      IF target_met THEN
        completed_count := completed_count + 1;
      ELSE
        missing_items := array_append(missing_items, 'Exercise: ' || exercise_record.title || ' (' || COALESCE((exercise_completions_json->>exercise_record.id::text)::text, '0') || '/' || exercise_record.completion_target || ')');
      END IF;
    END IF;
  END LOOP;
  
  -- Calculate percentage
  IF total_required > 0 THEN
    percent_complete := (completed_count * 100) / total_required;
  ELSE
    percent_complete := 100;
  END IF;
  
  RETURN jsonb_build_object(
    'percent_complete', percent_complete,
    'missing', missing_items,
    'completed_count', completed_count,
    'total_required', total_required
  );
END;
$function$;
