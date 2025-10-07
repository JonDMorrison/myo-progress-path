-- Step 2: Create helper function and RLS policies

-- Create helper function to check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() AND u.role = 'super_admin'
  );
$$;

-- Add RLS policies for super_admin

-- Users table
DROP POLICY IF EXISTS users_super_read ON users;
CREATE POLICY users_super_read ON users
FOR SELECT USING (is_super_admin());

DROP POLICY IF EXISTS users_super_update ON users;
CREATE POLICY users_super_update ON users
FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());

-- Patients table
DROP POLICY IF EXISTS patients_super_all ON patients;
CREATE POLICY patients_super_all ON patients
FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- Patient week progress
DROP POLICY IF EXISTS pwp_super_all ON patient_week_progress;
CREATE POLICY pwp_super_all ON patient_week_progress
FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- Messages
DROP POLICY IF EXISTS msg_super_all ON messages;
CREATE POLICY msg_super_all ON messages
FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- Uploads
DROP POLICY IF EXISTS upl_super_all ON uploads;
CREATE POLICY upl_super_all ON uploads
FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- Events
DROP POLICY IF EXISTS evt_super_all ON events;
CREATE POLICY evt_super_all ON events
FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- Clinics
DROP POLICY IF EXISTS clinics_super_read ON clinics;
CREATE POLICY clinics_super_read ON clinics
FOR SELECT USING (is_super_admin());

-- Notifications
DROP POLICY IF EXISTS notif_super_all ON notifications;
CREATE POLICY notif_super_all ON notifications
FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- Gamification stats
DROP POLICY IF EXISTS gamif_super_read ON gamification_stats;
CREATE POLICY gamif_super_read ON gamification_stats
FOR SELECT USING (is_super_admin());

-- Earned badges
DROP POLICY IF EXISTS badges_super_read ON earned_badges;
CREATE POLICY badges_super_read ON earned_badges
FOR SELECT USING (is_super_admin());

-- Challenge progress
DROP POLICY IF EXISTS challenge_progress_super_read ON challenge_progress;
CREATE POLICY challenge_progress_super_read ON challenge_progress
FOR SELECT USING (is_super_admin());

-- Create view for master admin patient listing
CREATE OR REPLACE VIEW v_master_patient_list AS
SELECT 
  p.id as patient_id,
  p.user_id,
  p.status as patient_status,
  p.program_variant,
  p.created_at as enrolled_at,
  u.name as patient_name,
  u.email as patient_email,
  c.id as clinic_id,
  c.name as clinic_name,
  t.id as therapist_id,
  t.name as therapist_name,
  t.email as therapist_email,
  (
    SELECT w.number 
    FROM patient_week_progress pwp
    JOIN weeks w ON w.id = pwp.week_id
    WHERE pwp.patient_id = p.id
    ORDER BY w.number DESC
    LIMIT 1
  ) as current_week_number,
  (
    SELECT pwp.status 
    FROM patient_week_progress pwp
    JOIN weeks w ON w.id = pwp.week_id
    WHERE pwp.patient_id = p.id
    ORDER BY w.number DESC
    LIMIT 1
  ) as current_week_status,
  (
    SELECT MAX(pwp.completed_at)
    FROM patient_week_progress pwp
    WHERE pwp.patient_id = p.id
  ) as last_activity,
  (
    SELECT ROUND(AVG(CASE WHEN pwp.status = 'approved' THEN 100 ELSE 0 END))
    FROM patient_week_progress pwp
    WHERE pwp.patient_id = p.id
    AND pwp.completed_at >= NOW() - INTERVAL '14 days'
  ) as adherence_14d
FROM patients p
JOIN users u ON u.id = p.user_id
JOIN clinics c ON c.id = p.clinic_id
LEFT JOIN users t ON t.id = p.assigned_therapist_id;