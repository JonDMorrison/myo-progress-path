-- Create view for weekly metrics
CREATE OR REPLACE VIEW v_weekly_metrics AS
SELECT 
  p.assigned_therapist_id,
  pw.patient_id,
  p.user_id as patient_user_id,
  u.name as patient_name,
  u.email as patient_email,
  p.program_variant,
  w.number as week_number,
  w.id as week_id,
  pw.status,
  pw.completed_at,
  pw.bolt_score,
  pw.nasal_breathing_pct,
  pw.tongue_on_spot_pct,
  pw.id as progress_id
FROM patient_week_progress pw
JOIN weeks w ON w.id = pw.week_id
JOIN patients p ON p.id = pw.patient_id
JOIN users u ON u.id = p.user_id;

-- Grant access to view
GRANT SELECT ON v_weekly_metrics TO authenticated;

-- Create RPC function to get adherence metrics
CREATE OR REPLACE FUNCTION get_adherence_metrics(
  _therapist_id UUID DEFAULT NULL,
  _patient_ids UUID[] DEFAULT NULL,
  _start_date TIMESTAMPTZ DEFAULT NULL,
  _end_date TIMESTAMPTZ DEFAULT NULL,
  _program_variant program_variant DEFAULT NULL
)
RETURNS TABLE (
  week_number INTEGER,
  avg_nasal_pct NUMERIC,
  avg_tongue_pct NUMERIC,
  total_patients BIGINT,
  completed_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vm.week_number,
    ROUND(AVG(vm.nasal_breathing_pct), 1) as avg_nasal_pct,
    ROUND(AVG(vm.tongue_on_spot_pct), 1) as avg_tongue_pct,
    COUNT(DISTINCT vm.patient_id) as total_patients,
    COUNT(*) FILTER (WHERE vm.status = 'approved') as completed_count
  FROM v_weekly_metrics vm
  WHERE 
    (_therapist_id IS NULL OR vm.assigned_therapist_id = _therapist_id)
    AND (_patient_ids IS NULL OR vm.patient_id = ANY(_patient_ids))
    AND (_start_date IS NULL OR vm.completed_at >= _start_date)
    AND (_end_date IS NULL OR vm.completed_at <= _end_date)
    AND (_program_variant IS NULL OR vm.program_variant = _program_variant)
    AND vm.status IN ('submitted', 'approved', 'needs_more')
  GROUP BY vm.week_number
  ORDER BY vm.week_number;
END;
$$;

-- Create RPC function to get BOLT trends
CREATE OR REPLACE FUNCTION get_bolt_trends(
  _therapist_id UUID DEFAULT NULL,
  _patient_ids UUID[] DEFAULT NULL,
  _start_date TIMESTAMPTZ DEFAULT NULL,
  _end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  week_number INTEGER,
  avg_bolt NUMERIC,
  min_bolt INTEGER,
  max_bolt INTEGER,
  sample_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vm.week_number,
    ROUND(AVG(vm.bolt_score), 1) as avg_bolt,
    MIN(vm.bolt_score) as min_bolt,
    MAX(vm.bolt_score) as max_bolt,
    COUNT(*) as sample_count
  FROM v_weekly_metrics vm
  WHERE 
    vm.bolt_score IS NOT NULL
    AND (_therapist_id IS NULL OR vm.assigned_therapist_id = _therapist_id)
    AND (_patient_ids IS NULL OR vm.patient_id = ANY(_patient_ids))
    AND (_start_date IS NULL OR vm.completed_at >= _start_date)
    AND (_end_date IS NULL OR vm.completed_at <= _end_date)
  GROUP BY vm.week_number
  ORDER BY vm.week_number;
END;
$$;

-- Create RPC function to get week status distribution
CREATE OR REPLACE FUNCTION get_week_status_distribution(
  _therapist_id UUID DEFAULT NULL,
  _patient_ids UUID[] DEFAULT NULL,
  _start_date TIMESTAMPTZ DEFAULT NULL,
  _end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  status week_status,
  count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vm.status,
    COUNT(*) as count
  FROM v_weekly_metrics vm
  WHERE 
    (_therapist_id IS NULL OR vm.assigned_therapist_id = _therapist_id)
    AND (_patient_ids IS NULL OR vm.patient_id = ANY(_patient_ids))
    AND (_start_date IS NULL OR vm.completed_at >= _start_date)
    AND (_end_date IS NULL OR vm.completed_at <= _end_date)
  GROUP BY vm.status
  ORDER BY vm.status;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_adherence_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_bolt_trends TO authenticated;
GRANT EXECUTE ON FUNCTION get_week_status_distribution TO authenticated;