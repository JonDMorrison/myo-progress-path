-- Enable video uploads for all weeks
-- Each week will require both first attempt and last attempt videos for therapist review

UPDATE weeks 
SET 
  requires_video_first = true,
  requires_video_last = true
WHERE 
  requires_video_first = false 
  OR requires_video_last = false;