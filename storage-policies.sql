-- Storage Bucket Policies for patient-videos
-- Run this in Supabase SQL Editor

-- Policy 1: Patients can upload videos to their own folder
CREATE POLICY "Patients can upload their own videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'patient-videos' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM public.patients WHERE user_id = auth.uid()
  )
);

-- Policy 2: Patients can view their own videos
CREATE POLICY "Patients can view their own videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'patient-videos' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM public.patients WHERE user_id = auth.uid()
  )
);

-- Policy 3: Patients can delete their own videos
CREATE POLICY "Patients can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'patient-videos' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM public.patients WHERE user_id = auth.uid()
  )
);

-- Policy 4: Therapists and admins can view all videos
CREATE POLICY "Therapists can view all patient videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'patient-videos' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('therapist', 'super_admin')
  )
);

-- Success message
SELECT 'Storage policies created successfully!' as message;
