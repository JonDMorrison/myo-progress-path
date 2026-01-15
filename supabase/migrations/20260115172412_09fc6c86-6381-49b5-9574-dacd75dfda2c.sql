-- Delete orphan weeks that have no program_id
-- These are causing duplication issues in the UI
-- First delete related exercises
DELETE FROM exercises 
WHERE week_id IN (
  SELECT id FROM weeks WHERE program_id IS NULL
);

-- Delete any patient_week_progress records for these weeks
DELETE FROM patient_week_progress 
WHERE week_id IN (
  SELECT id FROM weeks WHERE program_id IS NULL
);

-- Delete any uploads for these weeks
DELETE FROM uploads 
WHERE week_id IN (
  SELECT id FROM weeks WHERE program_id IS NULL
);

-- Delete any messages for these weeks
DELETE FROM messages 
WHERE week_id IN (
  SELECT id FROM weeks WHERE program_id IS NULL
);

-- Delete any therapist_feedback for these weeks
DELETE FROM therapist_feedback 
WHERE week_id IN (
  SELECT id FROM weeks WHERE program_id IS NULL
);

-- Delete any maintenance_assignments for these weeks
DELETE FROM maintenance_assignments 
WHERE week_id IN (
  SELECT id FROM weeks WHERE program_id IS NULL
);

-- Finally delete the orphan weeks themselves
DELETE FROM weeks WHERE program_id IS NULL;