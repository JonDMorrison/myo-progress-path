-- Create a security definer function to check if a user is also a patient
-- This is used for dual-role access where a therapist can view their own patient data
CREATE OR REPLACE FUNCTION public.is_own_patient_record(_patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.patients
    WHERE id = _patient_id
      AND user_id = auth.uid()
  )
$$;

-- Update patient_week_progress RLS to allow self-access for dual-role users
-- Drop and recreate the patient RW policy to be more explicit
DROP POLICY IF EXISTS "pwp_patient_rw" ON public.patient_week_progress;

CREATE POLICY "pwp_patient_rw" 
ON public.patient_week_progress 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = patient_week_progress.patient_id 
    AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = patient_week_progress.patient_id 
    AND p.user_id = auth.uid()
  )
);

-- Update uploads RLS to allow self-access for dual-role users
DROP POLICY IF EXISTS "upl_patient_rw" ON public.uploads;

CREATE POLICY "upl_patient_rw" 
ON public.uploads 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = uploads.patient_id 
    AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = uploads.patient_id 
    AND p.user_id = auth.uid()
  )
);

-- Update messages RLS to allow self-access for dual-role users
DROP POLICY IF EXISTS "msg_patient_rw" ON public.messages;

CREATE POLICY "msg_patient_rw" 
ON public.messages 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = messages.patient_id 
    AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = messages.patient_id 
    AND p.user_id = auth.uid()
  )
);

-- Update patients RLS to allow therapists to see themselves as patients
DROP POLICY IF EXISTS "patients_self" ON public.patients;

CREATE POLICY "patients_self" 
ON public.patients 
FOR SELECT 
USING (user_id = auth.uid());