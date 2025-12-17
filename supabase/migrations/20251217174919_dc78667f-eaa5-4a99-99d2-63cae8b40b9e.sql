-- Create table for clinical testing feedback
CREATE TABLE public.clinical_testing_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_name text,
  tester_email text,
  checklist_state jsonb DEFAULT '{}'::jsonb,
  patient_notes text,
  therapist_notes text,
  bugs_notes text,
  clinical_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clinical_testing_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can insert feedback (public testing page)
CREATE POLICY "Anyone can insert feedback"
ON public.clinical_testing_feedback
FOR INSERT
WITH CHECK (true);

-- Anyone can update their own feedback (by matching tester_email)
CREATE POLICY "Testers can update own feedback"
ON public.clinical_testing_feedback
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Super admins can view all feedback
CREATE POLICY "Super admins can view all feedback"
ON public.clinical_testing_feedback
FOR SELECT
USING (is_super_admin());

-- Super admins can delete feedback
CREATE POLICY "Super admins can delete feedback"
ON public.clinical_testing_feedback
FOR DELETE
USING (is_super_admin());