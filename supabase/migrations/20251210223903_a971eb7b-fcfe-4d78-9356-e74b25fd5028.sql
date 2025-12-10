-- Duplicate all exercises from frenectomy weeks to non-frenectomy weeks
INSERT INTO exercises (id, week_id, type, title, instructions, props, compensations,
  demo_video_url, frequency, duration, completion_target, media_status,
  media_waiting_on_clinician, requires_clinician_confirmation)
SELECT 
  gen_random_uuid(),
  new_weeks.id,
  e.type, e.title, e.instructions, e.props, e.compensations,
  e.demo_video_url, e.frequency, e.duration, e.completion_target, e.media_status,
  e.media_waiting_on_clinician, e.requires_clinician_confirmation
FROM exercises e
JOIN weeks old_weeks ON e.week_id = old_weeks.id
JOIN weeks new_weeks ON old_weeks.number = new_weeks.number
WHERE old_weeks.program_id = 'fbed6754-c418-4881-be6a-c80f8bc85d1a'
AND new_weeks.program_id = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';

-- Rename original program to "Frenectomy Program"
UPDATE programs SET title = 'Frenectomy Program' WHERE id = 'fbed6754-c418-4881-be6a-c80f8bc85d1a';