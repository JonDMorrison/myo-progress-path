-- Create onboarding_progress table to track wizard completion
CREATE TABLE public.onboarding_progress (
  patient_id UUID PRIMARY KEY REFERENCES public.patients(id) ON DELETE CASCADE,
  completed_steps JSONB DEFAULT '[]'::jsonb,
  current_step TEXT DEFAULT 'welcome',
  completed_at TIMESTAMP WITH TIME ZONE,
  skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Patients can view and update their own onboarding progress
CREATE POLICY "Patients can view their own onboarding progress"
ON public.onboarding_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = onboarding_progress.patient_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Patients can update their own onboarding progress"
ON public.onboarding_progress
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = onboarding_progress.patient_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Patients can insert their own onboarding progress"
ON public.onboarding_progress
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = onboarding_progress.patient_id 
    AND p.user_id = auth.uid()
  )
);

-- Staff can view onboarding progress
CREATE POLICY "Staff can view onboarding progress"
ON public.onboarding_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND u.role IN ('therapist', 'admin')
  )
);

-- Super admins have full access
CREATE POLICY "onboarding_super_all"
ON public.onboarding_progress
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Create index for faster lookups
CREATE INDEX idx_onboarding_patient ON public.onboarding_progress(patient_id);