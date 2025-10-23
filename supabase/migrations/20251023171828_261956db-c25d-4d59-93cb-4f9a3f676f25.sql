-- Get the program ID for "Myofunctional Therapy Program"
DO $$
DECLARE
  v_program_id UUID;
  v_week_11_id UUID;
  v_week_12_id UUID;
BEGIN
  -- Get program ID
  SELECT id INTO v_program_id FROM programs WHERE title = 'Myofunctional Therapy Program' LIMIT 1;
  
  -- Upsert Week 11
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
    11,
    'Week 11-12: Building Strength & Endurance',
    'These two weeks focus on building tongue strength and endurance while continuing post-frenectomy healing. You''ll master the Perfect Bowl exercise, continue stretching work, and increase your nasal breathing activities.',
    'Continue strengthening exercises with alternating routines. Add walking with nasal breathing and increase passive exercise time.',
    '["Master the Perfect Bowl tongue shape", "Build lip strength with Lip Pops", "Alternate between suction, stretch, and trace exercises", "Walk 15 minutes with nasal breathing 4x/week", "Hold elastic on middle of tongue for 20 minutes", "Tape mouth overnight"]',
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
  RETURNING id INTO v_week_11_id;

  -- Delete existing exercises for week 11
  DELETE FROM exercises WHERE week_id = v_week_11_id;

  -- Insert exercises for Week 11
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (
    v_week_11_id,
    'Perfect Bowl',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'Mouth should be open about half way (practice with a smile for 1 minute and relaxed face for 1 minute), the tongue should form a bowl shape by sinking into the floor of the mouth and curling the sides and tip up. The first goal is to successfully make the correct shape with the tongue. Once this is achieved, the second goal is to hold the shape for 10 seconds or longer without compensations.',
    'Mirror, optional: chopstick, elastic band, or small candy/goldfish cracker for kids',
    'Watch in the mirror to avoid lips rounding, neck engagement, jaw lateralization and jaw protrusion. Make sure this can be done with a relaxed/still face as well as with cheeks/lips back in a smile. The tongue may want to rise up high in the mouth while making the bowl shape. If this happens, practice lowering the tongue into the floor of the mouth in a normal shape first. If you struggle rolling the sides, a chopstick can be used to gently press the center of the tongue down, or a band can be placed on the surface of the tongue as a target to "wrap the edges around". A small candy or goldfish cracker can be used to make this more fun for kids. This exercise can be difficult to master and you may not be able to accomplish it until you have a lightbulb moment and then it will be easier afterwards. Keep practicing and don''t be discouraged!',
    ''
  ),
  (
    v_week_11_id,
    'Lip Pops',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'Hold the lips between the teeth for 5 seconds and pop them out with a clear and loud sound.',
    'None',
    'This exercise may cause facial tension/pain for people with TMD. Important to limit tension, neck engagement and jaw protrusion to prevent issues.',
    ''
  ),
  (
    v_week_11_id,
    'Lingual Palatal Suction (Alternating)',
    'active',
    'Alternating',
    '1 minute',
    0,
    'Keep your lips back in a smile. Open mouth as wide as possible without floor of mouth lifting. Use strong suction to hold the tongue to the roof of your mouth and hold for as long as possible (Start with 10 seconds and work up to 1 minute). Try focusing on lifting the back portion of the tongue to the palate. If tongue is overflowing you can slowly open and close teeth together to help tongue squish inside the arch. Using provided chopsticks to push the tongue inside of the arch can also help.',
    'Bite Block or Chopstick',
    'Watch in mirror for facial grimace (chin strain/dimpling), neck engagement, jaw protrusion and jaw lateralization, floor of mouth activation – use bite block to avoid',
    ''
  ),
  (
    v_week_11_id,
    'Tongue Stretch (Alternating)',
    'active',
    'Alternating',
    '1 minute',
    0,
    'Pull the tongue straight out of the mouth. Avoid tensing tongue, jaw, neck and face.',
    'None',
    'Avoid tensing tongue, jaw, neck and face',
    ''
  ),
  (
    v_week_11_id,
    'Tongue Trace (Alternating)',
    'active',
    'Alternating',
    '1 minute',
    0,
    'Try with your mouth open, halfway or closed. Place the tip of the tongue against the spot and trace back along the palate in a straight line and far back as possible. You should feel a stretch in the frenum and floor of your mouth.',
    'Bite Block',
    'Watch in mirror for jaw lateralization and jaw protrusion - use bite block to avoid. Scan for head/neck/facial/body tension and try to ease.',
    ''
  ),
  (
    v_week_11_id,
    '15-Minute Walk: Nasal Breathing Only',
    'breathing',
    '4x/week',
    '15 minutes',
    8,
    'Walk for 15 minutes, concentrating on breathing through your nose, ideally using mouth tape. Keep a casual but steady pace. If you feel winded or lacking oxygen, just slow down. If you need to stop completely to slow your breathing, that''s okay too. Just don''t allow yourself to breathe through your mouth. If this is easy for you, then you can try speeding up, walking up a hill, or jogging for a short distance.',
    'Mouth tape (optional but recommended)',
    'Avoid talking, laughing, sighing, yawning, sniffing, and any other signs of over breathing that your body may try to get you to do. Consider doing the unblocking your nose exercises first.',
    ''
  ),
  (
    v_week_11_id,
    'Middle of Tongue – One Elastic Hold',
    'passive',
    '1x/day',
    '20 minutes',
    14,
    'Place elastic on the middle of the tongue and hold it to the roof of the mouth. If concerned about swallowing tie a piece of floss to elastic to keep between lips.',
    '1 Elastic, optional floss',
    'None',
    ''
  ),
  (
    v_week_11_id,
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

  -- Week 12 uses the same exercises as Week 11, so we point to the same week
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
    12,
    'Week 11-12: Building Strength & Endurance (Continued)',
    'Continue with the same exercises from week 11. By now you should expect 50% improvement or 50% total with tongue posture, nasal breathing and lip seal. How is your level of awareness throughout the day?',
    'Continue all exercises from Week 11. Focus on mastering the Perfect Bowl and increasing your comfort with nasal breathing during walks.',
    '["Master the Perfect Bowl tongue shape", "Build lip strength with Lip Pops", "Alternate between suction, stretch, and trace exercises", "Walk 15 minutes with nasal breathing 4x/week", "Hold elastic on middle of tongue for 20 minutes", "Tape mouth overnight"]',
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
  RETURNING id INTO v_week_12_id;

  -- Delete existing exercises for week 12
  DELETE FROM exercises WHERE week_id = v_week_12_id;

  -- Insert same exercises for Week 12
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (
    v_week_12_id,
    'Perfect Bowl',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'Mouth should be open about half way (practice with a smile for 1 minute and relaxed face for 1 minute), the tongue should form a bowl shape by sinking into the floor of the mouth and curling the sides and tip up. The first goal is to successfully make the correct shape with the tongue. Once this is achieved, the second goal is to hold the shape for 10 seconds or longer without compensations.',
    'Mirror, optional: chopstick, elastic band, or small candy/goldfish cracker for kids',
    'Watch in the mirror to avoid lips rounding, neck engagement, jaw lateralization and jaw protrusion. Make sure this can be done with a relaxed/still face as well as with cheeks/lips back in a smile. The tongue may want to rise up high in the mouth while making the bowl shape. If this happens, practice lowering the tongue into the floor of the mouth in a normal shape first. If you struggle rolling the sides, a chopstick can be used to gently press the center of the tongue down, or a band can be placed on the surface of the tongue as a target to "wrap the edges around". A small candy or goldfish cracker can be used to make this more fun for kids. This exercise can be difficult to master and you may not be able to accomplish it until you have a lightbulb moment and then it will be easier afterwards. Keep practicing and don''t be discouraged!',
    ''
  ),
  (
    v_week_12_id,
    'Lip Pops',
    'active',
    '2x/day',
    '2 minutes',
    28,
    'Hold the lips between the teeth for 5 seconds and pop them out with a clear and loud sound.',
    'None',
    'This exercise may cause facial tension/pain for people with TMD. Important to limit tension, neck engagement and jaw protrusion to prevent issues.',
    ''
  ),
  (
    v_week_12_id,
    'Lingual Palatal Suction (Alternating)',
    'active',
    'Alternating',
    '1 minute',
    0,
    'Keep your lips back in a smile. Open mouth as wide as possible without floor of mouth lifting. Use strong suction to hold the tongue to the roof of your mouth and hold for as long as possible (Start with 10 seconds and work up to 1 minute). Try focusing on lifting the back portion of the tongue to the palate. If tongue is overflowing you can slowly open and close teeth together to help tongue squish inside the arch. Using provided chopsticks to push the tongue inside of the arch can also help.',
    'Bite Block or Chopstick',
    'Watch in mirror for facial grimace (chin strain/dimpling), neck engagement, jaw protrusion and jaw lateralization, floor of mouth activation – use bite block to avoid',
    ''
  ),
  (
    v_week_12_id,
    'Tongue Stretch (Alternating)',
    'active',
    'Alternating',
    '1 minute',
    0,
    'Pull the tongue straight out of the mouth. Avoid tensing tongue, jaw, neck and face.',
    'None',
    'Avoid tensing tongue, jaw, neck and face',
    ''
  ),
  (
    v_week_12_id,
    'Tongue Trace (Alternating)',
    'active',
    'Alternating',
    '1 minute',
    0,
    'Try with your mouth open, halfway or closed. Place the tip of the tongue against the spot and trace back along the palate in a straight line and far back as possible. You should feel a stretch in the frenum and floor of your mouth.',
    'Bite Block',
    'Watch in mirror for jaw lateralization and jaw protrusion - use bite block to avoid. Scan for head/neck/facial/body tension and try to ease.',
    ''
  ),
  (
    v_week_12_id,
    '15-Minute Walk: Nasal Breathing Only',
    'breathing',
    '4x/week',
    '15 minutes',
    8,
    'Walk for 15 minutes, concentrating on breathing through your nose, ideally using mouth tape. Keep a casual but steady pace. If you feel winded or lacking oxygen, just slow down. If you need to stop completely to slow your breathing, that''s okay too. Just don''t allow yourself to breathe through your mouth. If this is easy for you, then you can try speeding up, walking up a hill, or jogging for a short distance.',
    'Mouth tape (optional but recommended)',
    'Avoid talking, laughing, sighing, yawning, sniffing, and any other signs of over breathing that your body may try to get you to do. Consider doing the unblocking your nose exercises first.',
    ''
  ),
  (
    v_week_12_id,
    'Middle of Tongue – One Elastic Hold',
    'passive',
    '1x/day',
    '20 minutes',
    14,
    'Place elastic on the middle of the tongue and hold it to the roof of the mouth. If concerned about swallowing tie a piece of floss to elastic to keep between lips.',
    '1 Elastic, optional floss',
    'None',
    ''
  ),
  (
    v_week_12_id,
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