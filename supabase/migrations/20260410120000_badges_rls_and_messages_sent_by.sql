-- 1. Ensure patients can read their own earned badges.
--    The policy may already exist from migration 20251007201330, but if it
--    was dropped or never applied to the live instance, this re-creates it.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'earned_badges'
      AND policyname = 'Patients can view their own earned badges'
  ) THEN
    CREATE POLICY "Patients can view their own earned badges"
    ON public.earned_badges FOR SELECT TO authenticated
    USING (
      patient_id IN (
        SELECT id FROM patients WHERE user_id = auth.uid()
      )
    );
  END IF;
END
$$;

-- 2. Ensure patients can insert their own earned badges (for client-side
--    badge grants when the edge function is unavailable).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'earned_badges'
      AND policyname = 'Patients can insert their own earned badges'
  ) THEN
    CREATE POLICY "Patients can insert their own earned badges"
    ON public.earned_badges FOR INSERT TO authenticated
    WITH CHECK (
      patient_id IN (
        SELECT id FROM patients WHERE user_id = auth.uid()
      )
    );
  END IF;
END
$$;

-- 3. Add sent_by column to messages table so patient-sent and therapist-sent
--    messages are reliably distinguishable without inference.
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS sent_by text DEFAULT 'therapist'
CHECK (sent_by IN ('patient', 'therapist'));

-- Back-fill: messages where therapist_id IS NULL were sent by patient
-- (from the previous fix that stopped setting therapist_id on patient inserts).
UPDATE public.messages SET sent_by = 'patient' WHERE therapist_id IS NULL;
