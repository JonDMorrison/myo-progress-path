-- Get the program ID for "Myofunctional Therapy Program"
DO $$
DECLARE
  v_program_id UUID;
  v_week_21_id UUID;
  v_week_22_id UUID;
BEGIN
  -- Get program ID
  SELECT id INTO v_program_id FROM programs WHERE title = 'Myofunctional Therapy Program' LIMIT 1;
  
  -- Upsert Week 21
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
    21,
    'Week 21-22: Natural Eating & Advanced Posture',
    'These weeks focus on continuous drinking without breaking the seal (Continuous Drinking), applying perfect swallowing technique to complete meals (Perfect Bites - Frozen Face), strengthening lip seal (Tubes Under Lips), and introducing advanced posture exercises (Goal Post Arms and Head/Neck Tilts that alternate daily). You should be seeing 85%+ improvement in tongue posture, nasal breathing, and lip seal by now. Elastic hold increases to 50 minutes.',
    'Master continuous drinking, apply swallowing to complete meals with neutral face, strengthen lip seal, perform advanced posture exercises, and increase elastic hold time.',
    '["Master Continuous Drinking without air swallowing", "Apply perfect swallowing to complete meals with frozen face", "Strengthen lip seal with Tubes Under Lips", "Alternate between Goal Post Arms and Head/Neck Tilts daily", "Increase elastic hold to 50 minutes", "Continue mouth taping overnight"]',
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
  RETURNING id INTO v_week_21_id;

  -- Delete existing exercises for week 21
  DELETE FROM exercises WHERE week_id = v_week_21_id;

  -- Insert exercises for Week 21
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (
    v_week_21_id,
    'Continuous Drinking',
    'active',
    '2x/day',
    '1 minute',
    28,
    'Drink and swallow multiple times in a row with teeth together using swallowing technique practiced before with single sips exercise. Drinking with teeth together will allow you to drink without bringing air into the mouth and swallowing air. Swallow should be silent as a result.',
    'Glass of Water',
    'Watch for Tongue Thrust (Pushing tongue into the teeth to swallow, tongue should push against the palate). Sound during swallow - hold teeth together and avoid bringing air into mouth.',
    ''
  ),
  (
    v_week_21_id,
    'Perfect Bites - Frozen Face',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'This exercise is a progression of the 20 Foods Exercise, but this time a more complex meal is used. Take a regular sized bite of the food, chew thoroughly - at least 20 times. When the food is soft enough to swallow, form a bolus (small rounded mass of chewed food/saliva), then swallow the food with a neutral face. A second, "clean-up swallow" should be done to collect the remaining bits of food within the mouth. Used for developing coordination of tongue and oral muscles to achieve normal eating, chewing and swallowing. This exercise helps with awareness of chewing thoroughly, using the teeth to chew and not the tongue to suck on food while eating, and manipulation and control of food within the oral cavity. This is the last chewing/swallowing exercise as you transition from eating food as an exercise into eating food this way more naturally.',
    'A meal',
    'Watch for Tongue Thrust (Pushing tongue into the teeth to swallow, tongue should push against the palate). Avoid facial grimace (movement of lips, tightening cheeks, and chin dimpling), moving/bobbing head, or neck engagement. Scan face, head, neck, and shoulders for tension or pain during exercise and try to release it.',
    ''
  ),
  (
    v_week_21_id,
    'Tubes Under Lips',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'Tubes are placed under the lips and the lips must create a seal around the tubes. Once the tubes are removed it should feel very easy to make a lip seal.',
    'Tubes (provided in kit)',
    'Watch in the mirror for facial grimace (pursed lips, strained/dimpled chin). Touch/rub the chin to help it relax and focus on using the lip muscles instead of the chin to hold the tubes in place.',
    ''
  ),
  (
    v_week_21_id,
    'Goal Post Arms (Alternating)',
    'posture',
    '1x/day (alternate)',
    '2 minutes',
    7,
    'With the tongue on the spot and mouth closed, stand with good posture with your back against a wall. Hold your arms straight out to the sides at right angles (like a goal post) with your palms facing forward. Your shoulders and elbows should be level. Slide your arms up and down along the wall (only about 3-5 inches), concentrating on proper breathing technique, and keeping your head, body and arms all aligned. This exercise helps stretch out tight chest muscles. ALTERNATE WITH HEAD AND NECK TILTS EACH DAY.',
    'Wall',
    'Maintain tongue on spot and proper breathing throughout.',
    ''
  ),
  (
    v_week_21_id,
    'Head and Neck Tilts (Alternating)',
    'posture',
    '1x/day (alternate)',
    '2 minutes',
    7,
    'Start with arms out in Goal Post position. Keeping your arms aligned with the body, move your hands behind you head so that only your middle fingers touch. Tilt your head forward so your chin tucks into your neck. Hold for 5 seconds. Slowly tilt your head back until it drops as far back as it can go. Your fingers may support your neck but should not back the range of motion of your head. Hold for 5 seconds. Repeat for 2 minutes while holding your tongue to the spot, keeping your mouth closed and nasal breathing. ALTERNATE WITH GOAL POST ARMS EACH DAY.',
    'Wall',
    'Maintain tongue on spot, closed mouth, and nasal breathing throughout.',
    ''
  ),
  (
    v_week_21_id,
    'Middle of Tongue – Two Elastic Hold',
    'passive',
    '1x/day',
    '50 minutes',
    14,
    'Place elastic on the tip of the tongue and middle of the tongue and hold it to the spot and the roof of the mouth. If concerned about swallowing tie a piece of floss to elastic to keep between lips.',
    '2 Elastics, optional floss',
    'None',
    ''
  ),
  (
    v_week_21_id,
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

  -- Week 22 uses the same exercises as Week 21
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
    22,
    'Week 21-22: Natural Eating & Advanced Posture (Continued)',
    'Continue with the same exercises from week 21. Focus on making natural, proper swallowing and chewing your default pattern in all eating situations.',
    'Continue all exercises from Week 21. Focus on transitioning learned techniques into natural, everyday habits.',
    '["Master Continuous Drinking without air swallowing", "Perfect complete meal eating with frozen face", "Strengthen lip seal with Tubes Under Lips", "Alternate between Goal Post Arms and Head/Neck Tilts daily", "Continue 50-minute elastic holds", "Continue mouth taping overnight"]',
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
  RETURNING id INTO v_week_22_id;

  -- Delete existing exercises for week 22
  DELETE FROM exercises WHERE week_id = v_week_22_id;

  -- Insert same exercises for Week 22
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (
    v_week_22_id,
    'Continuous Drinking',
    'active',
    '2x/day',
    '1 minute',
    28,
    'Drink and swallow multiple times in a row with teeth together using swallowing technique practiced before with single sips exercise. Drinking with teeth together will allow you to drink without bringing air into the mouth and swallowing air. Swallow should be silent as a result.',
    'Glass of Water',
    'Watch for Tongue Thrust (Pushing tongue into the teeth to swallow, tongue should push against the palate). Sound during swallow - hold teeth together and avoid bringing air into mouth.',
    ''
  ),
  (
    v_week_22_id,
    'Perfect Bites - Frozen Face',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'This exercise is a progression of the 20 Foods Exercise, but this time a more complex meal is used. Take a regular sized bite of the food, chew thoroughly - at least 20 times. When the food is soft enough to swallow, form a bolus (small rounded mass of chewed food/saliva), then swallow the food with a neutral face. A second, "clean-up swallow" should be done to collect the remaining bits of food within the mouth. Used for developing coordination of tongue and oral muscles to achieve normal eating, chewing and swallowing. This exercise helps with awareness of chewing thoroughly, using the teeth to chew and not the tongue to suck on food while eating, and manipulation and control of food within the oral cavity. This is the last chewing/swallowing exercise as you transition from eating food as an exercise into eating food this way more naturally.',
    'A meal',
    'Watch for Tongue Thrust (Pushing tongue into the teeth to swallow, tongue should push against the palate). Avoid facial grimace (movement of lips, tightening cheeks, and chin dimpling), moving/bobbing head, or neck engagement. Scan face, head, neck, and shoulders for tension or pain during exercise and try to release it.',
    ''
  ),
  (
    v_week_22_id,
    'Tubes Under Lips',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'Tubes are placed under the lips and the lips must create a seal around the tubes. Once the tubes are removed it should feel very easy to make a lip seal.',
    'Tubes (provided in kit)',
    'Watch in the mirror for facial grimace (pursed lips, strained/dimpled chin). Touch/rub the chin to help it relax and focus on using the lip muscles instead of the chin to hold the tubes in place.',
    ''
  ),
  (
    v_week_22_id,
    'Goal Post Arms (Alternating)',
    'posture',
    '1x/day (alternate)',
    '2 minutes',
    7,
    'With the tongue on the spot and mouth closed, stand with good posture with your back against a wall. Hold your arms straight out to the sides at right angles (like a goal post) with your palms facing forward. Your shoulders and elbows should be level. Slide your arms up and down along the wall (only about 3-5 inches), concentrating on proper breathing technique, and keeping your head, body and arms all aligned. This exercise helps stretch out tight chest muscles. ALTERNATE WITH HEAD AND NECK TILTS EACH DAY.',
    'Wall',
    'Maintain tongue on spot and proper breathing throughout.',
    ''
  ),
  (
    v_week_22_id,
    'Head and Neck Tilts (Alternating)',
    'posture',
    '1x/day (alternate)',
    '2 minutes',
    7,
    'Start with arms out in Goal Post position. Keeping your arms aligned with the body, move your hands behind you head so that only your middle fingers touch. Tilt your head forward so your chin tucks into your neck. Hold for 5 seconds. Slowly tilt your head back until it drops as far back as it can go. Your fingers may support your neck but should not back the range of motion of your head. Hold for 5 seconds. Repeat for 2 minutes while holding your tongue to the spot, keeping your mouth closed and nasal breathing. ALTERNATE WITH GOAL POST ARMS EACH DAY.',
    'Wall',
    'Maintain tongue on spot, closed mouth, and nasal breathing throughout.',
    ''
  ),
  (
    v_week_22_id,
    'Middle of Tongue – Two Elastic Hold',
    'passive',
    '1x/day',
    '50 minutes',
    14,
    'Place elastic on the tip of the tongue and middle of the tongue and hold it to the spot and the roof of the mouth. If concerned about swallowing tie a piece of floss to elastic to keep between lips.',
    '2 Elastics, optional floss',
    'None',
    ''
  ),
  (
    v_week_22_id,
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