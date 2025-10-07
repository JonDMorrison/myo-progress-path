-- Add AI feedback columns
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS ai_feedback JSONB;

-- Add AI summary column to patient_week_progress
ALTER TABLE patient_week_progress ADD COLUMN IF NOT EXISTS ai_summary TEXT;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  sent_email BOOLEAN DEFAULT FALSE,
  read BOOLEAN DEFAULT FALSE
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Patients can view their own notifications"
ON notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = notifications.patient_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Patients can update their own notifications"
ON notifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = notifications.patient_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Therapists can insert notifications"
ON notifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = notifications.patient_id
    AND (p.assigned_therapist_id = auth.uid() OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    ))
  )
);

CREATE POLICY "Staff can view all notifications"
ON notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('therapist', 'admin')
  )
);