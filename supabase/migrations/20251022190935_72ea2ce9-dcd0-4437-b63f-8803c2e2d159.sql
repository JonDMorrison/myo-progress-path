-- Get the program ID (assuming single program exists)
DO $$
DECLARE
  v_program_id uuid;
  v_week5_id uuid;
  v_week6_id uuid;
BEGIN
  -- Get the program ID
  SELECT id INTO v_program_id FROM programs LIMIT 1;
  
  -- Upsert Week 5
  INSERT INTO weeks (
    program_id, number, title, introduction, overview, objectives,
    video_title, video_url, requires_bolt, requires_video_first, requires_video_last,
    checklist_schema
  ) VALUES (
    v_program_id,
    5,
    'Week 5 - Pre-Frenectomy Preparation',
    '**Important Note:** Pre-Frenectomy Exercises and Stretches start with this set of exercises. Your consultation with Dr. Caylor should have been completed and your upcoming frenectomy should be scheduled in a couple of weeks.

This week focuses on strengthening tongue movements in multiple directions and establishing controlled breathing patterns. These exercises prepare your oral musculature for the frenectomy procedure.',
    'Continue building strength and coordination in tongue movements while introducing directional exercises. Focus on controlled movements without compensatory patterns.',
    '["Strengthen lateral tongue movements with cheek resistance", "Develop posterior tongue elevation for K and G sounds", "Improve lip seal strength through internal resistance", "Establish the 4-7-8 breathing pattern for relaxation", "Maintain mid-tongue positioning with elastic resistance"]'::jsonb,
    null,
    null,
    false,
    true,
    true,
    '["% Time Nasal Breathing"]'::jsonb
  )
  ON CONFLICT (program_id, number) 
  DO UPDATE SET
    title = EXCLUDED.title,
    introduction = EXCLUDED.introduction,
    overview = EXCLUDED.overview,
    objectives = EXCLUDED.objectives,
    video_title = EXCLUDED.video_title,
    video_url = EXCLUDED.video_url,
    requires_bolt = EXCLUDED.requires_bolt,
    requires_video_first = EXCLUDED.requires_video_first,
    requires_video_last = EXCLUDED.requires_video_last,
    checklist_schema = EXCLUDED.checklist_schema
  RETURNING id INTO v_week5_id;

  -- Delete old exercises for week 5
  DELETE FROM exercises WHERE week_id = v_week5_id;

  -- Insert exercises for Week 5
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (v_week5_id, 'Tongue in Cheek', 'active', '2x/day', '1 minute', 28, 
   'Push the tongue into the cheek without the jaw shifting and hold for 5 seconds. Practice with the mouth open and with lips closed together. Use slow and controlled movements. Do exercise with a still/relaxed face.',
   'Bite Block',
   'Watch in the mirror for jaw lateralization – use bite block to avoid. When the mouth is open, try to control for facial grimace (rounding of lips). Check and prevent muscle bracing.',
   null),
  (v_week5_id, 'K Sounds (Kuh, Guh, Unk)', 'active', '2x/day', '2 minutes', 28,
   'Make a clear, precise "kuh" sound with the mouth open (use a bite block and move to a taller position as you improve with exercise). The back of the tongue needs to raise up to make contact with the soft palate. The "kuh" sound helps facilitate this movement. Start with "kuh" and "guh" sounds the first week and switch to "guh" and "unk" sounds the second week of practice.',
   'Bite Block',
   'Watch in the mirror for jaw lateralization and jaw protrusion – use bite block to avoid. Control facial grimace (lips rounding). Control neck engagement.',
   null),
  (v_week5_id, 'Lip Trace', 'active', '2x/day', '1 minute', 28,
   'While maintaining contact with the tongue under the lips, trace circles around the inside of the upper and lower lips. Alternate three times each direction. Keep your lips closed during this exercise. Tracing with larger circles extending into the cheeks can add an extra stretch/challenge. Do smaller circles for patients who have more tongue restriction.',
   'None',
   'Watch in mirror to ensure as little jaw movement as possible - you may hold jaw or chin to minimize at first but try to limit over time. Minimize facial tension.',
   null),
  (v_week5_id, '4-7-8 Breathing Pattern', 'breathing', '1x/day', '5 minutes', 14,
   E'**Instructions:**\n1. Set a timer for 5 minutes and begin.\n2. Inhale counting to 4.\n3. Before exhaling, hold your breath for a count of 7.\n4. Exhale counting to 8.\n5. Repeat for 5 minutes.\n\n**Tips:**\n- Do this anytime of day to help you relax or do it lying in bed to help you fall asleep.\n- Remember to breathe only through your nose.\n- Consider doing the unblocking your nose exercises first.\n- Focus on inhaling the air into your belly/diaphragm.\n- When you exhale, you may feel like you have to push out all your air. This is normal and helps promote deep breathing.',
   'None',
   'Ensure breathing remains nasal only. Avoid shallow chest breathing - focus on diaphragmatic breathing.',
   null),
  (v_week5_id, 'Middle of Tongue – One Elastic Hold', 'passive', '1x/day', '10 minutes', 14,
   'Place elastic on the middle of the tongue and hold it to the roof of the mouth. If concerned about swallowing, tie a piece of floss to elastic to keep between lips.',
   '1 Elastic',
   'Ensure elastic stays in middle position. Watch for tongue sliding forward or backward. Maintain relaxed jaw position.',
   null);

  -- Upsert Week 6
  INSERT INTO weeks (
    program_id, number, title, introduction, overview, objectives,
    video_title, video_url, requires_bolt, requires_video_first, requires_video_last,
    checklist_schema
  ) VALUES (
    v_program_id,
    6,
    'Week 6 - Pre-Frenectomy Preparation',
    '**Important Note:** Continue your Pre-Frenectomy Exercises and Stretches. Your frenectomy should be scheduled for soon.

This week continues the same exercise protocol as Week 5, allowing you to refine your technique and build greater strength and endurance before your procedure.',
    'Repeat and master the Week 5 exercises with increased precision and control. Focus on eliminating all compensatory patterns.',
    '["Perfect lateral tongue movements with minimal compensations", "Achieve clear, precise K and G sounds with proper tongue elevation", "Complete lip traces with zero jaw movement", "Make 4-7-8 breathing a daily relaxation habit", "Hold mid-tongue elastic position consistently for full duration"]'::jsonb,
    null,
    null,
    false,
    true,
    true,
    '["% Time Nasal Breathing"]'::jsonb
  )
  ON CONFLICT (program_id, number) 
  DO UPDATE SET
    title = EXCLUDED.title,
    introduction = EXCLUDED.introduction,
    overview = EXCLUDED.overview,
    objectives = EXCLUDED.objectives,
    video_title = EXCLUDED.video_title,
    video_url = EXCLUDED.video_url,
    requires_bolt = EXCLUDED.requires_bolt,
    requires_video_first = EXCLUDED.requires_video_first,
    requires_video_last = EXCLUDED.requires_video_last,
    checklist_schema = EXCLUDED.checklist_schema
  RETURNING id INTO v_week6_id;

  -- Delete old exercises for week 6
  DELETE FROM exercises WHERE week_id = v_week6_id;

  -- Insert exercises for Week 6 (same as Week 5)
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (v_week6_id, 'Tongue in Cheek', 'active', '2x/day', '1 minute', 28,
   'Push the tongue into the cheek without the jaw shifting and hold for 5 seconds. Practice with the mouth open and with lips closed together. Use slow and controlled movements. Do exercise with a still/relaxed face.',
   'Bite Block',
   'Watch in the mirror for jaw lateralization – use bite block to avoid. When the mouth is open, try to control for facial grimace (rounding of lips). Check and prevent muscle bracing.',
   null),
  (v_week6_id, 'K Sounds (Kuh, Guh, Unk)', 'active', '2x/day', '2 minutes', 28,
   'Make a clear, precise "kuh" sound with the mouth open (use a bite block and move to a taller position as you improve with exercise). The back of the tongue needs to raise up to make contact with the soft palate. The "kuh" sound helps facilitate this movement. Start with "kuh" and "guh" sounds the first week and switch to "guh" and "unk" sounds the second week of practice.',
   'Bite Block',
   'Watch in the mirror for jaw lateralization and jaw protrusion – use bite block to avoid. Control facial grimace (lips rounding). Control neck engagement.',
   null),
  (v_week6_id, 'Lip Trace', 'active', '2x/day', '1 minute', 28,
   'While maintaining contact with the tongue under the lips, trace circles around the inside of the upper and lower lips. Alternate three times each direction. Keep your lips closed during this exercise. Tracing with larger circles extending into the cheeks can add an extra stretch/challenge. Do smaller circles for patients who have more tongue restriction.',
   'None',
   'Watch in mirror to ensure as little jaw movement as possible - you may hold jaw or chin to minimize at first but try to limit over time. Minimize facial tension.',
   null),
  (v_week6_id, '4-7-8 Breathing Pattern', 'breathing', '1x/day', '5 minutes', 14,
   E'**Instructions:**\n1. Set a timer for 5 minutes and begin.\n2. Inhale counting to 4.\n3. Before exhaling, hold your breath for a count of 7.\n4. Exhale counting to 8.\n5. Repeat for 5 minutes.\n\n**Tips:**\n- Do this anytime of day to help you relax or do it lying in bed to help you fall asleep.\n- Remember to breathe only through your nose.\n- Consider doing the unblocking your nose exercises first.\n- Focus on inhaling the air into your belly/diaphragm.\n- When you exhale, you may feel like you have to push out all your air. This is normal and helps promote deep breathing.',
   'None',
   'Ensure breathing remains nasal only. Avoid shallow chest breathing - focus on diaphragmatic breathing.',
   null),
  (v_week6_id, 'Middle of Tongue – One Elastic Hold', 'passive', '1x/day', '10 minutes', 14,
   'Place elastic on the middle of the tongue and hold it to the roof of the mouth. If concerned about swallowing, tie a piece of floss to elastic to keep between lips.',
   '1 Elastic',
   'Ensure elastic stays in middle position. Watch for tongue sliding forward or backward. Maintain relaxed jaw position.',
   null);

END $$;