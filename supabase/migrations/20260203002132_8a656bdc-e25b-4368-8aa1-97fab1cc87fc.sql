-- Update patients_staff policy to include super_admin role
DROP POLICY IF EXISTS "patients_staff" ON patients;

CREATE POLICY "patients_staff" ON patients
FOR SELECT
USING (
  (EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND u.role IN ('therapist', 'admin', 'super_admin')
  ))
  AND (
    assigned_therapist_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid() 
      AND u2.role IN ('admin', 'super_admin')
    )
  )
);