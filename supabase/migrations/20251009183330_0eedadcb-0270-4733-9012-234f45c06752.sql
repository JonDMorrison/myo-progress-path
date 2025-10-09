-- Email delivery log for HIPAA compliance
CREATE TABLE email_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  template_name TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'fail', 'pending')),
  provider_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_email_log_user ON email_log(user_id);
CREATE INDEX idx_email_log_sent ON email_log(sent_at DESC);

ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view email logs"
  ON email_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('therapist', 'admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert email logs"
  ON email_log FOR INSERT
  WITH CHECK (true);

-- Pre-launch audit results
CREATE TABLE prelaunch_audit_log (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('PASS', 'FAIL', 'WARN')),
  summary TEXT NOT NULL,
  results JSONB NOT NULL,
  auditor_id UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_prelaunch_audit_created ON prelaunch_audit_log(created_at DESC);

ALTER TABLE prelaunch_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage audit logs"
  ON prelaunch_audit_log FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Add encryption setting
INSERT INTO app_settings (key, value) 
VALUES ('encryption_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Add Week 1 video URL placeholder
INSERT INTO app_settings (key, value)
VALUES ('week1_video_url', '"https://vimeo.com/placeholder"'::jsonb)
ON CONFLICT (key) DO NOTHING;