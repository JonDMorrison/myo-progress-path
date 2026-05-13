-- Allow therapists to send rich feedback (and the matching notification) to
-- patients they can SEE but are not formally assigned to.
--
-- Context: migration 20260409120000_therapists_see_unassigned_patients.sql
-- widened SELECT on patients/messages/uploads/patient_week_progress so that
-- unassigned patient submissions show up in Needs Review. That migration
-- intentionally did NOT widen writes — but that left a broken loop:
-- Sam can OPEN a submission from an unassigned patient (READ permitted),
-- but every attempt to send rich feedback fails because the
-- therapist_feedback INSERT policy still requires
-- `assigned_therapist_id = auth.uid() OR admin/super_admin`. The follow-up
-- notifications INSERT has the same problem, and additionally only allows
-- 'admin' (omits 'super_admin').
--
-- Fix: replace both INSERT policies so they accept any staff user
-- (therapist / admin / super_admin) writing for a patient that is either
-- assigned to them OR unassigned. Patients assigned to a *different*
-- therapist are still blocked.

-- ───── therapist_feedback INSERT ─────
DROP POLICY IF EXISTS "Therapists can create feedback for their patients"
  ON public.therapist_feedback;

CREATE POLICY "Staff can create feedback for own or unassigned patients"
ON public.therapist_feedback
FOR INSERT
WITH CHECK (
  auth.uid() = therapist_id
  AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('therapist', 'admin', 'super_admin')
  )
  AND EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id
      AND (
        p.assigned_therapist_id = auth.uid()
        OR p.assigned_therapist_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.users u2
          WHERE u2.id = auth.uid()
            AND u2.role IN ('admin', 'super_admin')
        )
      )
  )
);

-- ───── notifications INSERT ─────
DROP POLICY IF EXISTS "Therapists can insert notifications" ON public.notifications;

CREATE POLICY "Staff can insert notifications for own or unassigned patients"
ON public.notifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('therapist', 'admin', 'super_admin')
  )
  AND EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = notifications.patient_id
      AND (
        p.assigned_therapist_id = auth.uid()
        OR p.assigned_therapist_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.users u2
          WHERE u2.id = auth.uid()
            AND u2.role IN ('admin', 'super_admin')
        )
      )
  )
);
