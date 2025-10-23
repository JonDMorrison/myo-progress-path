-- Add completion badge for finishing the 24-week program
INSERT INTO badges (key, name, description, icon) 
VALUES (
  'program_completed',
  'Program Champion',
  'Completed all 24 weeks of the Myofunctional Therapy Program',
  '🏆'
)
ON CONFLICT (key) DO NOTHING;