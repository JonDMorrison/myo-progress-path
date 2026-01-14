-- Fix therapist-feedback storage SELECT policy so patients can access attachments
-- Historical uploads used patient_id folder, while newer uploads should use patient user_id folder.
-- This policy allows both patterns for the logged-in patient.

DROP POLICY IF EXISTS "Therapists and patients can view feedback media" ON storage.objects;

CREATE POLICY "Therapists and patients can view feedback media"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'therapist-feedback'
  AND (
    -- Therapists/admins can view all feedback media
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('therapist', 'admin', 'super_admin')
    )
    OR
    -- Patients can view their own feedback attachments when folder is their patient_id
    EXISTS (
      SELECT 1
      FROM public.patients p
      WHERE p.user_id = auth.uid()
        AND p.id::text = (storage.foldername(name))[1]
    )
    OR
    -- Patients can view their own feedback attachments when folder is their user_id
    auth.uid()::text = (storage.foldername(name))[1]
  )
);