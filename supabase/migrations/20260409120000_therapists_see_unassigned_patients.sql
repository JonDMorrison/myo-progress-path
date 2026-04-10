-- Harden patient onboarding: let therapists see patients that have no assigned_therapist_id.
--
-- Context: the DB trigger that creates patient records does not populate
-- assigned_therapist_id, so new patients land with a NULL therapist. The
-- existing RLS policies on patients/patient_week_progress/messages/uploads
-- gate access on `assigned_therapist_id = auth.uid()`, which is false for
-- NULL — so any submissions from unassigned patients become invisible to
-- every therapist. Des's submission is a recent example of a message that
-- silently vanished.
--
-- Fix: add read-only policies that also return rows when the patient has
-- no therapist assigned, so unassigned submissions show up in Needs Review
-- with an "Unassigned" flag instead of falling through the cracks. Writes
-- are intentionally NOT widened here — assignment must still happen through
-- the Master Patient List admin flow.

-- patients: therapists can SELECT unassigned patients
CREATE POLICY "patients_staff_unassigned_read" ON patients
FOR SELECT
USING (
  assigned_therapist_id IS NULL
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('therapist', 'admin', 'super_admin')
  )
);

-- patient_week_progress: therapists can SELECT rows for unassigned patients
CREATE POLICY "pwp_staff_unassigned_read" ON patient_week_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = patient_week_progress.patient_id
    AND p.assigned_therapist_id IS NULL
  )
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('therapist', 'admin', 'super_admin')
  )
);

-- messages: therapists can SELECT messages for unassigned patients
CREATE POLICY "msg_staff_unassigned_read" ON messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = messages.patient_id
    AND p.assigned_therapist_id IS NULL
  )
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('therapist', 'admin', 'super_admin')
  )
);

-- uploads: therapists can SELECT uploads for unassigned patients
CREATE POLICY "upl_staff_unassigned_read" ON uploads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = uploads.patient_id
    AND p.assigned_therapist_id IS NULL
  )
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('therapist', 'admin', 'super_admin')
  )
);
