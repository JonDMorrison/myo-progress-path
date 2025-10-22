-- Import Weeks 7-8 Pre-Frenectomy exercises
DO $$
DECLARE
  v_program_id uuid;
  v_week7_id uuid;
  v_week8_id uuid;
BEGIN
  -- Get the program ID
  SELECT id INTO v_program_id FROM programs LIMIT 1;
  
  -- Upsert Week 7
  INSERT INTO weeks (
    program_id, number, title, introduction, overview, objectives,
    video_title, video_url, requires_bolt, requires_video_first, requires_video_last,
    checklist_schema
  ) VALUES (
    v_program_id,
    7,
    'Week 7 - Pre-Frenectomy Preparation',
    '**Important Note:** Continue Pre-Frenectomy Exercises and Stretches. This week introduces advanced stretching and release techniques to optimize your preparation for the frenectomy procedure.

These exercises focus on maximizing tongue mobility, releasing floor of mouth tension, and refining your breathing patterns before surgery.',
    'Build on previous weeks with advanced tongue stretches and manual release techniques. Master the lingual palatal suction exercise which is critical for post-frenectomy success.',
    '["Master the lingual palatal suction hold (most important pre-frenectomy exercise)", "Develop awareness of tongue overflow patterns", "Learn manual stretching and release techniques", "Recognize and reduce over-breathing habits", "Extend passive elastic hold duration to 15 minutes"]'::jsonb,
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
  RETURNING id INTO v_week7_id;

  -- Delete old exercises for week 7
  DELETE FROM exercises WHERE week_id = v_week7_id;

  -- Insert exercises for Week 7
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (v_week7_id, 'Tongue Trace', 'active', '2-3x/day', '1 minute', 42,
   'Try with your mouth open, halfway or closed. Place the tip of tongue against the spot and trace back along the palate in a straight line and far back as possible. You should feel a stretch in the frenum and floor of your mouth.',
   'Bite Block',
   'Watch in mirror for jaw lateralization and jaw protrusion - use bite block to avoid. Scan for head/neck/facial/body tension and try to ease.',
   null),
  (v_week7_id, 'Lingual Palatal Suction', 'active', '2-3x/day', '2 minutes', 42,
   E'Keep your lips back in a smile. Open mouth as wide as possible without floor of mouth lifting. Use strong suction to hold the tongue to the roof of your mouth and hold for as long as possible (Start with 10 seconds and work up to 1 minute). Try focusing on lifting the back portion of the tongue to your palate. If tongue is overflowing you can slowly open and close teeth together to help tongue squish inside the arch. Use provided chopsticks to push tongue inside of arch can also help.\n\n**This exercise is most important to master prior to frenectomy.**',
   'Bite Block or Chopstick',
   'Watch in mirror for facial grimace (chin strain/dimpling), neck engagement, jaw protrusion and jaw lateralization, floor of mouth activation – use bite block to avoid. Watch for tongue overflow over teeth. This is an important metric for tongue tie surgery.',
   null),
  (v_week7_id, 'Tongue Stretch', 'active', '2-3x/day', '2 minutes', 42,
   'Pull the tongue straight out of the mouth. Avoid tensing tongue, jaw, neck and face.',
   'Gloves or Gauze may be helpful',
   'Keep tongue, jaw, neck and face relaxed throughout the stretch.',
   null),
  (v_week7_id, 'Forklift Stretch', 'active', '2-3x/day', '1 minute', 42,
   'Keeping tongue, jaw, neck and face relaxed, slide thumbs with pads facing upward underneath the tongue on either side of the frenum. Stretch the body of the tongue upward away from the floor of mouth.',
   'Gloves or Gauze may be helpful',
   'Maintain relaxation in tongue, jaw, neck and face. Avoid tensing during the stretch.',
   null),
  (v_week7_id, 'Floor of Mouth Release', 'active', '2-3x/day', '1 minute each side', 42,
   'Massage muscles along the floor of the mouth to release tension. Be slow and gentle, focusing on 1 area at a time.',
   'None',
   'Work slowly and gently. Stop if you experience pain beyond mild discomfort.',
   null),
  (v_week7_id, 'Over Breathing Awareness', 'breathing', '2-3x/day', 'Ongoing', 42,
   E'When you stop mouth breathing and learn to bring your breathing volume toward normal, you have better oxygenation of your tissues and organs, including your brain. Typical characteristics of over-breathing include mouth breathing, upper chest breathing, sighing, noticeable breathing during rest, and taking large breaths before talking.\n\n**Instructions:**\n1. Start to become aware of/monitor habits you have that indicate you are over-breathing:\n   - Hearing yourself breathe while you are relaxed\n   - Regular sighing and sniffing\n   - Taking large breaths before speaking\n   - Frequent yawning\n   - Upper chest movement while breathing\n\n2. Learn to counteract and limit these behaviors:\n   - If you can hear that your breathing is heavy, focus on slowing your breath and feeling the air in your nostrils. Try to quiet yourself.\n   - If you notice regular sighing and sniffing, stop yourself in the act. Pause your breathing for 3-5 seconds, then swallow instead.\n   - If you take large breaths before speaking, try to prevent the breath, and take a drink of water or swallow instead.\n   - If you are yawning frequently, practice stifling the yawn or do it with a closed mouth.\n   - If you feel a lot of upper chest movement while breathing, then try to focus on taking slow breaths into your diaphragm, and focus on shifting the movement to that area instead.',
   'None',
   'Focus on awareness without creating anxiety about breathing. Changes should feel natural over time.',
   null),
  (v_week7_id, 'Middle of Tongue – One Elastic Hold', 'passive', '1x/day', '15 minutes', 14,
   'Place elastic on the middle of the tongue and hold it to the roof of the mouth. If concerned about swallowing, tie a piece of floss to elastic to keep between lips.',
   '1 Elastic',
   'Ensure elastic stays in middle position. Watch for tongue sliding forward or backward. Maintain relaxed jaw position.',
   null);

  -- Upsert Week 8
  INSERT INTO weeks (
    program_id, number, title, introduction, overview, objectives,
    video_title, video_url, requires_bolt, requires_video_first, requires_video_last,
    checklist_schema
  ) VALUES (
    v_program_id,
    8,
    'Week 8 - Pre-Frenectomy Preparation',
    '**Important Note:** Final week of Pre-Frenectomy preparation. Your frenectomy should be scheduled very soon.

This week is your last opportunity to master these preparation exercises. Focus on perfecting your technique, especially the lingual palatal suction, and ensuring all compensatory patterns are eliminated.',
    'Master all pre-frenectomy exercises with perfect form. Eliminate all compensations and maximize tongue mobility before your procedure.',
    '["Perfect lingual palatal suction with zero compensations", "Achieve maximum tongue stretch and release", "Master over-breathing awareness and corrections", "Demonstrate consistent 15-minute elastic holds", "Complete all exercises with proper form and no jaw/neck tension"]'::jsonb,
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
  RETURNING id INTO v_week8_id;

  -- Delete old exercises for week 8
  DELETE FROM exercises WHERE week_id = v_week8_id;

  -- Insert exercises for Week 8 (same as Week 7)
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations, demo_video_url) VALUES
  (v_week8_id, 'Tongue Trace', 'active', '2-3x/day', '1 minute', 42,
   'Try with your mouth open, halfway or closed. Place the tip of tongue against the spot and trace back along the palate in a straight line and far back as possible. You should feel a stretch in the frenum and floor of your mouth.',
   'Bite Block',
   'Watch in mirror for jaw lateralization and jaw protrusion - use bite block to avoid. Scan for head/neck/facial/body tension and try to ease.',
   null),
  (v_week8_id, 'Lingual Palatal Suction', 'active', '2-3x/day', '2 minutes', 42,
   E'Keep your lips back in a smile. Open mouth as wide as possible without floor of mouth lifting. Use strong suction to hold the tongue to the roof of your mouth and hold for as long as possible (Start with 10 seconds and work up to 1 minute). Try focusing on lifting the back portion of the tongue to your palate. If tongue is overflowing you can slowly open and close teeth together to help tongue squish inside the arch. Use provided chopsticks to push tongue inside of arch can also help.\n\n**This exercise is most important to master prior to frenectomy.**',
   'Bite Block or Chopstick',
   'Watch in mirror for facial grimace (chin strain/dimpling), neck engagement, jaw protrusion and jaw lateralization, floor of mouth activation – use bite block to avoid. Watch for tongue overflow over teeth. This is an important metric for tongue tie surgery.',
   null),
  (v_week8_id, 'Tongue Stretch', 'active', '2-3x/day', '2 minutes', 42,
   'Pull the tongue straight out of the mouth. Avoid tensing tongue, jaw, neck and face.',
   'Gloves or Gauze may be helpful',
   'Keep tongue, jaw, neck and face relaxed throughout the stretch.',
   null),
  (v_week8_id, 'Forklift Stretch', 'active', '2-3x/day', '1 minute', 42,
   'Keeping tongue, jaw, neck and face relaxed, slide thumbs with pads facing upward underneath the tongue on either side of the frenum. Stretch the body of the tongue upward away from the floor of mouth.',
   'Gloves or Gauze may be helpful',
   'Maintain relaxation in tongue, jaw, neck and face. Avoid tensing during the stretch.',
   null),
  (v_week8_id, 'Floor of Mouth Release', 'active', '2-3x/day', '1 minute each side', 42,
   'Massage muscles along the floor of the mouth to release tension. Be slow and gentle, focusing on 1 area at a time.',
   'None',
   'Work slowly and gently. Stop if you experience pain beyond mild discomfort.',
   null),
  (v_week8_id, 'Over Breathing Awareness', 'breathing', '2-3x/day', 'Ongoing', 42,
   E'When you stop mouth breathing and learn to bring your breathing volume toward normal, you have better oxygenation of your tissues and organs, including your brain. Typical characteristics of over-breathing include mouth breathing, upper chest breathing, sighing, noticeable breathing during rest, and taking large breaths before talking.\n\n**Instructions:**\n1. Start to become aware of/monitor habits you have that indicate you are over-breathing:\n   - Hearing yourself breathe while you are relaxed\n   - Regular sighing and sniffing\n   - Taking large breaths before speaking\n   - Frequent yawning\n   - Upper chest movement while breathing\n\n2. Learn to counteract and limit these behaviors:\n   - If you can hear that your breathing is heavy, focus on slowing your breath and feeling the air in your nostrils. Try to quiet yourself.\n   - If you notice regular sighing and sniffing, stop yourself in the act. Pause your breathing for 3-5 seconds, then swallow instead.\n   - If you take large breaths before speaking, try to prevent the breath, and take a drink of water or swallow instead.\n   - If you are yawning frequently, practice stifling the yawn or do it with a closed mouth.\n   - If you feel a lot of upper chest movement while breathing, then try to focus on taking slow breaths into your diaphragm, and focus on shifting the movement to that area instead.',
   'None',
   'Focus on awareness without creating anxiety about breathing. Changes should feel natural over time.',
   null),
  (v_week8_id, 'Middle of Tongue – One Elastic Hold', 'passive', '1x/day', '15 minutes', 14,
   'Place elastic on the middle of the tongue and hold it to the roof of the mouth. If concerned about swallowing, tie a piece of floss to elastic to keep between lips.',
   '1 Elastic',
   'Ensure elastic stays in middle position. Watch for tongue sliding forward or backward. Maintain relaxed jaw position.',
   null);

END $$;