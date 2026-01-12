-- Frenectomy Pathway Enhancement: Add proper exercises for Weeks 11-24
-- This migration updates placeholder exercises with clinical-grade content

DO $$ 
DECLARE
  v_program_id uuid;
  v_week_id uuid;
BEGIN
  -- Get Frenectomy Program ID
  SELECT id INTO v_program_id FROM programs WHERE title = 'Frenectomy Program' LIMIT 1;
  
  IF v_program_id IS NULL THEN
    RAISE EXCEPTION 'Frenectomy Program not found';
  END IF;

  -- ============== WEEK 11: Habit Integration ==============
  SELECT id INTO v_week_id FROM weeks WHERE program_id = v_program_id AND number = 11;
  
  -- Update week metadata
  UPDATE weeks SET
    title = 'Week 11: Habit Integration',
    introduction = 'This week focuses on integrating your exercises into everyday activities. The goal is to make proper tongue posture, nasal breathing, and correct swallowing automatic habits.',
    overview = 'Transition from dedicated practice to all-day habit awareness.',
    objectives = '["Integrate tongue posture into daily activities", "Practice correct swallowing during meals", "Maintain nasal breathing during light activity", "Continue elastic holds for tongue strength"]'::jsonb
  WHERE id = v_week_id;

  -- Delete old placeholder exercises for Week 11
  DELETE FROM exercises WHERE week_id = v_week_id;

  -- Add proper exercises for Week 11
  INSERT INTO exercises (week_id, type, title, frequency, duration, completion_target, instructions, props, compensations) VALUES
  (v_week_id, 'passive', 'Middle Tongue Elastic Hold', '1x/day', '20 minutes', 14, 'Place elastic on the middle of the tongue and hold to the roof of the mouth for 20 minutes. Use this time for reading, watching TV, or other quiet activities.

If concerned about swallowing, tie a piece of floss to the elastic to keep between lips.', '1 Elastic', NULL),
  (v_week_id, 'posture', 'Hourly Posture Check', '8x/day', '30 seconds', 56, 'Set reminders to check your posture every hour:
1. Is your tongue on the spot?
2. Are your lips gently sealed?
3. Are you breathing through your nose?

Rate each check: All 3 = ✓, Missing any = Note what was off', NULL, 'If tongue is consistently off the spot, spend extra time on suction exercises'),
  (v_week_id, 'active', 'Meal Swallow Practice', '3x/day', '10 minutes', 42, 'During each meal, focus on correct swallowing technique:
1. Chew food thoroughly with lips closed
2. Collect food on tongue middle
3. Tongue tip to the spot
4. Swallow with tongue pressure, not cheek/lip movement

**Use a mirror for the first few bites to confirm form**', 'Mirror', 'Watch for facial grimace, lip movement, or head tilt during swallow'),
  (v_week_id, 'breathing', 'Nasal Breathing Walk', '1x/day', '15 minutes', 14, 'Walk at a comfortable pace while maintaining:
- Lips gently sealed
- Breathing only through the nose
- Relaxed shoulders and jaw

If you need to mouth breathe, slow your pace until nasal breathing is comfortable.', NULL, 'If nasal congestion is an issue, perform nose unblocking exercises before walking'),
  (v_week_id, 'active', 'Lingual Palatal Suction', '2x/day', '2 minutes', 28, 'Continue practicing suction holds:
1. Lips back in a smile, open mouth wide
2. Suction tongue to roof of mouth
3. Hold for 30 seconds, then release
4. Repeat 4 times

Focus on keeping the floor of mouth relaxed.', 'Bite Block', 'Watch for jaw protrusion, floor of mouth lifting, or tongue overflow');

  -- ============== WEEK 12: Midpoint Assessment ==============
  SELECT id INTO v_week_id FROM weeks WHERE program_id = v_program_id AND number = 12;
  
  UPDATE weeks SET
    title = 'Week 12: Midpoint Assessment',
    introduction = 'Congratulations on reaching the halfway point! This week we assess your progress with a new BOLT score and video recording. Compare your results to Week 1 to see how far you have come.',
    overview = 'Record progress metrics and continue building habits.',
    objectives = '["Complete midpoint BOLT assessment", "Record progress video for therapist review", "Continue all maintenance exercises", "Identify any areas needing additional focus"]'::jsonb,
    requires_bolt = true,
    requires_video_last = true
  WHERE id = v_week_id;

  DELETE FROM exercises WHERE week_id = v_week_id;

  INSERT INTO exercises (week_id, type, title, frequency, duration, completion_target, instructions, props, compensations) VALUES
  (v_week_id, 'test', 'BOLT Score Assessment', '1x/week', '5 minutes', 2, 'Measure your Body Oxygen Level Test (BOLT) score:
1. Breathe normally through your nose
2. After a gentle exhale, pinch your nose
3. Count seconds until you feel the first urge to breathe
4. Resume normal breathing

Record your score and compare to Week 1.', NULL, NULL),
  (v_week_id, 'passive', 'Middle Tongue Elastic Hold', '1x/day', '20 minutes', 14, 'Continue daily elastic holds. You should be comfortable holding for the full 20 minutes by now.', '1 Elastic', NULL),
  (v_week_id, 'posture', 'Hourly Posture Check', '8x/day', '30 seconds', 56, 'Continue hourly checks. Track your success rate - aim for 90%+ correct posture.', NULL, NULL),
  (v_week_id, 'active', 'Lingual Palatal Suction', '2x/day', '2 minutes', 28, 'Continue suction practice. Focus on holding longer (up to 1 minute per hold).', 'Bite Block', NULL),
  (v_week_id, 'test', 'Progress Video Recording', '1x/week', '5 minutes', 2, 'Record yourself demonstrating:
1. Tongue to spot hold (10 seconds)
2. Correct swallow technique
3. Lingual palatal suction

Submit for therapist review.', NULL, NULL);

  -- ============== WEEK 13: Strength Building ==============
  SELECT id INTO v_week_id FROM weeks WHERE program_id = v_program_id AND number = 13;
  
  UPDATE weeks SET
    title = 'Week 13: Strength Building',
    introduction = 'With good habits established, we now focus on building tongue strength and endurance. Stronger muscles mean more reliable posture throughout the day.',
    overview = 'Increase intensity with longer holds and resistance exercises.',
    objectives = '["Increase elastic hold duration to 30 minutes", "Build tongue strength with power holds", "Maintain hourly posture awareness", "Continue nasal breathing during activity"]'::jsonb
  WHERE id = v_week_id;

  DELETE FROM exercises WHERE week_id = v_week_id;

  INSERT INTO exercises (week_id, type, title, frequency, duration, completion_target, instructions, props, compensations) VALUES
  (v_week_id, 'passive', 'Extended Elastic Hold', '1x/day', '30 minutes', 14, 'Increase your elastic hold to 30 minutes. Split into two 15-minute sessions if needed.

Continue using floss attachment if more comfortable.', '1 Elastic', NULL),
  (v_week_id, 'active', 'Power Suction Holds', '2x/day', '3 minutes', 28, 'Build strength with intense suction:
1. Suction tongue firmly to palate
2. Hold with maximum pressure for 10 seconds
3. Release and rest 5 seconds
4. Repeat 10 times

Focus on the BACK of the tongue pressing up.', 'Bite Block', 'Watch for compensations - use bite block to isolate tongue movement'),
  (v_week_id, 'posture', 'Hourly Posture Check', '8x/day', '30 seconds', 56, 'Continue hourly monitoring. By now, posture should feel more natural.', NULL, NULL),
  (v_week_id, 'breathing', 'Nasal Breathing Activity', '1x/day', '20 minutes', 14, 'Increase walking pace or add light activity while maintaining nasal breathing. Options: brisk walk, light yoga, stretching routine.', NULL, NULL),
  (v_week_id, 'active', 'Correct Swallow Practice', '3x/day', '5 minutes', 42, 'Practice 10 correct swallows at each session using water. Focus on tongue movement only - no lip, cheek, or head involvement.', NULL, 'Head should stay still, no facial grimace');

  -- ============== WEEK 14-15: Endurance Phase ==============
  SELECT id INTO v_week_id FROM weeks WHERE program_id = v_program_id AND number = 14;
  
  UPDATE weeks SET
    title = 'Week 14: Speech Integration',
    introduction = 'Speaking and breathing can disrupt posture. This week, learn to maintain correct tongue position during conversation and reading aloud.',
    overview = 'Apply proper posture during speech activities.',
    objectives = '["Maintain posture between words", "Practice reading aloud with nasal breathing", "Continue strength exercises", "Monitor swallowing during meals"]'::jsonb
  WHERE id = v_week_id;

  DELETE FROM exercises WHERE week_id = v_week_id;

  INSERT INTO exercises (week_id, type, title, frequency, duration, completion_target, instructions, props, compensations) VALUES
  (v_week_id, 'active', 'Read Aloud Practice', '1x/day', '10 minutes', 14, 'Read a book or article aloud for 10 minutes:
- Between sentences, return tongue to the spot
- Breathe through nose during pauses
- Keep lips relaxed when not speaking

Record yourself to review tongue position.', 'Book or article', NULL),
  (v_week_id, 'passive', 'Extended Elastic Hold', '1x/day', '30 minutes', 14, 'Continue 30-minute elastic holds daily.', '1 Elastic', NULL),
  (v_week_id, 'posture', 'Conversation Awareness', '3x/day', '5 minutes', 42, 'During conversations, focus on:
- Tongue returns to spot between speaking
- Lips seal gently when listening
- Nasal breathing during pauses

Practice with family or friends.', NULL, NULL),
  (v_week_id, 'active', 'Power Suction Holds', '2x/day', '3 minutes', 28, 'Continue strength building with power suction holds.', 'Bite Block', NULL),
  (v_week_id, 'breathing', 'Nasal Breathing Activity', '1x/day', '20 minutes', 14, 'Continue daily activity with nasal breathing only.', NULL, NULL);

  -- ============== WEEKS 15-18: Continue building similar patterns ==============
  -- Week 15
  SELECT id INTO v_week_id FROM weeks WHERE program_id = v_program_id AND number = 15;
  UPDATE weeks SET
    title = 'Week 15: Endurance Challenge',
    introduction = 'Push your endurance further this week. Longer holds, more consistency, and deeper habit integration.',
    overview = 'Extend exercise durations and challenge yourself.',
    objectives = '["40-minute elastic holds", "Increase activity intensity with nasal breathing", "Perfect mealtime swallowing", "Track posture success rate"]'::jsonb
  WHERE id = v_week_id;

  DELETE FROM exercises WHERE week_id = v_week_id;

  INSERT INTO exercises (week_id, type, title, frequency, duration, completion_target, instructions, props, compensations) VALUES
  (v_week_id, 'passive', 'Extended Elastic Hold', '1x/day', '40 minutes', 14, 'Extend elastic hold to 40 minutes. You may do this while doing other activities.', '1 Elastic', NULL),
  (v_week_id, 'active', 'Suction Endurance', '2x/day', '4 minutes', 28, 'Hold tongue suction for 20 seconds per rep, repeat 8 times.', 'Bite Block', NULL),
  (v_week_id, 'posture', 'All-Day Tracking', '1x/day', '5 minutes', 14, 'At end of day, estimate your tongue-on-spot percentage. Aim for 85%+.', NULL, NULL),
  (v_week_id, 'breathing', 'Interval Nasal Breathing', '1x/day', '20 minutes', 14, 'Alternate between brisk walking and normal pace, all nasal breathing.', NULL, NULL),
  (v_week_id, 'active', 'Mealtime Mastery', '3x/day', '15 minutes', 42, 'Every meal, focus on perfect technique from first bite to last.', NULL, NULL);

  -- Week 16
  SELECT id INTO v_week_id FROM weeks WHERE program_id = v_program_id AND number = 16;
  UPDATE weeks SET
    title = 'Week 16: Chewing & Swallowing Mastery',
    introduction = 'Refine your eating mechanics. Proper chewing and swallowing should now feel natural.',
    overview = 'Focus on functional eating habits.',
    objectives = '["Perfect chewing technique", "Silent swallowing", "Continue endurance exercises", "Maintain nasal breathing"]'::jsonb
  WHERE id = v_week_id;

  DELETE FROM exercises WHERE week_id = v_week_id;

  INSERT INTO exercises (week_id, type, title, frequency, duration, completion_target, instructions, props, compensations) VALUES
  (v_week_id, 'active', 'Chewing Practice', '3x/day', '10 minutes', 42, 'Focus on thorough chewing with lips sealed. Count 20+ chews per bite for solid foods.', NULL, 'Avoid mashing food with tongue'),
  (v_week_id, 'active', 'Silent Swallow Drill', '2x/day', '5 minutes', 28, '10 practice swallows with water - aim for zero audible sound. Tongue pressure only.', NULL, NULL),
  (v_week_id, 'passive', 'Extended Elastic Hold', '1x/day', '40 minutes', 14, 'Continue daily elastic holds.', '1 Elastic', NULL),
  (v_week_id, 'posture', 'Posture Journaling', '1x/day', '5 minutes', 14, 'Write 2-3 sentences about your posture wins and challenges today.', NULL, NULL),
  (v_week_id, 'breathing', 'Nasal Breathing Activity', '1x/day', '25 minutes', 14, 'Increase activity duration to 25 minutes.', NULL, NULL);

  -- Week 17
  SELECT id INTO v_week_id FROM weeks WHERE program_id = v_program_id AND number = 17;
  UPDATE weeks SET
    title = 'Week 17: Breathing Endurance',
    introduction = 'Challenge your breathing capacity with increased activity and BOLT measurements.',
    overview = 'Push nasal breathing limits and track progress.',
    objectives = '["Improve BOLT score", "30-minute nasal breathing exercise", "Continue all maintenance exercises", "Perfect automatic habits"]'::jsonb,
    requires_bolt = true
  WHERE id = v_week_id;

  DELETE FROM exercises WHERE week_id = v_week_id;

  INSERT INTO exercises (week_id, type, title, frequency, duration, completion_target, instructions, props, compensations) VALUES
  (v_week_id, 'test', 'BOLT Score Check', '2x/week', '5 minutes', 4, 'Measure BOLT score twice this week. Note any improvement from Week 12.', NULL, NULL),
  (v_week_id, 'breathing', 'Extended Nasal Activity', '1x/day', '30 minutes', 14, 'Walk, jog, or exercise for 30 minutes with nasal breathing only. Slow pace if needed.', NULL, NULL),
  (v_week_id, 'passive', 'Extended Elastic Hold', '1x/day', '45 minutes', 14, 'Increase to 45 minutes. This is approaching your maintenance target.', '1 Elastic', NULL),
  (v_week_id, 'posture', 'Sleep Posture Awareness', '1x/day', '5 minutes', 14, 'Before bed, ensure mouth taping is secure. Note morning observations.', 'Mouth Tape', NULL),
  (v_week_id, 'active', 'Suction Maintenance', '1x/day', '3 minutes', 14, 'Continue suction holds for strength maintenance.', 'Bite Block', NULL);

  -- Week 18
  SELECT id INTO v_week_id FROM weeks WHERE program_id = v_program_id AND number = 18;
  UPDATE weeks SET
    title = 'Week 18: Swallow Integration',
    introduction = 'By now, correct swallowing should be nearly automatic. This week reinforces the habit.',
    overview = 'Solidify swallowing technique into unconscious habit.',
    objectives = '["Automatic correct swallowing", "Continue breathing exercises", "Maintain elastic holds", "Track daily success"]'::jsonb
  WHERE id = v_week_id;

  DELETE FROM exercises WHERE week_id = v_week_id;

  INSERT INTO exercises (week_id, type, title, frequency, duration, completion_target, instructions, props, compensations) VALUES
  (v_week_id, 'active', 'Swallow Awareness Day', '1x/day', '10 minutes', 14, 'Pick one meal and count every swallow. All should be correct technique.', NULL, NULL),
  (v_week_id, 'passive', 'Extended Elastic Hold', '1x/day', '45 minutes', 14, 'Continue 45-minute holds.', '1 Elastic', NULL),
  (v_week_id, 'breathing', 'Nasal Breathing Activity', '1x/day', '30 minutes', 14, 'Continue 30-minute nasal breathing activities.', NULL, NULL),
  (v_week_id, 'posture', 'Posture Self-Rating', '1x/day', '5 minutes', 14, 'Rate your day 1-10 for tongue posture, nasal breathing, and correct swallowing.', NULL, NULL),
  (v_week_id, 'active', 'Drink Swallow Check', '3x/day', '2 minutes', 42, 'Every time you drink, consciously verify correct technique.', NULL, NULL);

  -- ============== WEEKS 19-24: Refinement & Completion ==============
  -- Week 19
  SELECT id INTO v_week_id FROM weeks WHERE program_id = v_program_id AND number = 19;
  UPDATE weeks SET
    title = 'Week 19: Speech & Smile Integration',
    introduction = 'Focus on maintaining posture while speaking and smiling naturally.',
    overview = 'Integrate skills into social situations.',
    objectives = '["Natural speech with correct posture", "Relaxed smile with tongue on spot", "Continue maintenance exercises", "Social situation practice"]'::jsonb
  WHERE id = v_week_id;

  DELETE FROM exercises WHERE week_id = v_week_id;

  INSERT INTO exercises (week_id, type, title, frequency, duration, completion_target, instructions, props, compensations) VALUES
  (v_week_id, 'active', 'Smile Practice', '2x/day', '3 minutes', 28, 'Practice smiling naturally while tongue stays on the spot. Check in mirror.', 'Mirror', NULL),
  (v_week_id, 'active', 'Conversation Practice', '1x/day', '15 minutes', 14, 'Have a real conversation focusing on proper posture between words.', NULL, NULL),
  (v_week_id, 'passive', 'Elastic Hold Maintenance', '1x/day', '45 minutes', 14, 'Continue daily elastic holds.', '1 Elastic', NULL),
  (v_week_id, 'breathing', 'Activity Breathing', '1x/day', '30 minutes', 14, 'Continue nasal breathing during activity.', NULL, NULL),
  (v_week_id, 'posture', 'Social Situation Check', '1x/day', '5 minutes', 14, 'Reflect on posture during social interactions today.', NULL, NULL);

  -- Week 20
  SELECT id INTO v_week_id FROM weeks WHERE program_id = v_program_id AND number = 20;
  UPDATE weeks SET
    title = 'Week 20: Challenge Week',
    introduction = 'Test your skills with increased difficulty. Can you maintain perfect form during challenging activities?',
    overview = 'Push yourself with endurance challenges.',
    objectives = '["1-hour elastic hold", "45-minute nasal breathing activity", "Perfect mealtime technique", "Track all-day posture"]'::jsonb
  WHERE id = v_week_id;

  DELETE FROM exercises WHERE week_id = v_week_id;

  INSERT INTO exercises (week_id, type, title, frequency, duration, completion_target, instructions, props, compensations) VALUES
  (v_week_id, 'passive', '1-Hour Elastic Hold', '1x/day', '60 minutes', 14, 'Challenge yourself to a full hour elastic hold. This is your maintenance target!', '1 Elastic', NULL),
  (v_week_id, 'breathing', 'Extended Activity', '1x/day', '45 minutes', 14, 'Challenge with 45 minutes of nasal breathing activity.', NULL, NULL),
  (v_week_id, 'active', 'Perfect Meal Challenge', '3x/day', '15 minutes', 42, 'Score each meal: chewing, swallowing, breathing all correct?', NULL, NULL),
  (v_week_id, 'posture', 'All-Day Tracking', '1x/day', '5 minutes', 14, 'Track percentage of day with correct posture. Target: 90%+.', NULL, NULL),
  (v_week_id, 'active', 'Endurance Suction', '1x/day', '5 minutes', 14, 'Hold suction for 45 seconds, repeat 5 times.', 'Bite Block', NULL);

  -- Week 21
  SELECT id INTO v_week_id FROM weeks WHERE program_id = v_program_id AND number = 21;
  UPDATE weeks SET
    title = 'Week 21: Habit Automation',
    introduction = 'By now, most habits should be automatic. This week confirms your progress.',
    overview = 'Verify habits are functioning without conscious effort.',
    objectives = '["Check automatic habits", "Reduce conscious monitoring", "Maintain exercise routine", "Prepare for completion"]'::jsonb
  WHERE id = v_week_id;

  DELETE FROM exercises WHERE week_id = v_week_id;

  INSERT INTO exercises (week_id, type, title, frequency, duration, completion_target, instructions, props, compensations) VALUES
  (v_week_id, 'posture', 'Random Posture Checks', '5x/day', '1 minute', 35, 'At random times, check your posture WITHOUT setting a reminder. Is it correct?', NULL, NULL),
  (v_week_id, 'passive', '1-Hour Elastic Hold', '1x/day', '60 minutes', 14, 'Continue daily 1-hour holds.', '1 Elastic', NULL),
  (v_week_id, 'breathing', 'Activity Breathing', '1x/day', '30 minutes', 14, 'Continue nasal breathing activities.', NULL, NULL),
  (v_week_id, 'active', 'Habit Verification', '3x/day', '5 minutes', 42, 'During meals, verify correct technique is happening automatically.', NULL, NULL);

  -- Week 22
  SELECT id INTO v_week_id FROM weeks WHERE program_id = v_program_id AND number = 22;
  UPDATE weeks SET
    title = 'Week 22: Refinement',
    introduction = 'Fine-tune any remaining challenges. Your therapist may provide specific guidance based on your progress.',
    overview = 'Polish technique and address any weak areas.',
    objectives = '["Address therapist feedback", "Perfect weak areas", "Continue maintenance routine", "Prepare for final assessment"]'::jsonb
  WHERE id = v_week_id;

  DELETE FROM exercises WHERE week_id = v_week_id;

  INSERT INTO exercises (week_id, type, title, frequency, duration, completion_target, instructions, props, compensations) VALUES
  (v_week_id, 'active', 'Focused Practice', '2x/day', '10 minutes', 28, 'Work on any areas identified as needing improvement by your therapist.', NULL, NULL),
  (v_week_id, 'passive', '1-Hour Elastic Hold', '1x/day', '60 minutes', 14, 'Continue daily 1-hour holds.', '1 Elastic', NULL),
  (v_week_id, 'posture', 'Self-Assessment', '1x/day', '10 minutes', 14, 'Rate your skills: tongue posture, swallowing, breathing, lip seal. All should be 9-10.', NULL, NULL),
  (v_week_id, 'breathing', 'Activity Breathing', '1x/day', '30 minutes', 14, 'Continue nasal breathing activities.', NULL, NULL);

  -- Week 23
  SELECT id INTO v_week_id FROM weeks WHERE program_id = v_program_id AND number = 23;
  UPDATE weeks SET
    title = 'Week 23: Pre-Final Assessment',
    introduction = 'Prepare for your final week. Review all skills and ensure consistency.',
    overview = 'Final preparation before program completion.',
    objectives = '["Review all exercises", "BOLT score measurement", "Video preparation", "Confirm maintenance readiness"]'::jsonb,
    requires_bolt = true
  WHERE id = v_week_id;

  DELETE FROM exercises WHERE week_id = v_week_id;

  INSERT INTO exercises (week_id, type, title, frequency, duration, completion_target, instructions, props, compensations) VALUES
  (v_week_id, 'test', 'Pre-Final BOLT', '2x/week', '5 minutes', 4, 'Measure BOLT score. Compare to Week 1 and Week 12.', NULL, NULL),
  (v_week_id, 'active', 'Skills Review', '1x/day', '15 minutes', 14, 'Practice all exercises: suction, swallowing, breathing, posture checks.', 'Bite Block, Mirror', NULL),
  (v_week_id, 'passive', '1-Hour Elastic Hold', '1x/day', '60 minutes', 14, 'Continue daily 1-hour holds.', '1 Elastic', NULL),
  (v_week_id, 'test', 'Practice Video', '1x/week', '10 minutes', 2, 'Record a practice version of your final video to review.', NULL, NULL),
  (v_week_id, 'posture', 'Maintenance Plan Review', '1x/week', '15 minutes', 2, 'Review the maintenance guidelines you will follow after completion.', NULL, NULL);

  -- Week 24
  SELECT id INTO v_week_id FROM weeks WHERE program_id = v_program_id AND number = 24;
  UPDATE weeks SET
    title = 'Week 24: Program Completion',
    introduction = 'Congratulations on reaching the final week! Record your final progress video and celebrate your transformation. You have worked hard to build these lifelong habits.',
    overview = 'Complete final assessments and celebrate your success.',
    objectives = '["Final BOLT score", "Final progress video", "Review maintenance guidelines", "Celebrate your achievement!"]'::jsonb,
    requires_bolt = true,
    requires_video_last = true
  WHERE id = v_week_id;

  DELETE FROM exercises WHERE week_id = v_week_id;

  INSERT INTO exercises (week_id, type, title, frequency, duration, completion_target, instructions, props, compensations) VALUES
  (v_week_id, 'test', 'Final BOLT Score', '1x/week', '5 minutes', 2, 'Record your final BOLT score. This is a key measure of your progress!', NULL, NULL),
  (v_week_id, 'test', 'Final Progress Video', '1x/week', '10 minutes', 2, 'Record your final video demonstrating:
1. Tongue to spot hold (30 seconds)
2. Lingual palatal suction (30 seconds)
3. Correct swallow technique (3 swallows)
4. Speaking with correct posture

Celebrate your progress!', NULL, NULL),
  (v_week_id, 'passive', 'Final Elastic Hold', '1x/day', '60 minutes', 7, 'Continue 1-hour holds - this is now your maintenance routine!', '1 Elastic', NULL),
  (v_week_id, 'posture', 'Maintenance Mode Activation', '1x/week', '30 minutes', 2, 'Review and commit to the maintenance guidelines:
- 95%+ nasal breathing
- 95%+ tongue on spot
- Correct swallowing at all meals
- Optional daily elastic holds for maintenance

Your therapist may recommend continued check-ins.', NULL, NULL);

END $$;