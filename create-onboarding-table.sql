-- Create onboarding_progress table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  completed_steps text[] DEFAULT '{}',
  completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(patient_id)
);

-- Enable RLS
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Creating Policies so the App works automatically for every user

-- 1. Patients can view their own progress
CREATE POLICY "Patients can view own onboarding progress" ON public.onboarding_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE id = onboarding_progress.patient_id AND user_id = auth.uid()
    )
  );

-- 2. Patients can insert/create their progress (Start of onboarding)
CREATE POLICY "Patients can insert own onboarding progress" ON public.onboarding_progress
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE id = onboarding_progress.patient_id AND user_id = auth.uid()
    )
  );

-- 3. Patients can update their progress (Completing steps)
CREATE POLICY "Patients can update own onboarding progress" ON public.onboarding_progress
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE id = onboarding_progress.patient_id AND user_id = auth.uid()
    )
  );

-- 4. Therapists/Admins can view all (for debugging/monitoring)
CREATE POLICY "Therapists can view all onboarding" ON public.onboarding_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('therapist', 'super_admin')
    )
  );

-- Success Message
SELECT 'Onboarding table and policies created successfully' as message;
