-- Add consent fields to patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS consent_payload JSONB;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS consent_signature TEXT;

-- Add thumbnail failure tracking to uploads
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS thumb_failed BOOLEAN DEFAULT FALSE;

-- Add consent settings to app_settings
INSERT INTO app_settings (key, value)
VALUES ('consent_latest', '{"version": "1.0", "md": "# Consent to Treatment\n\nI understand and agree to participate in the myofunctional therapy program."}')
ON CONFLICT (key) DO NOTHING;

-- Create function to calculate week progress
CREATE OR REPLACE FUNCTION calc_week_progress(
  _patient_id UUID,
  _week_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  progress_record RECORD;
  week_record RECORD;
  missing_items TEXT[] := ARRAY[]::TEXT[];
  percent_complete INTEGER := 0;
  total_required INTEGER := 0;
  completed_count INTEGER := 0;
  upload_count INTEGER;
BEGIN
  -- Get week details
  SELECT * INTO week_record FROM weeks WHERE id = _week_id;
  
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
  
  -- Check video uploads if required (and premium enabled)
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
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION calc_week_progress TO authenticated;