-- Montrose Myo Database Setup Script
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('super_admin', 'therapist', 'patient')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  program_variant text NOT NULL DEFAULT 'frenectomy' CHECK (program_variant IN ('frenectomy', 'without_frenectomy')),
  current_week integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Create weeks table
CREATE TABLE IF NOT EXISTS public.weeks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  number integer NOT NULL,
  title text NOT NULL,
  overview text,
  video_url text,
  video_title text,
  objectives jsonb,
  requires_video_first boolean DEFAULT false,
  requires_video_last boolean DEFAULT false,
  requires_bolt boolean DEFAULT false,
  program_variant text NOT NULL DEFAULT 'frenectomy' CHECK (program_variant IN ('frenectomy', 'without_frenectomy')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(number, program_variant)
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_id uuid REFERENCES public.weeks(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('active', 'passive', 'breathing', 'posture', 'test')),
  instructions text,
  duration text,
  frequency text,
  props text,
  compensations text,
  demo_video_url text,
  modified_video_url text,
  media_status text CHECK (media_status IN ('has_video', 'needs_ai_video', 'needs_photo', 'description_only', 'pending')),
  video_required boolean DEFAULT false,
  completion_target integer DEFAULT 1,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create patient_week_progress table
CREATE TABLE IF NOT EXISTS public.patient_week_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  week_id uuid REFERENCES public.weeks(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'submitted', 'approved', 'needs_more')),
  exercise_completions jsonb DEFAULT '{}'::jsonb,
  bolt_score integer,
  nasal_breathing_pct integer,
  tongue_on_spot_pct integer,
  learn_hub_reviewed boolean DEFAULT false,
  frenectomy_consult_booked boolean DEFAULT false,
  submitted_at timestamp with time zone,
  approved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(patient_id, week_id)
);

-- Create uploads table
CREATE TABLE IF NOT EXISTS public.uploads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  week_id uuid REFERENCES public.weeks(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES public.exercises(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('first_attempt', 'last_attempt')),
  file_url text NOT NULL,
  analysis_result jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create therapist_feedback table
CREATE TABLE IF NOT EXISTS public.therapist_feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  week_id uuid REFERENCES public.weeks(id) ON DELETE CASCADE NOT NULL,
  therapist_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feedback text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create week_messages table
CREATE TABLE IF NOT EXISTS public.week_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  week_id uuid REFERENCES public.weeks(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create badges table for gamification
CREATE TABLE IF NOT EXISTS public.badges (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create patient_badges table
CREATE TABLE IF NOT EXISTS public.patient_badges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  badge_id text REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(patient_id, badge_id)
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_week_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.week_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_badges ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- user_roles policies
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all roles" ON public.user_roles
  FOR ALL USING (true);

-- patients policies
CREATE POLICY "Patients can view their own data" ON public.patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Therapists and admins can view all patients" ON public.patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('therapist', 'super_admin')
    )
  );

CREATE POLICY "Service role can manage patients" ON public.patients
  FOR ALL USING (true);

-- weeks policies (public read)
CREATE POLICY "Anyone can view weeks" ON public.weeks
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage weeks" ON public.weeks
  FOR ALL USING (true);

-- exercises policies (public read)
CREATE POLICY "Anyone can view exercises" ON public.exercises
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage exercises" ON public.exercises
  FOR ALL USING (true);

-- patient_week_progress policies
CREATE POLICY "Patients can view their own progress" ON public.patient_week_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE id = patient_week_progress.patient_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can update their own progress" ON public.patient_week_progress
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE id = patient_week_progress.patient_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can view all progress" ON public.patient_week_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('therapist', 'super_admin')
    )
  );

CREATE POLICY "Service role can manage progress" ON public.patient_week_progress
  FOR ALL USING (true);

-- uploads policies
CREATE POLICY "Patients can view their own uploads" ON public.uploads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE id = uploads.patient_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can delete their own uploads" ON public.uploads
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE id = uploads.patient_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can view all uploads" ON public.uploads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('therapist', 'super_admin')
    )
  );

CREATE POLICY "Service role can manage uploads" ON public.uploads
  FOR ALL USING (true);

-- therapist_feedback policies
CREATE POLICY "Patients can view feedback on their weeks" ON public.therapist_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE id = therapist_feedback.patient_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can create feedback" ON public.therapist_feedback
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('therapist', 'super_admin')
    )
  );

CREATE POLICY "Service role can manage feedback" ON public.therapist_feedback
  FOR ALL USING (true);

-- week_messages policies
CREATE POLICY "Users can view messages for their weeks" ON public.week_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE id = week_messages.patient_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('therapist', 'super_admin')
    )
  );

CREATE POLICY "Authenticated users can send messages" ON public.week_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Service role can manage messages" ON public.week_messages
  FOR ALL USING (true);

-- badges policies (public read)
CREATE POLICY "Anyone can view badges" ON public.badges
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage badges" ON public.badges
  FOR ALL USING (true);

-- patient_badges policies
CREATE POLICY "Patients can view their own badges" ON public.patient_badges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE id = patient_badges.patient_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage patient badges" ON public.patient_badges
  FOR ALL USING (true);

-- Insert initial badges
INSERT INTO public.badges (id, name, description, icon, tier) VALUES
  ('first_upload', 'First Upload', 'Uploaded your first exercise video', '🎥', 'bronze'),
  ('week_complete', 'Week Warrior', 'Completed your first week', '✨', 'bronze'),
  ('streak_7', '7-Day Streak', 'Practiced for 7 days in a row', '🔥', 'silver'),
  ('perfect_week', 'Perfect Week', 'Completed a week with 100% accuracy', '💯', 'gold'),
  ('halfway', 'Halfway Hero', 'Reached week 12', '🏆', 'gold'),
  ('program_complete', 'Program Champion', 'Completed the entire 24-week program', '👑', 'platinum')
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for patient videos (if not exists)
-- Note: This might need to be done manually in Supabase Storage UI
-- Bucket name: patient-videos
-- Public: false (private bucket)

-- Success message
SELECT 'Database setup complete! All tables created with RLS enabled.' as message;
