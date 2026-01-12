-- Create therapist_feedback table for rich feedback with attachments
CREATE TABLE public.therapist_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  week_id UUID REFERENCES public.weeks(id) ON DELETE SET NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  progress_id UUID REFERENCES public.patient_week_progress(id) ON DELETE SET NULL,
  feedback_text TEXT,
  video_url TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.therapist_feedback ENABLE ROW LEVEL SECURITY;

-- Therapists can create feedback for their assigned patients
CREATE POLICY "Therapists can create feedback for their patients"
ON public.therapist_feedback
FOR INSERT
WITH CHECK (
  auth.uid() = therapist_id AND
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id
    AND (p.assigned_therapist_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin')))
  )
);

-- Therapists can view feedback they created
CREATE POLICY "Therapists can view feedback they created"
ON public.therapist_feedback
FOR SELECT
USING (
  therapist_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin'))
);

-- Patients can view feedback addressed to them
CREATE POLICY "Patients can view their own feedback"
ON public.therapist_feedback
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id
    AND p.user_id = auth.uid()
  )
);

-- Patients can update read_at for their feedback
CREATE POLICY "Patients can mark feedback as read"
ON public.therapist_feedback
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id
    AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id
    AND p.user_id = auth.uid()
  )
);

-- Therapists can update their own feedback
CREATE POLICY "Therapists can update their own feedback"
ON public.therapist_feedback
FOR UPDATE
USING (therapist_id = auth.uid())
WITH CHECK (therapist_id = auth.uid());

-- Therapists can delete their own feedback
CREATE POLICY "Therapists can delete their own feedback"
ON public.therapist_feedback
FOR DELETE
USING (therapist_id = auth.uid());

-- Create storage bucket for therapist feedback media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('therapist-feedback', 'therapist-feedback', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Therapists can upload to therapist-feedback bucket
CREATE POLICY "Therapists can upload feedback media"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'therapist-feedback' AND
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('therapist', 'admin', 'super_admin'))
);

-- Storage policy: Therapists and patients can view feedback media
CREATE POLICY "Therapists and patients can view feedback media"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'therapist-feedback' AND
  (
    -- Therapists can view all
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('therapist', 'admin', 'super_admin'))
    OR
    -- Patients can view their own feedback attachments (path contains patient_id)
    auth.uid()::text = (storage.foldername(name))[1]
  )
);

-- Create index for faster queries
CREATE INDEX idx_therapist_feedback_patient_id ON public.therapist_feedback(patient_id);
CREATE INDEX idx_therapist_feedback_week_id ON public.therapist_feedback(week_id);
CREATE INDEX idx_therapist_feedback_created_at ON public.therapist_feedback(created_at DESC);

-- Enable realtime for therapist_feedback
ALTER PUBLICATION supabase_realtime ADD TABLE public.therapist_feedback;