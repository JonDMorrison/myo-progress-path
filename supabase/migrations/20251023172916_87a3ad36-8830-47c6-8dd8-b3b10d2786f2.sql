-- Get the program ID for "Myofunctional Therapy Program"
DO $$
DECLARE
  v_program_id UUID;
  v_week_15_id UUID;
  v_week_16_id UUID;
BEGIN
  -- Get program ID
  SELECT id INTO v_program_id FROM programs WHERE title = 'Myofunctional Therapy Program' LIMIT 1;
  
  -- Upsert Week 15
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
    15,
    'Week 15-16: Advanced Swallowing & Breathing',
    'These weeks focus on advanced swallowing exercises with real food and liquids (Water Trap and Soft Food Trap), strengthening lip muscles (Button Pulls), and introducing Reduced Breathing technique to improve your BOLT score. You should be seeing 60%+ improvement in tongue posture, nasal breathing, and lip seal by now.',
    'Master advanced swallowing with liquids and soft foods, strengthen lip muscles, and improve breathing efficiency through reduced breathing exercises.',
    '["Master Water Trap and Soft Food Trap swallowing", "Perfect Middle Tongue Push technique", "Strengthen lips with Button Pulls", "Improve BOLT score with Reduced Breathing", "Increase elastic hold to 30 minutes", "Continue mouth taping overnight"]',
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
  RETURNING id INTO v_week_15_id;

  -- Delete existing exercises for week 15
  DELETE FROM exercises WHERE week_id = v_week_15_id;

  -- Insert exercises for Week 15
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (
    v_week_15_id,
    'Water Trap and Soft Food Trap',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'We will be advancing perfect bowl/smile swallow/lingual palatal suction exercises from previous weeks for this swallowing exercise. Start with small sips/spoonfuls (advancing to larger ones once able) and trap in a perfect bowl against the roof of your mouth. Push tongue against roof of mouth into lingual palatal suction shape for swallowing. Cheeks, lips, and teeth should be in a smile during exercise. If struggling with exercise practice Lingual Palatal Suction, Perfect Bowl or Smile Swallows from previous weeks first.',
    'Glass of Water, Soft Food (yogurt, pudding, or apple sauce)',
    'Watch in the mirror, focusing on eliminating facial grimace (chin dimpling/strain and lips pursing) neck engagement or head bob during swallow. Watch for Tongue Thrust (Pushing tongue into the teeth to swallow, tongue should push against the palate).',
    ''
  ),
  (
    v_week_15_id,
    'Middle Tongue Push',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'This exercise should make the tongue appear to be the shape of a ball – the dorsal surface should appear rounded and the tongue should be pulled back in the mouth. Think of Pickle Tongue exercise without tongue protruding outside of the mouth. The tip of the tongue should not be touching the teeth, the spot, or the palate. It should be "hovering" in the middle of the mouth in an open posture. Start with 3 seconds and work up to 10. Can try adding "kuh" sound to beginning of exercise to form shape.',
    'Toothbrush (may be helpful)',
    'Avoid jaw protrusion, keep mouth halfway open, avoid pursing lips and neck engagement.',
    ''
  ),
  (
    v_week_15_id,
    'Button Pulls',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'Place the button in front of the teeth and behind the lips. Pull hard enough with string parallel to the floor to feel lip muscle activation. 20 seconds out the front, left, and right sides. Repeat twice for a total of 2 minutes.',
    'Button on string',
    'Watch in the mirror for jaw protrusion - bite teeth gently together to avoid. Use muscles around lips rather than chin muscle.',
    ''
  ),
  (
    v_week_15_id,
    'Reduced Breathing',
    'breathing',
    '1x/day',
    '10 minutes',
    14,
    'Helps to improve BOLT score. Consider doing the unblocking your nose exercises first.

Instructions:
1. Start this exercise by doing the BOLT Test
2. Instead of releasing your nose to take your bolt score measurement, extend your breath hold for 5-10 seconds longer. This should create a feeling of air hunger
3. Release your nose and start your timer
4. Do not gasp in air through your mouth or take deep breaths. Focus on breathing through your nose for the next 2 minutes at a "reduced rate"
5. Inhale about 10% less than you would normally
6. For the 2-minute duration, you should feel like you are maintaining a slightly oxygen-deprived state. It should not feel too difficult, just a slight struggle
7. Concentrate on breathing slowly, into your belly or diaphragm. Count to 5 as you inhale, pause for 3 with lungs filled, and count to 5 as you exhale
8. When the 2 minutes are up, allow your breathing to return to normal. Do not take deep or gasping breaths
9. Breathe normally for 1 minute then decrease your breathing to the "reduced rate" (10% less) and repeat for 2 more minutes, followed by 1 minute normal breathing
10. Repeat this for a total of 3 cycles – it should take about 10 minutes total including the BOLT Test at the beginning

Tips:
- If this exercise is too difficult, you are probably reducing your breathing too much
- Remember that you only need to do the BOLT test at the beginning of the exercise once, not at the beginning of each cycle',
    'Timer',
    'Do not reduce breathing too much. Should be a slight struggle, not difficult.',
    ''
  ),
  (
    v_week_15_id,
    'Middle of Tongue – One Elastic Hold',
    'passive',
    '1x/day',
    '30 minutes',
    14,
    'Place elastic on the middle of the tongue and hold it to the roof of the mouth. If concerned about swallowing tie a piece of floss to elastic to keep between lips.',
    '1 Elastic, optional floss',
    'None',
    ''
  ),
  (
    v_week_15_id,
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

  -- Week 16 uses the same exercises as Week 15
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
    16,
    'Week 15-16: Advanced Swallowing & Breathing (Continued)',
    'Continue with the same exercises from week 15. Focus on refining your swallowing technique with real food and liquids, and improving your breathing efficiency.',
    'Continue all exercises from Week 15. Focus on consistency and technique refinement in swallowing and breathing exercises.',
    '["Master Water Trap and Soft Food Trap swallowing", "Perfect Middle Tongue Push technique", "Strengthen lips with Button Pulls", "Improve BOLT score with Reduced Breathing", "Increase elastic hold to 30 minutes", "Continue mouth taping overnight"]',
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
  RETURNING id INTO v_week_16_id;

  -- Delete existing exercises for week 16
  DELETE FROM exercises WHERE week_id = v_week_16_id;

  -- Insert same exercises for Week 16
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (
    v_week_16_id,
    'Water Trap and Soft Food Trap',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'We will be advancing perfect bowl/smile swallow/lingual palatal suction exercises from previous weeks for this swallowing exercise. Start with small sips/spoonfuls (advancing to larger ones once able) and trap in a perfect bowl against the roof of your mouth. Push tongue against roof of mouth into lingual palatal suction shape for swallowing. Cheeks, lips, and teeth should be in a smile during exercise. If struggling with exercise practice Lingual Palatal Suction, Perfect Bowl or Smile Swallows from previous weeks first.',
    'Glass of Water, Soft Food (yogurt, pudding, or apple sauce)',
    'Watch in the mirror, focusing on eliminating facial grimace (chin dimpling/strain and lips pursing) neck engagement or head bob during swallow. Watch for Tongue Thrust (Pushing tongue into the teeth to swallow, tongue should push against the palate).',
    ''
  ),
  (
    v_week_16_id,
    'Middle Tongue Push',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'This exercise should make the tongue appear to be the shape of a ball – the dorsal surface should appear rounded and the tongue should be pulled back in the mouth. Think of Pickle Tongue exercise without tongue protruding outside of the mouth. The tip of the tongue should not be touching the teeth, the spot, or the palate. It should be "hovering" in the middle of the mouth in an open posture. Start with 3 seconds and work up to 10. Can try adding "kuh" sound to beginning of exercise to form shape.',
    'Toothbrush (may be helpful)',
    'Avoid jaw protrusion, keep mouth halfway open, avoid pursing lips and neck engagement.',
    ''
  ),
  (
    v_week_16_id,
    'Button Pulls',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'Place the button in front of the teeth and behind the lips. Pull hard enough with string parallel to the floor to feel lip muscle activation. 20 seconds out the front, left, and right sides. Repeat twice for a total of 2 minutes.',
    'Button on string',
    'Watch in the mirror for jaw protrusion - bite teeth gently together to avoid. Use muscles around lips rather than chin muscle.',
    ''
  ),
  (
    v_week_16_id,
    'Reduced Breathing',
    'breathing',
    '1x/day',
    '10 minutes',
    14,
    'Helps to improve BOLT score. Consider doing the unblocking your nose exercises first.

Instructions:
1. Start this exercise by doing the BOLT Test
2. Instead of releasing your nose to take your bolt score measurement, extend your breath hold for 5-10 seconds longer. This should create a feeling of air hunger
3. Release your nose and start your timer
4. Do not gasp in air through your mouth or take deep breaths. Focus on breathing through your nose for the next 2 minutes at a "reduced rate"
5. Inhale about 10% less than you would normally
6. For the 2-minute duration, you should feel like you are maintaining a slightly oxygen-deprived state. It should not feel too difficult, just a slight struggle
7. Concentrate on breathing slowly, into your belly or diaphragm. Count to 5 as you inhale, pause for 3 with lungs filled, and count to 5 as you exhale
8. When the 2 minutes are up, allow your breathing to return to normal. Do not take deep or gasping breaths
9. Breathe normally for 1 minute then decrease your breathing to the "reduced rate" (10% less) and repeat for 2 more minutes, followed by 1 minute normal breathing
10. Repeat this for a total of 3 cycles – it should take about 10 minutes total including the BOLT Test at the beginning

Tips:
- If this exercise is too difficult, you are probably reducing your breathing too much
- Remember that you only need to do the BOLT test at the beginning of the exercise once, not at the beginning of each cycle',
    'Timer',
    'Do not reduce breathing too much. Should be a slight struggle, not difficult.',
    ''
  ),
  (
    v_week_16_id,
    'Middle of Tongue – One Elastic Hold',
    'passive',
    '1x/day',
    '30 minutes',
    14,
    'Place elastic on the middle of the tongue and hold it to the roof of the mouth. If concerned about swallowing tie a piece of floss to elastic to keep between lips.',
    '1 Elastic, optional floss',
    'None',
    ''
  ),
  (
    v_week_16_id,
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