
-- Allow patients to update their own consent fields
CREATE POLICY "Patients can update their own consent"
ON public.patients
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'patient'
    AND patients.user_id = u.id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'patient'
    AND patients.user_id = u.id
  )
);
