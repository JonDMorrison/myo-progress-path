-- Get the program ID for "Myofunctional Therapy Program"
DO $$
DECLARE
  v_program_id UUID;
  v_week_13_id UUID;
  v_week_14_id UUID;
BEGIN
  -- Get program ID
  SELECT id INTO v_program_id FROM programs WHERE title = 'Myofunctional Therapy Program' LIMIT 1;
  
  -- Upsert Week 13
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
    13,
    'Week 13-14: Swallowing & Tongue Precision',
    'These weeks introduce advanced tongue shaping (Pickle Tongue), swallowing retraining (Smile Swallows), and precise tongue movements (Teeth Trace). You''ll also perform a midway BOLT test to check your breathing progress.',
    'Focus on tongue precision, swallowing pattern correction, and midway assessment of breathing health with the BOLT test.',
    '["Master Pickle Tongue shape and hold", "Learn proper swallow pattern with Smile Swallows", "Develop tongue precision with Teeth Trace/Upper Lip Licks", "Complete midway BOLT test assessment", "Increase elastic hold to 25 minutes", "Continue mouth taping overnight"]',
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
  RETURNING id INTO v_week_13_id;

  -- Delete existing exercises for week 13
  DELETE FROM exercises WHERE week_id = v_week_13_id;

  -- Insert exercises for Week 13
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (
    v_week_13_id,
    'Pickle Tongue',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'Focus on narrowing the sides and rounding the top of the tongue while sticking the tongue out of the mouth. If you are unable to narrow tongue, go back to the Tongue Points exercise (from Weeks 3-4). If you are unable to activate the muscles to round the top surface of the tongue, use a toothbrush to brush the top of the tongue or slide along front teeth. Must be able to hold shape for 10-20 seconds without compensations after practice weeks.',
    'Toothbrush or Bite Block',
    'Watch in mirror for facial grimace (pursing of lips), neck engagement, and jaw protrusion. Can use bite block on molars to prevent jaw protrusion.',
    ''
  ),
  (
    v_week_13_id,
    'Smile Swallows',
    'active',
    '2x/day',
    '1 minute',
    28,
    'Squeeze water from pipette into mouth and with cheeks back in a big smile swallow the water. This exercise is not meant to replicate natural drinking. It is designed to help learn a new swallowing pattern through repetition and neuromuscular re-education. If this is difficult for you practice lingual palatal suction prior.',
    'Pipette, Chopstick',
    'Watch in mirror for neck engagement, facial grimace (lips rounding), lips trying to close during swallow - bite on chopstick to help avoid. Watch in mirror for Tongue Thrust (Pushing tongue into the teeth to swallow, tongue should push against the palate).',
    ''
  ),
  (
    v_week_13_id,
    'Teeth Trace/Upper Lip Licks',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'The mouth should be open half way. Practice with cheeks back in a smile and relaxed face. Tongue movements should be as precise and slow as possible. The smallest surface on the tip of the tongue should be used to trace the lips (or teeth if lips are too difficult). The goal is to have the tongue trace only the pink part of the lips, and not move onto the surrounding skin of the face.',
    'None',
    'Avoid neck engagement and jaw lateralization during exercise to help with tongue-jaw dissociation. Continue with nasal breathing (Consider doing the unblocking your nose exercises first).',
    ''
  ),
  (
    v_week_13_id,
    'BOLT Test (Midway Check In)',
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
4. Release your nose and stop the timer at these first signs of "air hunger". This will tell you your initial score.

Tips: When you release your nose, your inhalation should remain calm. If you are breathing heavily or taking deep breaths, then you waited too long and the score is not correct. Keep in mind that this is not a breath-holding test.',
    'Stopwatch or timer',
    'This is not a breath-holding competition. Release at the first sign of air hunger.',
    ''
  ),
  (
    v_week_13_id,
    'Middle of Tongue – One Elastic Hold',
    'passive',
    '1x/day',
    '25 minutes',
    14,
    'Place elastic on the middle of the tongue and hold it to the roof of the mouth. If concerned about swallowing tie a piece of floss to elastic to keep between lips.',
    '1 Elastic, optional floss',
    'None',
    ''
  ),
  (
    v_week_13_id,
    'Mouth Taping Over Night',
    'passive',
    'Nightly',
    'Overnight',
    14,
    'Make sure you have tape that will stick and not irritate your skin. Use lip balm or Chapstick if your lips are dry, before applying the tape. Place the tape however you are most comfortable – vertically, horizontally, or in an X pattern. Sealing off the air is recommended unless you are uncomfortable with this feeling.',
    'Micropore or Surgical Tape, lip balm/Chapstick',
    'If you feel claustrophobic, practice the Belly Breathing Exercise to help relax yourself and adjust your breathing before applying the tape. Consider doing the unblocking your nose exercises first. Start with shorter periods if needed.',
    ''
  );

  -- Week 14 uses the same exercises as Week 13
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
    14,
    'Week 13-14: Swallowing & Tongue Precision (Continued)',
    'Continue with the same exercises from week 13. Focus on refining your technique and mastering the new swallowing pattern.',
    'Continue all exercises from Week 13. Focus on precision and consistency in your tongue movements and swallowing pattern.',
    '["Master Pickle Tongue shape and hold", "Perfect Smile Swallows technique", "Develop tongue precision with Teeth Trace/Upper Lip Licks", "Increase elastic hold to 25 minutes", "Continue mouth taping overnight"]',
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
  RETURNING id INTO v_week_14_id;

  -- Delete existing exercises for week 14
  DELETE FROM exercises WHERE week_id = v_week_14_id;

  -- Insert same exercises for Week 14 (except BOLT test is only done in week 13)
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (
    v_week_14_id,
    'Pickle Tongue',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'Focus on narrowing the sides and rounding the top of the tongue while sticking the tongue out of the mouth. If you are unable to narrow tongue, go back to the Tongue Points exercise (from Weeks 3-4). If you are unable to activate the muscles to round the top surface of the tongue, use a toothbrush to brush the top of the tongue or slide along front teeth. Must be able to hold shape for 10-20 seconds without compensations after practice weeks.',
    'Toothbrush or Bite Block',
    'Watch in mirror for facial grimace (pursing of lips), neck engagement, and jaw protrusion. Can use bite block on molars to prevent jaw protrusion.',
    ''
  ),
  (
    v_week_14_id,
    'Smile Swallows',
    'active',
    '2x/day',
    '1 minute',
    28,
    'Squeeze water from pipette into mouth and with cheeks back in a big smile swallow the water. This exercise is not meant to replicate natural drinking. It is designed to help learn a new swallowing pattern through repetition and neuromuscular re-education. If this is difficult for you practice lingual palatal suction prior.',
    'Pipette, Chopstick',
    'Watch in mirror for neck engagement, facial grimace (lips rounding), lips trying to close during swallow - bite on chopstick to help avoid. Watch in mirror for Tongue Thrust (Pushing tongue into the teeth to swallow, tongue should push against the palate).',
    ''
  ),
  (
    v_week_14_id,
    'Teeth Trace/Upper Lip Licks',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'The mouth should be open half way. Practice with cheeks back in a smile and relaxed face. Tongue movements should be as precise and slow as possible. The smallest surface on the tip of the tongue should be used to trace the lips (or teeth if lips are too difficult). The goal is to have the tongue trace only the pink part of the lips, and not move onto the surrounding skin of the face.',
    'None',
    'Avoid neck engagement and jaw lateralization during exercise to help with tongue-jaw dissociation. Continue with nasal breathing (Consider doing the unblocking your nose exercises first).',
    ''
  ),
  (
    v_week_14_id,
    'Middle of Tongue – One Elastic Hold',
    'passive',
    '1x/day',
    '25 minutes',
    14,
    'Place elastic on the middle of the tongue and hold it to the roof of the mouth. If concerned about swallowing tie a piece of floss to elastic to keep between lips.',
    '1 Elastic, optional floss',
    'None',
    ''
  ),
  (
    v_week_14_id,
    'Mouth Taping Over Night',
    'passive',
    'Nightly',
    'Overnight',
    14,
    'Make sure you have tape that will stick and not irritate your skin. Use lip balm or Chapstick if your lips are dry, before applying the tape. Place the tape however you are most comfortable – vertically, horizontally, or in an X pattern. Sealing off the air is recommended unless you are uncomfortable with this feeling.',
    'Micropore or Surgical Tape, lip balm/Chapstick',
    'If you feel claustrophobic, practice the Belly Breathing Exercise to help relax yourself and adjust your breathing before applying the tape. Consider doing the unblocking your nose exercises first. Start with shorter periods if needed.',
    ''
  );

END $$;