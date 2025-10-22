-- Import Weeks 9-10 (Post-Frenectomy) exercise data

-- Get the program ID
DO $$
DECLARE
  v_program_id uuid;
  v_week9_id uuid;
  v_week10_id uuid;
BEGIN
  -- Get the program ID (assuming there's only one program)
  SELECT id INTO v_program_id FROM programs LIMIT 1;

  -- Upsert Week 9
  INSERT INTO weeks (program_id, number, title, introduction, requires_video_first, requires_video_last, requires_bolt)
  VALUES (
    v_program_id,
    9,
    'Week 9 (Post-Frenectomy Days 1-7)',
    'Days 1-3: Minimal Activity to avoid sutures coming out. Try to talk and eat as normally as possible but avoid spicy, crunchy, sharp and acidic foods. Soft, cold foods are best. Gently lift tongue up and down, left and right. Days 4-7: Begin gentle exercises as outlined below.',
    true,
    true,
    false
  )
  ON CONFLICT (program_id, number) 
  DO UPDATE SET 
    title = EXCLUDED.title,
    introduction = EXCLUDED.introduction,
    requires_video_first = EXCLUDED.requires_video_first,
    requires_video_last = EXCLUDED.requires_video_last,
    requires_bolt = EXCLUDED.requires_bolt
  RETURNING id INTO v_week9_id;

  -- Delete existing exercises for Week 9
  DELETE FROM exercises WHERE week_id = v_week9_id;

  -- Insert Week 9 exercises
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations) VALUES
  (v_week9_id, 'Gentle Lingual Palatal Suction', 'active', '2-3x/day', '1 minute', 28,
   'Keep your lips back in a smile. Open mouth as wide as possible without floor of mouth lifting. Use gentle suction to hold the tongue to the roof of your mouth and hold for as long as possible (Start with 10 seconds and work up to 1 minute). Try focusing on lifting the back portion of the tongue to the palate. If tongue is overflowing you can slowly open and close teeth together to help tongue squish inside the arch. Using the provided chopsticks to push the tongue inside of the arch can also help.',
   'Bite Block or Chopstick',
   'Watch in mirror for facial grimace (chin strain/dimpling), neck engagement, jaw protrusion and jaw lateralization, floor of mouth activation – use bite block to avoid'),

  (v_week9_id, 'Gentle Tongue Trace', 'active', '2-3x/day', '2 minutes', 28,
   'Try with your mouth open, halfway or closed. Place the tip of the tongue against the spot and trace back along the palate in a straight line and far back as possible. You should feel a stretch in the frenum and floor of your mouth.',
   NULL,
   'Watch in mirror for jaw lateralization and jaw protrusion. Use bite block to avoid. Scan for head/neck/facial/body tension and try to ease'),

  (v_week9_id, 'Floor of Mouth Massage', 'active', '2-3x/day', '1 minute each side', 28,
   'Massage muscles along the floor of the mouth to release tension. Be slow and gentle, focusing on 1 area at a time.',
   'Gloves or Gauze may be helpful',
   NULL);

  -- Upsert Week 10
  INSERT INTO weeks (program_id, number, title, introduction, requires_video_first, requires_video_last, requires_bolt)
  VALUES (
    v_program_id,
    10,
    'Week 10 (Post-Frenectomy Days 8-14)',
    'Continue post-frenectomy recovery with increased intensity exercises. You can now use stronger suction and more vigorous stretching. Begin mouth taping practice during waking hours to prepare for overnight use in future weeks.',
    true,
    true,
    false
  )
  ON CONFLICT (program_id, number) 
  DO UPDATE SET 
    title = EXCLUDED.title,
    introduction = EXCLUDED.introduction,
    requires_video_first = EXCLUDED.requires_video_first,
    requires_video_last = EXCLUDED.requires_video_last,
    requires_bolt = EXCLUDED.requires_bolt
  RETURNING id INTO v_week10_id;

  -- Delete existing exercises for Week 10
  DELETE FROM exercises WHERE week_id = v_week10_id;

  -- Insert Week 10 exercises
  INSERT INTO exercises (week_id, title, type, frequency, duration, completion_target, instructions, props, compensations) VALUES
  (v_week10_id, 'Tongue Stretch', 'active', '2-3x/day', '1 minute', 28,
   'Pull the tongue straight out of the mouth. Avoid tensing tongue, jaw, neck and face.',
   'Gloves or Gauze may be helpful',
   NULL),

  (v_week10_id, 'Forklift Stretch', 'active', '2-3x/day', '1 minute', 28,
   'Keeping tongue, jaw, neck and face relaxed, slide thumbs with pads facing upward underneath the tongue on either side of the frenum. Stretch the body of the tongue upward away from the floor of mouth.',
   'Gloves or Gauze may be helpful',
   NULL),

  (v_week10_id, 'Lingual Palatal Suction', 'active', '2-3x/day', '2 minutes', 28,
   'Keep your lips back in a smile. Open mouth as wide as possible without floor of mouth lifting. Use strong suction to hold the tongue to the roof of your mouth and hold for as long as possible (Start with 10 seconds and work up to 1 minute). Try focusing on lifting the back portion of the tongue to the palate. Okay to use stronger suction again.',
   'Bite Block or Chopstick',
   'Watch in mirror for facial grimace (chin strain/dimpling), neck engagement, jaw protrusion and jaw lateralization, floor of mouth activation – use bite block to avoid'),

  (v_week10_id, 'Tongue Trace', 'active', '2-3x/day', '2 minutes', 28,
   'Try with your mouth open, halfway or closed. Place the tip of the tongue against the spot and trace back along the palate in a straight line and far back as possible. You should feel a stretch in the frenum and floor of your mouth.',
   'Bite Block',
   'Watch in mirror for jaw lateralization and jaw protrusion. Use bite block to avoid. Scan for head/neck/facial/body tension and try to ease'),

  (v_week10_id, 'Mouth Taping', 'breathing', '1x/day', '1 hour', 14,
   'Make sure you have tape that will stick and not irritate your skin (A starting amount is included in kit, but more should be purchased, consider using Micropore or Surgical Tape as they are breathable). Use lip balm or Chapstick if your lips are dry, before applying the tape. Place the tape however you are most comfortable – vertically, horizontally, or in an X pattern. I recommend sealing off the air unless you are uncomfortable with this feeling. Find a 1 hour quiet activity you can do to let the time pass (during screen time, reading, in the car, cooking etc). If you cannot find a full hour to use the tape, just do it for as long as you can. You can always come back to add more time later. Remember that a continuous hour is better than a split-up hour if you can do it. Tips: You may not be able to do a full hour. I recommend starting with 5 or 10 minutes and adding more time depending on how well you do. If you feel claustrophobic while doing this exercise, practice the Belly Breathing Exercise to help relax yourself and adjust your breathing, before applying the tape. Consider doing the unblocking your nose exercises first. Start applying mouth tape over night once comfortable with longer periods of time. This will be added as a second passive exercise in future weeks.',
   'Mouth tape (Micropore or Surgical Tape recommended)',
   NULL);

END $$;