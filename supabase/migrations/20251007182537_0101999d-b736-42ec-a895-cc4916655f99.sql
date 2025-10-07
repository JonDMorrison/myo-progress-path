-- MyoCoach Database Schema

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('patient', 'therapist', 'admin');
CREATE TYPE patient_status AS ENUM ('active', 'inactive', 'completed');
CREATE TYPE program_variant AS ENUM ('standard', 'frenectomy');
CREATE TYPE exercise_type AS ENUM ('active', 'passive', 'breathing', 'posture', 'test');
CREATE TYPE week_status AS ENUM ('locked', 'open', 'submitted', 'approved', 'needs_more');
CREATE TYPE upload_kind AS ENUM ('first_attempt', 'last_attempt', 'progress');

-- USERS table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role user_role NOT NULL DEFAULT 'patient',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATIENTS table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  consent_accepted_at TIMESTAMPTZ,
  program_variant program_variant DEFAULT 'frenectomy',
  assigned_therapist_id UUID REFERENCES users(id),
  status patient_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROGRAMS table
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  weeks_count INT NOT NULL
);

-- WEEKS table
CREATE TABLE weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  number INT NOT NULL,
  title TEXT,
  notes TEXT,
  requires_video_first BOOLEAN DEFAULT FALSE,
  requires_video_last BOOLEAN DEFAULT FALSE,
  requires_bolt BOOLEAN DEFAULT FALSE,
  checklist_schema JSONB DEFAULT '[]'::JSONB,
  UNIQUE(program_id, number)
);

-- EXERCISES table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type exercise_type NOT NULL,
  instructions TEXT,
  props TEXT,
  compensations TEXT,
  demo_video_url TEXT
);

-- PATIENT_WEEK_PROGRESS table
CREATE TABLE patient_week_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  status week_status DEFAULT 'open',
  bolt_score INT,
  nasal_breathing_pct INT,
  tongue_on_spot_pct INT,
  completed_at TIMESTAMPTZ,
  UNIQUE(patient_id, week_id)
);

-- MESSAGES table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- UPLOADS table (Premium feature)
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  kind upload_kind,
  file_url TEXT,
  thumb_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENTS table (Audit log)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  type TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_week_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- USERS: user can see self; therapists/admins can see all
CREATE POLICY users_self ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_staff ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('therapist', 'admin')
    )
  );

-- PATIENTS: patient sees own; assigned therapist/admin sees assigned
CREATE POLICY patients_self ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'patient' 
      AND patients.user_id = u.id
    )
  );

CREATE POLICY patients_staff ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('therapist', 'admin')
    ) AND (
      patients.assigned_therapist_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM users u2 
        WHERE u2.id = auth.uid() 
        AND u2.role = 'admin'
      )
    )
  );

-- PROGRAMS: readable by all authenticated
CREATE POLICY programs_read ON programs
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- WEEKS: readable by all authenticated
CREATE POLICY weeks_read ON weeks
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- EXERCISES: readable by all authenticated
CREATE POLICY exercises_read ON exercises
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- PROGRESS: patient read/write own; therapist/admin read/write for assigned
CREATE POLICY pwp_patient_rw ON patient_week_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = patient_week_progress.patient_id 
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = patient_week_progress.patient_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY pwp_staff_rw ON patient_week_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = patient_week_progress.patient_id 
      AND (
        p.assigned_therapist_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() 
          AND u.role = 'admin'
        )
      )
    )
  );

-- MESSAGES: patient and staff can read/write for assigned relationships
CREATE POLICY msg_patient_rw ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = messages.patient_id 
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = messages.patient_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY msg_staff_rw ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = messages.patient_id 
      AND (
        p.assigned_therapist_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() 
          AND u.role = 'admin'
        )
      )
    )
  );

-- UPLOADS: patient and staff can read/write for assigned relationships
CREATE POLICY upl_patient_rw ON uploads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = uploads.patient_id 
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = uploads.patient_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY upl_staff_rw ON uploads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = uploads.patient_id 
      AND (
        p.assigned_therapist_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() 
          AND u.role = 'admin'
        )
      )
    )
  );

-- EVENTS: read-only audit log, accessible by patient and staff
CREATE POLICY events_patient_read ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = events.patient_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY events_staff_read ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('therapist', 'admin')
    )
  );

-- Trigger to create user entry on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('patient-videos', 'patient-videos', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('exercise-demos', 'exercise-demos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('consents', 'consents', false);

-- Storage policies for patient-videos
CREATE POLICY "Patients can upload their own videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'patient-videos' AND
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.user_id = auth.uid()
    AND (storage.foldername(name))[1] = p.id::text
  )
);

CREATE POLICY "Patients can view their own videos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'patient-videos' AND
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.user_id = auth.uid()
    AND (storage.foldername(name))[1] = p.id::text
  )
);

CREATE POLICY "Therapists can view assigned patient videos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'patient-videos' AND
  EXISTS (
    SELECT 1 FROM patients p
    WHERE (storage.foldername(name))[1] = p.id::text
    AND (p.assigned_therapist_id = auth.uid() OR
         EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'))
  )
);

-- Storage policies for exercise-demos (public)
CREATE POLICY "Exercise demos are publicly accessible"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'exercise-demos');

CREATE POLICY "Admins can upload exercise demos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'exercise-demos' AND
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);