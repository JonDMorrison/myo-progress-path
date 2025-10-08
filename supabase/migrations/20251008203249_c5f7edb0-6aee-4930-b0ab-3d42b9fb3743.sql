-- Add introduction_viewed column to patient_week_progress
ALTER TABLE patient_week_progress 
ADD COLUMN introduction_viewed BOOLEAN DEFAULT false;

-- Add index for better query performance
CREATE INDEX idx_patient_week_progress_introduction_viewed 
ON patient_week_progress(patient_id, week_id, introduction_viewed);