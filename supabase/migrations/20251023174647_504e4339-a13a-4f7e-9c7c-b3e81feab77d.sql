-- Get the program ID for "Myofunctional Therapy Program"
DO $$
DECLARE
  v_program_id UUID;
  v_week_23_id UUID;
  v_week_24_id UUID;
BEGIN
  -- Get program ID
  SELECT id INTO v_program_id FROM programs WHERE title = 'Myofunctional Therapy Program' LIMIT 1;
  
  -- Upsert Week 23
  INSERT INTO weeks (
    program_id,
    number,
    title,
    introduction,
    overview,
    objectives,
    video_title,
    video_url,
    requires_bolt,
    requires_video_first,
    requires_video_last,
    checklist_schema
  ) VALUES (
    v_program_id,
    23,
    'Week 23-24: Program Completion & Mastery',
    'Congratulations on reaching the final weeks of the program! These weeks focus on self-study and review of your most challenging exercises, advanced posture work (Head Pushes and Shoulder Squeezes), and a final BOLT test to measure your breathing progress. Your elastic hold reaches the full 1 hour. You should be seeing 95%+ achievement in tongue posture, nasal breathing, and lip seal by the end of this program.',
    'Review and master previously challenging exercises through self-study, complete advanced posture exercises, perform final BOLT assessment, and achieve 1-hour elastic holds.',
    '["Review and master 3 previously challenging exercises", "Perform Head Pushes for posture", "Perform Shoulder Squeezes for posture", "Complete final BOLT test assessment", "Achieve 1-hour elastic hold", "Continue mouth taping overnight"]',
    NULL,
    NULL,
    true,
    true,
    true,
    '["BOLT Score", "% Time Nasal Breathing", "% Time Tongue on Spot"]'
  )
  ON CONFLICT (program_id, number) 
  DO UPDATE SET
    title = EXCLUDED.title,
    introduction = EXCLUDED.introduction,
    overview = EXCLUDED.overview,
    objectives = EXCLUDED.objectives,
    requires_bolt = EXCLUDED.requires_bolt,
    requires_video_first = EXCLUDED.requires_video_first,
    requires_video_last = EXCLUDED.requires_video_last,
    checklist_schema = EXCLUDED.checklist_schema
  RETURNING id INTO v_week_23_id;

  -- Delete existing exercises for week 23
  DELETE FROM exercises WHERE week_id = v_week_23_id;

  -- Insert exercises for Week 23
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (
    v_week_23_id,
    'Self Study - Exercise 1',
    'active',
    '2x/day',
    '1-2 minutes',
    28,
    'Look back through the active exercises in this program and review one of the exercises that you struggled with the most previously. Practice this exercise for the next 2 weeks.',
    'Mirror, various props depending on chosen exercise',
    'Review the compensations for the specific exercise you choose to practice.',
    ''
  ),
  (
    v_week_23_id,
    'Self Study - Exercise 2',
    'active',
    '2x/day',
    '1-2 minutes',
    28,
    'Look back through the active exercises in this program and review a second exercise that you struggled with the most previously. Practice this exercise for the next 2 weeks.',
    'Mirror, various props depending on chosen exercise',
    'Review the compensations for the specific exercise you choose to practice.',
    ''
  ),
  (
    v_week_23_id,
    'Self Study - Exercise 3',
    'active',
    '2x/day',
    '1-2 minutes',
    28,
    'Look back through the active exercises in this program and review a third exercise that you struggled with the most previously. Practice this exercise for the next 2 weeks.',
    'Mirror, various props depending on chosen exercise',
    'Review the compensations for the specific exercise you choose to practice.',
    ''
  ),
  (
    v_week_23_id,
    'Head Pushes',
    'posture',
    '1x/day',
    '1 minute',
    14,
    'With the tongue on the spot and mouth closed, stand with your back against the wall, with feet shoulder width apart and good posture. Look straight forward, and without tipping your head or changing your eye level, push the back of your head straight back towards the wall. Hold for 5 seconds. Bring head back to resting position for 3 seconds. Repeat for one minute. Make sure your hair is not in a ponytail, bun or clip - this will further the distance of your head from the wall.',
    'Wall',
    'Maintain tongue on spot and level eye gaze. Remove hair accessories.',
    ''
  ),
  (
    v_week_23_id,
    'Shoulder Squeezes',
    'posture',
    '1x/day',
    '1 minute',
    14,
    'With the tongue on the spot and mouth closed, stand with your back against the wall, with feet shoulder width apart and good posture. Place a hand towel folded and rolled up into a tube shape between your shoulder blades. Squeeze your shoulder blades together to squeeze the towel while moving your shoulders and elbows slightly back behind you. Hold for 5 seconds. Go back to resting position for 3 seconds. Repeat for one minute. Make sure your hair is not in a ponytail, bun or clip - this will further the distance of your head from the wall.',
    'Wall, hand towel',
    'Maintain tongue on spot throughout. Remove hair accessories.',
    ''
  ),
  (
    v_week_23_id,
    'BOLT Test (Final Check In)',
    'breathing',
    'Once',
    '5 minutes',
    1,
    'This test measures breathing health and progress. Good for adults with sleep apnea, snoring, chronic fatigue/tiredness, and brain fog. Consider doing the unblocking your nose exercises first.

Scale of what is considered healthy (higher score means organs/tissues are receiving adequate oxygen):
• 40-60 seconds is healthy and ideal
• 30-39 seconds indicates mild breathing/airway issues
• 20-29 seconds indicates moderate breathing/airway issues
• 10-19 seconds indicates unhealthy breathing
• 0-9 seconds is very unhealthy breathing and severe airway issues

Instructions:
1. Take a small, silent breath in and a small, silent breath out.
2. Hold your nose with your fingers to prevent air from entering your lungs while timing yourself with a stopwatch
3. At the first sign of "air hunger", you will also feel the first involuntary movements of your breathing muscles. Your stomach may jerk, or the area around your neck may contract.
4. Release your nose and stop the timer at these first signs of "air hunger". This will tell you your final score.

Tips: When you release your nose, your inhalation should remain calm. If you are breathing heavily or taking deep breaths, then you waited too long and the score is not correct. This is not a breath-holding test.',
    'Stopwatch or timer',
    'This is not a breath-holding competition. Release at the first sign of air hunger.',
    ''
  ),
  (
    v_week_23_id,
    'Middle of Tongue – Two Elastic Hold',
    'passive',
    '1x/day',
    '1 hour',
    14,
    'Place elastic on the tip of the tongue and middle of the tongue and hold it to the spot and the roof of the mouth. If concerned about swallowing tie a piece of floss to elastic to keep between lips.',
    '2 Elastics, optional floss',
    'None',
    ''
  ),
  (
    v_week_23_id,
    'Mouth Taping Over Night',
    'passive',
    'Nightly',
    'Overnight',
    14,
    'Make sure you have tape that will stick and not irritate your skin. Use lip balm or Chapstick if your lips are dry, before applying the tape. Place the tape however you are most comfortable – vertically, horizontally, or in an X pattern. Sealing off the air is recommended unless you are uncomfortable with this feeling.',
    'Micropore or Surgical Tape, lip balm/Chapstick',
    'If you feel claustrophobic, practice the Belly Breathing Exercise to help relax yourself and adjust your breathing before applying the tape. Consider doing the unblocking your nose exercises first.',
    ''
  );

  -- Week 24 uses the same exercises as Week 23
  INSERT INTO weeks (
    program_id,
    number,
    title,
    introduction,
    overview,
    objectives,
    video_title,
    video_url,
    requires_bolt,
    requires_video_first,
    requires_video_last,
    checklist_schema
  ) VALUES (
    v_program_id,
    24,
    'Week 23-24: Program Completion & Mastery (Final Week)',
    'This is your final week of the 24-week myofunctional therapy program! Continue with self-study exercises, posture work, and maintaining your 1-hour elastic holds. You should now have achieved 95%+ mastery of tongue posture, nasal breathing, and lip seal. Congratulations on completing this transformative journey!',
    'Continue all exercises from Week 23. Focus on solidifying all learned techniques and celebrating your progress.',
    '["Master previously challenging exercises through review", "Perfect Head Pushes for posture", "Perfect Shoulder Squeezes for posture", "Maintain 1-hour elastic hold", "Continue mouth taping overnight"]',
    NULL,
    NULL,
    false,
    true,
    true,
    '["% Time Nasal Breathing", "% Time Tongue on Spot"]'
  )
  ON CONFLICT (program_id, number) 
  DO UPDATE SET
    title = EXCLUDED.title,
    introduction = EXCLUDED.introduction,
    overview = EXCLUDED.overview,
    objectives = EXCLUDED.objectives,
    requires_bolt = EXCLUDED.requires_bolt,
    requires_video_first = EXCLUDED.requires_video_first,
    requires_video_last = EXCLUDED.requires_video_last,
    checklist_schema = EXCLUDED.checklist_schema
  RETURNING id INTO v_week_24_id;

  -- Delete existing exercises for week 24
  DELETE FROM exercises WHERE week_id = v_week_24_id;

  -- Insert same exercises for Week 24 (except BOLT test which is only in week 23)
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (
    v_week_24_id,
    'Self Study - Exercise 1',
    'active',
    '2x/day',
    '1-2 minutes',
    28,
    'Look back through the active exercises in this program and review one of the exercises that you struggled with the most previously. Practice this exercise for the next 2 weeks.',
    'Mirror, various props depending on chosen exercise',
    'Review the compensations for the specific exercise you choose to practice.',
    ''
  ),
  (
    v_week_24_id,
    'Self Study - Exercise 2',
    'active',
    '2x/day',
    '1-2 minutes',
    28,
    'Look back through the active exercises in this program and review a second exercise that you struggled with the most previously. Practice this exercise for the next 2 weeks.',
    'Mirror, various props depending on chosen exercise',
    'Review the compensations for the specific exercise you choose to practice.',
    ''
  ),
  (
    v_week_24_id,
    'Self Study - Exercise 3',
    'active',
    '2x/day',
    '1-2 minutes',
    28,
    'Look back through the active exercises in this program and review a third exercise that you struggled with the most previously. Practice this exercise for the next 2 weeks.',
    'Mirror, various props depending on chosen exercise',
    'Review the compensations for the specific exercise you choose to practice.',
    ''
  ),
  (
    v_week_24_id,
    'Head Pushes',
    'posture',
    '1x/day',
    '1 minute',
    14,
    'With the tongue on the spot and mouth closed, stand with your back against the wall, with feet shoulder width apart and good posture. Look straight forward, and without tipping your head or changing your eye level, push the back of your head straight back towards the wall. Hold for 5 seconds. Bring head back to resting position for 3 seconds. Repeat for one minute. Make sure your hair is not in a ponytail, bun or clip - this will further the distance of your head from the wall.',
    'Wall',
    'Maintain tongue on spot and level eye gaze. Remove hair accessories.',
    ''
  ),
  (
    v_week_24_id,
    'Shoulder Squeezes',
    'posture',
    '1x/day',
    '1 minute',
    14,
    'With the tongue on the spot and mouth closed, stand with your back against the wall, with feet shoulder width apart and good posture. Place a hand towel folded and rolled up into a tube shape between your shoulder blades. Squeeze your shoulder blades together to squeeze the towel while moving your shoulders and elbows slightly back behind you. Hold for 5 seconds. Go back to resting position for 3 seconds. Repeat for one minute. Make sure your hair is not in a ponytail, bun or clip - this will further the distance of your head from the wall.',
    'Wall, hand towel',
    'Maintain tongue on spot throughout. Remove hair accessories.',
    ''
  ),
  (
    v_week_24_id,
    'Middle of Tongue – Two Elastic Hold',
    'passive',
    '1x/day',
    '1 hour',
    14,
    'Place elastic on the tip of the tongue and middle of the tongue and hold it to the spot and the roof of the mouth. If concerned about swallowing tie a piece of floss to elastic to keep between lips.',
    '2 Elastics, optional floss',
    'None',
    ''
  ),
  (
    v_week_24_id,
    'Mouth Taping Over Night',
    'passive',
    'Nightly',
    'Overnight',
    14,
    'Make sure you have tape that will stick and not irritate your skin. Use lip balm or Chapstick if your lips are dry, before applying the tape. Place the tape however you are most comfortable – vertically, horizontally, or in an X pattern. Sealing off the air is recommended unless you are uncomfortable with this feeling.',
    'Micropore or Surgical Tape, lip balm/Chapstick',
    'If you feel claustrophobic, practice the Belly Breathing Exercise to help relax yourself and adjust your breathing before applying the tape. Consider doing the unblocking your nose exercises first.',
    ''
  );

END $$;