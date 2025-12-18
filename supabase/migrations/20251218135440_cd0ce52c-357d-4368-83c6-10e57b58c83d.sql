-- Add learn_hub_reviewed column to patient_week_progress
ALTER TABLE public.patient_week_progress 
ADD COLUMN learn_hub_reviewed boolean DEFAULT false;

-- Update calc_week_progress function to include learn_hub_reviewed for Week 1
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
BEGIN
  -- Get week details
  SELECT * INTO week_record FROM weeks WHERE id = _week_id;
  
  -- Get patient details for program variant check
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
  
  -- Check frenectomy consult for Week 1 frenectomy pathway only
  IF week_record.number = 1 AND patient_record.program_variant = 'frenectomy' THEN
    total_required := total_required + 1;
    IF progress_record.frenectomy_consult_booked = true THEN
      completed_count := completed_count + 1;
    ELSE
      missing_items := array_append(missing_items, 'Frenectomy consult booked');
    END IF;
  END IF;
  
  -- Check learn hub reviewed for Week 1 (all pathways)
  IF week_record.number = 1 THEN
    total_required := total_required + 1;
    IF progress_record.learn_hub_reviewed = true THEN
      completed_count := completed_count + 1;
    ELSE
      missing_items := array_append(missing_items, 'Learning Hub reviewed');
    END IF;
  END IF;
  
  -- Calculate percentage
  IF total_required > 0 THEN
    percent_complete := (completed_count * 100) / total_required;
  END IF;
  
  RETURN jsonb_build_object(
    'percent_complete', percent_complete,
    'missing', missing_items,
    'completed_count', completed_count,
    'total_required', total_required
  );
END;
$function$;