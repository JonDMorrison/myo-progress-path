-- 1. Create programs table
CREATE TABLE IF NOT EXISTS public.programs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(title)
);

-- 2. Insert default programs
INSERT INTO public.programs (title, description)
VALUES 
  ('Frenectomy Program', 'Standard program with frenectomy preparation and recovery'),
  ('Non-Frenectomy Program', 'Standard myofunctional therapy program without surgical component')
ON CONFLICT (title) DO NOTHING;

-- 3. Add program_id to weeks table if not exists (and link data)
-- First, ensure weeks has a program_variant column (from old schema) or needs migration
-- We will assume weeks might need a column for the FK if we want strict relation
-- BUT, the error said it looked for relation on 'programs!inner(title)'. 
-- This implies the frontend expects a relationship.

-- Let's try to infer if 'weeks' has a 'program_id' column. If not, we add it.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weeks' AND column_name = 'program_id') THEN
        ALTER TABLE public.weeks ADD COLUMN program_id uuid REFERENCES public.programs(id);
    END IF;
END $$;

-- 4. Update weeks to link to the correct program based on 'program_variant' text column
UPDATE public.weeks
SET program_id = (SELECT id FROM public.programs WHERE title = 'Frenectomy Program')
WHERE program_variant = 'frenectomy' OR program_variant = 'standard';

UPDATE public.weeks
SET program_id = (SELECT id FROM public.programs WHERE title = 'Non-Frenectomy Program')
WHERE program_variant = 'without_frenectomy';

-- 5. Enable RLS
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view programs" ON public.programs
  FOR SELECT USING (true);

-- Success message
SELECT 'Programs table created and linked to weeks successfully.' as message;
