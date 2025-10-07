-- Create clinics table
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  leaderboard_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create default clinic and store its ID
DO $$
DECLARE
  default_clinic_id UUID;
BEGIN
  -- Insert or get default clinic
  INSERT INTO clinics (name)
  VALUES ('Default Clinic')
  ON CONFLICT DO NOTHING;
  
  SELECT id INTO default_clinic_id FROM clinics WHERE name = 'Default Clinic' LIMIT 1;
  
  -- Add clinic_id column to patients if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE patients ADD COLUMN clinic_id UUID REFERENCES clinics(id);
    
    -- Update all existing patients to use the default clinic
    UPDATE patients SET clinic_id = default_clinic_id WHERE clinic_id IS NULL;
    
    -- Make clinic_id NOT NULL after setting values
    ALTER TABLE patients ALTER COLUMN clinic_id SET NOT NULL;
  END IF;
END $$;

-- Add leaderboard opt-out to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS leaderboard_opt_out BOOLEAN DEFAULT FALSE;

-- Core gamification stats
CREATE TABLE IF NOT EXISTS gamification_stats (
  patient_id UUID PRIMARY KEY REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  points INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Badges catalog
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT
);

-- Earned badges per patient
CREATE TABLE IF NOT EXISTS earned_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  badge_key TEXT REFERENCES badges(key),
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (patient_id, badge_key)
);

-- Challenges (clinic-defined)
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  goal_key TEXT NOT NULL,
  goal_target INTEGER NOT NULL,
  reward_points INTEGER NOT NULL DEFAULT 100,
  active BOOLEAN DEFAULT TRUE
);

-- Challenge progress per patient
CREATE TABLE IF NOT EXISTS challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (challenge_id, patient_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gam_stats_clinic ON gamification_stats(clinic_id);
CREATE INDEX IF NOT EXISTS idx_earned_badges_patient ON earned_badges(patient_id);
CREATE INDEX IF NOT EXISTS idx_challenges_clinic ON challenges(clinic_id, starts_on, ends_on);
CREATE INDEX IF NOT EXISTS idx_chal_prog_patient ON challenge_progress(patient_id);

-- Enable RLS
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE earned_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clinics
CREATE POLICY "Users can view their clinic"
ON clinics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.clinic_id = clinics.id
    AND p.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('therapist', 'admin')
  )
);

CREATE POLICY "Admins can manage clinics"
ON clinics FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- RLS Policies for gamification_stats
CREATE POLICY "Patients can view their own stats"
ON gamification_stats FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = gamification_stats.patient_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Staff can view stats in their clinic"
ON gamification_stats FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    JOIN users u ON u.id = auth.uid()
    WHERE p.id = gamification_stats.patient_id
    AND (
      (u.role = 'therapist' AND p.assigned_therapist_id = u.id)
      OR u.role = 'admin'
    )
  )
);

-- RLS Policies for badges (public read)
CREATE POLICY "Everyone can view badges"
ON badges FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage badges"
ON badges FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- RLS Policies for earned_badges
CREATE POLICY "Patients can view their earned badges"
ON earned_badges FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = earned_badges.patient_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Staff can view earned badges in their clinic"
ON earned_badges FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    JOIN users u ON u.id = auth.uid()
    WHERE p.id = earned_badges.patient_id
    AND (
      (u.role = 'therapist' AND p.assigned_therapist_id = u.id)
      OR u.role = 'admin'
    )
  )
);

-- RLS Policies for challenges
CREATE POLICY "Users can view challenges in their clinic"
ON challenges FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.clinic_id = challenges.clinic_id
    AND p.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('therapist', 'admin')
  )
);

CREATE POLICY "Admins can manage challenges"
ON challenges FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- RLS Policies for challenge_progress
CREATE POLICY "Patients can view their challenge progress"
ON challenge_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = challenge_progress.patient_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Staff can view challenge progress in their clinic"
ON challenge_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    JOIN users u ON u.id = auth.uid()
    WHERE p.id = challenge_progress.patient_id
    AND (
      (u.role = 'therapist' AND p.assigned_therapist_id = u.id)
      OR u.role = 'admin'
    )
  )
);

-- Seed default badges
INSERT INTO badges (key, name, description, icon) VALUES
  ('first_login', 'Welcome Aboard', 'Completed your first login', '👋'),
  ('first_week_submitted', 'Off to the Races', 'Submitted your first week', '🏁'),
  ('first_upload', 'Lights, Camera, Action', 'Uploaded your first video (Premium)', '🎥'),
  ('clean_streak_7', 'Seven-Day Run', 'Maintained a 7-day activity streak', '🔥'),
  ('month_one_complete', 'One Month Strong', 'Completed first 4 weeks', '💪'),
  ('twenty_four_weeks', 'Program Finisher', 'Completed all 24 weeks', '🏆')
ON CONFLICT (key) DO NOTHING;