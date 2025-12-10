-- First create the Non-Frenectomy Program
INSERT INTO public.programs (id, title, description, weeks_count)
VALUES (
  'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  'Non-Frenectomy Program',
  'MyoCoach 24-Week Program for patients not undergoing frenectomy surgery',
  24
);

-- Duplicate all weeks from source to target program
INSERT INTO weeks (id, program_id, number, title, introduction, overview, notes,
  video_title, video_url, requires_video_first, requires_video_last,
  requires_bolt, checklist_schema, objectives)
SELECT 
  gen_random_uuid(), 
  'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'::uuid,
  number, title, introduction, overview, notes,
  video_title, video_url, requires_video_first, requires_video_last,
  requires_bolt, checklist_schema, objectives
FROM weeks 
WHERE program_id = 'fbed6754-c418-4881-be6a-c80f8bc85d1a'
ORDER BY number;