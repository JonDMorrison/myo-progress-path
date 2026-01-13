-- Add 'maintenance' to patient_status enum
ALTER TYPE public.patient_status ADD VALUE IF NOT EXISTS 'maintenance';

-- Create maintenance_assignments table for therapist-directed ongoing work
CREATE TABLE public.maintenance_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  week_id UUID NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dismissed')),
  notes TEXT,
  completed_at TIMESTAMPTZ
);

-- Create maintenance_checkins table for patient self-monitoring
CREATE TABLE public.maintenance_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  nasal_breathing_percent INTEGER CHECK (nasal_breathing_percent >= 0 AND nasal_breathing_percent <= 100),
  tongue_on_spot_percent INTEGER CHECK (tongue_on_spot_percent >= 0 AND tongue_on_spot_percent <= 100),
  bolt_score INTEGER CHECK (bolt_score >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.maintenance_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_checkins ENABLE ROW LEVEL SECURITY;

-- RLS policies for maintenance_assignments
-- Patients can view their own assignments
CREATE POLICY "Patients can view own assignments"
ON public.maintenance_assignments
FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
);

-- Therapists/admins can view assignments for their patients
CREATE POLICY "Therapists can view patient assignments"
ON public.maintenance_assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('therapist', 'admin', 'super_admin')
  )
);

-- Therapists/admins can create assignments
CREATE POLICY "Therapists can create assignments"
ON public.maintenance_assignments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('therapist', 'admin', 'super_admin')
  )
);

-- Therapists/admins can update assignments
CREATE POLICY "Therapists can update assignments"
ON public.maintenance_assignments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('therapist', 'admin', 'super_admin')
  )
);

-- Patients can update their own assignments (to mark complete)
CREATE POLICY "Patients can update own assignments"
ON public.maintenance_assignments
FOR UPDATE
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
);

-- RLS policies for maintenance_checkins
-- Patients can view their own check-ins
CREATE POLICY "Patients can view own checkins"
ON public.maintenance_checkins
FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
);

-- Patients can create their own check-ins
CREATE POLICY "Patients can create own checkins"
ON public.maintenance_checkins
FOR INSERT
WITH CHECK (
  patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
);

-- Therapists/admins can view all check-ins
CREATE POLICY "Therapists can view all checkins"
ON public.maintenance_checkins
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('therapist', 'admin', 'super_admin')
  )
);

-- Create indexes for performance
CREATE INDEX idx_maintenance_assignments_patient ON public.maintenance_assignments(patient_id);
CREATE INDEX idx_maintenance_assignments_status ON public.maintenance_assignments(status);
CREATE INDEX idx_maintenance_checkins_patient ON public.maintenance_checkins(patient_id);
CREATE INDEX idx_maintenance_checkins_date ON public.maintenance_checkins(checkin_date);