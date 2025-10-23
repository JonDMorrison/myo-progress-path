-- Get the program ID for "Myofunctional Therapy Program"
DO $$
DECLARE
  v_program_id UUID;
  v_week_17_id UUID;
  v_week_18_id UUID;
BEGIN
  -- Get program ID
  SELECT id INTO v_program_id FROM programs WHERE title = 'Myofunctional Therapy Program' LIMIT 1;
  
  -- Upsert Week 17
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
    17,
    'Week 17-18: Mastering Daily Functions',
    'These weeks focus on mastering swallowing with real-world drinking (Single Sips from various containers), proper chewing technique (Cracker Chew and Check), lip strengthening (Horse Lips), and introducing posture exercises (Shoulder Rolls). You''ll also upgrade to two elastics for passive tongue positioning.',
    'Apply learned swallowing techniques to daily life, master proper chewing, strengthen lips, improve posture, and upgrade to two elastic holds.',
    '["Master Single Sips from various containers", "Learn proper chewing with Cracker Chew and Check", "Strengthen lips with Horse Lips exercise", "Improve posture with Shoulder Rolls", "Advance to two elastic holds for 30 minutes", "Continue mouth taping overnight"]',
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
  RETURNING id INTO v_week_17_id;

  -- Delete existing exercises for week 17
  DELETE FROM exercises WHERE week_id = v_week_17_id;

  -- Insert exercises for Week 17
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (
    v_week_17_id,
    'Single Sips',
    'active',
    '2x/day',
    '1 minute',
    28,
    'We will be advancing the Water Trap exercise from the previous week''s exercises for this swallowing exercise. Single Sips is more about mastery of the concepts and doing the exercise quickly with lots of repetition so that it becomes second nature. Start with small sips/spoonfuls (advancing to larger ones once able) and trap in a perfect bowl against the roof of your mouth. Push tongue against roof of mouth into lingual palatal suction shape for swallowing. Cheeks, lips, and teeth should be in a smile during exercise. Once the concept is mastered using a regular glass of water, practice drinking the same way, except from different containers. For example: bottle, can, thermos, straw, mug, etc. This exercise can also be done with a neutral or relaxed face once mastered with a smile.',
    'Glass of Water, various containers (bottle, can, thermos, straw, mug)',
    'Watch in the mirror, focusing on eliminating facial grimace (chin dimpling and lips pursing) neck engagement or head bob during swallow. Watch for Tongue Thrust (Pushing tongue into the teeth to swallow, tongue should push against the palate).',
    ''
  ),
  (
    v_week_17_id,
    'Cracker Chew and Check',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'Chew a cracker for 20-30 chews (this will feel like a lot – important to chew more than what you are comfortable with, in order to start chewing food more thoroughly in general). Have an awareness on how you are chewing and activate chewing muscles – avoid sucking on the cracker or mashing it with tongue which activates the lips and cheek muscles. Form a bolus (ball-like mixture of food/saliva) before swallowing – use the same swallowing technique that has been practiced over the last few weeks.',
    'Crackers (Goldfish, Ritz, Pretzels, Wheat Thins, Cheez-Its, rice crackers, or plantain chips)',
    'Watch in the mirror, focusing on eliminating facial grimace (chin dimpling and lips pursing) neck engagement or head bob during swallow. Watch for Tongue Thrust (Pushing tongue into the teeth to swallow, tongue should push against the palate).',
    ''
  ),
  (
    v_week_17_id,
    'Horse Lips',
    'active',
    '2x/day',
    '1 minute',
    28,
    'Start with lips pressed together and blow out through mouth to create a horse sound. If you struggle to achieve lip seal start with pressing/flattening lips between fingers. For patients with lots of facial tension, it may be helpful to stretch out the cheeks by placing the thumb inside the cheek, fingers on the outside of the cheek, and pushing out to create a stretch.',
    'None',
    'Watch in a mirror to avoid facial grimace (rounding the lips or dimpling the chin) when pressing lips together. Continue nasal breathing throughout exercise (Consider doing the unblocking your nose exercises first).',
    ''
  ),
  (
    v_week_17_id,
    'Shoulder Rolls',
    'posture',
    '1x/day',
    '1 minute',
    14,
    'With the tongue on the spot and mouth closed, stand or sit with good posture. Roll your shoulders slowly from front to back. Hold them back as far as possible, hold there for the count of 3. Repeat for 1 minute, using slow rotations of the shoulders.',
    'None',
    'Maintain tongue on spot and good posture throughout.',
    ''
  ),
  (
    v_week_17_id,
    'Middle of Tongue – Two Elastic Hold',
    'passive',
    '1x/day',
    '30 minutes',
    14,
    'Place elastic on the tip of the tongue and middle of the tongue and hold it to the spot and the roof of the mouth. If concerned about swallowing tie a piece of floss to elastic to keep between lips.',
    '2 Elastics, optional floss',
    'None',
    ''
  ),
  (
    v_week_17_id,
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

  -- Week 18 uses the same exercises as Week 17
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
    18,
    'Week 17-18: Mastering Daily Functions (Continued)',
    'Continue with the same exercises from week 17. Focus on making proper swallowing and chewing second nature in your daily life.',
    'Continue all exercises from Week 17. Focus on mastering proper swallowing from any container and proper chewing technique.',
    '["Master Single Sips from various containers", "Perfect chewing technique with Cracker Chew and Check", "Strengthen lips with Horse Lips exercise", "Improve posture with Shoulder Rolls", "Continue two elastic holds for 30 minutes", "Continue mouth taping overnight"]',
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
  RETURNING id INTO v_week_18_id;

  -- Delete existing exercises for week 18
  DELETE FROM exercises WHERE week_id = v_week_18_id;

  -- Insert same exercises for Week 18
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (
    v_week_18_id,
    'Single Sips',
    'active',
    '2x/day',
    '1 minute',
    28,
    'We will be advancing the Water Trap exercise from the previous week''s exercises for this swallowing exercise. Single Sips is more about mastery of the concepts and doing the exercise quickly with lots of repetition so that it becomes second nature. Start with small sips/spoonfuls (advancing to larger ones once able) and trap in a perfect bowl against the roof of your mouth. Push tongue against roof of mouth into lingual palatal suction shape for swallowing. Cheeks, lips, and teeth should be in a smile during exercise. Once the concept is mastered using a regular glass of water, practice drinking the same way, except from different containers. For example: bottle, can, thermos, straw, mug, etc. This exercise can also be done with a neutral or relaxed face once mastered with a smile.',
    'Glass of Water, various containers (bottle, can, thermos, straw, mug)',
    'Watch in the mirror, focusing on eliminating facial grimace (chin dimpling and lips pursing) neck engagement or head bob during swallow. Watch for Tongue Thrust (Pushing tongue into the teeth to swallow, tongue should push against the palate).',
    ''
  ),
  (
    v_week_18_id,
    'Cracker Chew and Check',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'Chew a cracker for 20-30 chews (this will feel like a lot – important to chew more than what you are comfortable with, in order to start chewing food more thoroughly in general). Have an awareness on how you are chewing and activate chewing muscles – avoid sucking on the cracker or mashing it with tongue which activates the lips and cheek muscles. Form a bolus (ball-like mixture of food/saliva) before swallowing – use the same swallowing technique that has been practiced over the last few weeks.',
    'Crackers (Goldfish, Ritz, Pretzels, Wheat Thins, Cheez-Its, rice crackers, or plantain chips)',
    'Watch in the mirror, focusing on eliminating facial grimace (chin dimpling and lips pursing) neck engagement or head bob during swallow. Watch for Tongue Thrust (Pushing tongue into the teeth to swallow, tongue should push against the palate).',
    ''
  ),
  (
    v_week_18_id,
    'Horse Lips',
    'active',
    '2x/day',
    '1 minute',
    28,
    'Start with lips pressed together and blow out through mouth to create a horse sound. If you struggle to achieve lip seal start with pressing/flattening lips between fingers. For patients with lots of facial tension, it may be helpful to stretch out the cheeks by placing the thumb inside the cheek, fingers on the outside of the cheek, and pushing out to create a stretch.',
    'None',
    'Watch in a mirror to avoid facial grimace (rounding the lips or dimpling the chin) when pressing lips together. Continue nasal breathing throughout exercise (Consider doing the unblocking your nose exercises first).',
    ''
  ),
  (
    v_week_18_id,
    'Shoulder Rolls',
    'posture',
    '1x/day',
    '1 minute',
    14,
    'With the tongue on the spot and mouth closed, stand or sit with good posture. Roll your shoulders slowly from front to back. Hold them back as far as possible, hold there for the count of 3. Repeat for 1 minute, using slow rotations of the shoulders.',
    'None',
    'Maintain tongue on spot and good posture throughout.',
    ''
  ),
  (
    v_week_18_id,
    'Middle of Tongue – Two Elastic Hold',
    'passive',
    '1x/day',
    '30 minutes',
    14,
    'Place elastic on the tip of the tongue and middle of the tongue and hold it to the spot and the roof of the mouth. If concerned about swallowing tie a piece of floss to elastic to keep between lips.',
    '2 Elastics, optional floss',
    'None',
    ''
  ),
  (
    v_week_18_id,
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