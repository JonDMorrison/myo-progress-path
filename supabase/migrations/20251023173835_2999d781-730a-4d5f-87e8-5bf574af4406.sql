-- Get the program ID for "Myofunctional Therapy Program"
DO $$
DECLARE
  v_program_id UUID;
  v_week_19_id UUID;
  v_week_20_id UUID;
BEGIN
  -- Get program ID
  SELECT id INTO v_program_id FROM programs WHERE title = 'Myofunctional Therapy Program' LIMIT 1;
  
  -- Upsert Week 19
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
    19,
    'Week 19-20: Frozen Face & Real Food Integration',
    'These weeks focus on mastering natural swallowing with a neutral "frozen face" (Single Sips - Frozen Face), applying proper chewing to 20 different foods, strengthening midface muscles (Cheek Lifts), and introducing Standing Side Bends for posture. You should be seeing 75%+ improvement in tongue posture, nasal breathing, and lip seal by now. Elastic hold increases to 40 minutes.',
    'Perfect swallowing with neutral face expression, apply chewing technique to 20 different foods, strengthen midface, improve posture with side bends, and increase elastic hold time.',
    '["Master Single Sips with frozen/neutral face", "Apply proper chewing to 20 Foods with awareness", "Strengthen midface with Cheek Lifts", "Improve posture with Standing Side Bends", "Increase elastic hold to 40 minutes", "Continue mouth taping overnight"]',
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
  RETURNING id INTO v_week_19_id;

  -- Delete existing exercises for week 19
  DELETE FROM exercises WHERE week_id = v_week_19_id;

  -- Insert exercises for Week 19
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (
    v_week_19_id,
    'Single Sips - Frozen Face',
    'active',
    '2x/day',
    '1 minute',
    28,
    'This exercise is taking the concept of Water Trap and doing the exercise quickly so it becomes second nature. Once the concept is mastered with a glass of water, practice from other containers (bottle, can, thermos, straw, mug etc). Start with small sips/spoonfuls (advancing to larger ones once able) and trap in a perfect bowl against the roof of your mouth. Push tongue against roof of mouth into lingual palatal suction shape for swallowing. The face should be neutral and should not move during this exercise.',
    'Glass of Water, various containers (bottle, can, thermos, straw, mug)',
    'Avoid facial grimace (pursing of lips, tightening cheeks, and chin dimpling), moving/bobbing head, or neck engagement. Watch for Tongue Thrust (Pushing tongue into the teeth to swallow, tongue should push against the palate). If you struggle with this exercise, go back and practice smile swallows or water trap first.',
    ''
  ),
  (
    v_week_19_id,
    '20 Foods',
    'active',
    'Multiple sessions',
    '5 bites each food',
    28,
    'This exercise is a progression of the Cracker Chew and Check, but this time different foods are used. Take a regular sized bite of the food, chew thoroughly - at least 20 times. When the food is soft enough to swallow, form a bolus (small rounded mass of chewed food/saliva), then swallow the food with the teeth together, lips/cheeks back, and tongue on the Spot. A second, "clean-up swallow" should be done to collect the remaining bits of food within the mouth. Used for developing coordination of tongue and oral muscles to achieve functional chewing and swallowing. Gain awareness of chewing thoroughly, using the teeth to chew and not the tongue to suck on food while eating, and manipulation and control of food within the oral cavity.',
    '20 different foods (crunchy or harder foods ideally), 5 bites of each',
    'Avoid facial grimace (pursing of lips, tightening cheeks, and chin dimpling), moving/bobbing head, or neck engagement. Watch for Tongue Thrust (Pushing tongue into the teeth to swallow, tongue should push against the palate). Scan face, head, neck, and shoulders for tension or pain during exercise and try to release it.',
    ''
  ),
  (
    v_week_19_id,
    'Cheek Lifts',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'Smile on each side of face – you may wink or squint one eye closed to help active midface muscles. Watch to make sure the muscles of the cheek and under eye are moving. To make exercise more difficult you can try lifting your nostril/lip on each side. Troubleshooting: If you struggle to use the midface muscles, start with tapping/brushing the pads of the fingers across the cheeks. This will create sensory input and help stimulate the nerves and muscles.',
    'None',
    'People with weak midface muscles will often smile with their lower face causing neck engagement. The smile line will often be angled downward or straight across. Work on smiling in an "upward" direction with the corner of mouth and think about cheeks when smiling.',
    ''
  ),
  (
    v_week_19_id,
    'Standing Side Bends',
    'posture',
    '1x/day',
    '2 minutes',
    14,
    'With the tongue on the spot and mouth closed, stand with your back against the wall, with feet shoulder width apart. Place your left palm on the left side of your head near your temple. Guide your head and tilt your body towards the right until you feel a stretch along the left side of your body, shoulder and neck. Take three to ten breaths, ensuring your mouth is closed and tongue is still on the spot. Switch sides and repeat for 2 minutes. Roll shoulder slowly from front to back. Hold them back as far as possible, hold there for the count of 3. Repeat for 1 minute, using slow rotations of the shoulders.',
    'Wall',
    'Maintain tongue on spot and closed mouth throughout.',
    ''
  ),
  (
    v_week_19_id,
    'Middle of Tongue – Two Elastic Hold',
    'passive',
    '1x/day',
    '40 minutes',
    14,
    'Place elastic on the tip of the tongue and middle of the tongue and hold it to the spot and the roof of the mouth. If concerned about swallowing tie a piece of floss to elastic to keep between lips.',
    '2 Elastics, optional floss',
    'None',
    ''
  ),
  (
    v_week_19_id,
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

  -- Week 20 uses the same exercises as Week 19
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
    20,
    'Week 19-20: Frozen Face & Real Food Integration (Continued)',
    'Continue with the same exercises from week 19. Focus on making natural swallowing with a neutral face expression your default, and continue applying proper technique to all foods you eat.',
    'Continue all exercises from Week 19. Focus on making proper swallowing and chewing automatic in all eating situations.',
    '["Master Single Sips with frozen/neutral face", "Complete proper chewing with 20 Foods", "Strengthen midface with Cheek Lifts", "Improve posture with Standing Side Bends", "Continue 40-minute elastic holds", "Continue mouth taping overnight"]',
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
  RETURNING id INTO v_week_20_id;

  -- Delete existing exercises for week 20
  DELETE FROM exercises WHERE week_id = v_week_20_id;

  -- Insert same exercises for Week 20
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (
    v_week_20_id,
    'Single Sips - Frozen Face',
    'active',
    '2x/day',
    '1 minute',
    28,
    'This exercise is taking the concept of Water Trap and doing the exercise quickly so it becomes second nature. Once the concept is mastered with a glass of water, practice from other containers (bottle, can, thermos, straw, mug etc). Start with small sips/spoonfuls (advancing to larger ones once able) and trap in a perfect bowl against the roof of your mouth. Push tongue against roof of mouth into lingual palatal suction shape for swallowing. The face should be neutral and should not move during this exercise.',
    'Glass of Water, various containers (bottle, can, thermos, straw, mug)',
    'Avoid facial grimace (pursing of lips, tightening cheeks, and chin dimpling), moving/bobbing head, or neck engagement. Watch for Tongue Thrust (Pushing tongue into the teeth to swallow, tongue should push against the palate). If you struggle with this exercise, go back and practice smile swallows or water trap first.',
    ''
  ),
  (
    v_week_20_id,
    '20 Foods',
    'active',
    'Multiple sessions',
    '5 bites each food',
    28,
    'This exercise is a progression of the Cracker Chew and Check, but this time different foods are used. Take a regular sized bite of the food, chew thoroughly - at least 20 times. When the food is soft enough to swallow, form a bolus (small rounded mass of chewed food/saliva), then swallow the food with the teeth together, lips/cheeks back, and tongue on the Spot. A second, "clean-up swallow" should be done to collect the remaining bits of food within the mouth. Used for developing coordination of tongue and oral muscles to achieve functional chewing and swallowing. Gain awareness of chewing thoroughly, using the teeth to chew and not the tongue to suck on food while eating, and manipulation and control of food within the oral cavity.',
    '20 different foods (crunchy or harder foods ideally), 5 bites of each',
    'Avoid facial grimace (pursing of lips, tightening cheeks, and chin dimpling), moving/bobbing head, or neck engagement. Watch for Tongue Thrust (Pushing tongue into the teeth to swallow, tongue should push against the palate). Scan face, head, neck, and shoulders for tension or pain during exercise and try to release it.',
    ''
  ),
  (
    v_week_20_id,
    'Cheek Lifts',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'Smile on each side of face – you may wink or squint one eye closed to help active midface muscles. Watch to make sure the muscles of the cheek and under eye are moving. To make exercise more difficult you can try lifting your nostril/lip on each side. Troubleshooting: If you struggle to use the midface muscles, start with tapping/brushing the pads of the fingers across the cheeks. This will create sensory input and help stimulate the nerves and muscles.',
    'None',
    'People with weak midface muscles will often smile with their lower face causing neck engagement. The smile line will often be angled downward or straight across. Work on smiling in an "upward" direction with the corner of mouth and think about cheeks when smiling.',
    ''
  ),
  (
    v_week_20_id,
    'Standing Side Bends',
    'posture',
    '1x/day',
    '2 minutes',
    14,
    'With the tongue on the spot and mouth closed, stand with your back against the wall, with feet shoulder width apart. Place your left palm on the left side of your head near your temple. Guide your head and tilt your body towards the right until you feel a stretch along the left side of your body, shoulder and neck. Take three to ten breaths, ensuring your mouth is closed and tongue is still on the spot. Switch sides and repeat for 2 minutes. Roll shoulder slowly from front to back. Hold them back as far as possible, hold there for the count of 3. Repeat for 1 minute, using slow rotations of the shoulders.',
    'Wall',
    'Maintain tongue on spot and closed mouth throughout.',
    ''
  ),
  (
    v_week_20_id,
    'Middle of Tongue – Two Elastic Hold',
    'passive',
    '1x/day',
    '40 minutes',
    14,
    'Place elastic on the tip of the tongue and middle of the tongue and hold it to the spot and the roof of the mouth. If concerned about swallowing tie a piece of floss to elastic to keep between lips.',
    '2 Elastics, optional floss',
    'None',
    ''
  ),
  (
    v_week_20_id,
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