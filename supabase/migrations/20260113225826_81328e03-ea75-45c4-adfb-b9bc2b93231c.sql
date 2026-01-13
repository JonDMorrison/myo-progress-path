-- 1. Delete all "Self Study" exercises
DELETE FROM exercises 
WHERE title LIKE 'Self Study%';

-- 2. Fix BOLT Test duplicates - Week 1: Keep only ONE baseline BOLT test
-- First identify the BOLT tests in Week 1 and remove duplicates
DELETE FROM exercises
WHERE id IN (
  SELECT e.id FROM exercises e
  JOIN weeks w ON e.week_id = w.id
  WHERE w.number = 1 
  AND e.title = 'BOLT Test'
  AND e.frequency != 'Once at program start'
);

-- 3. Week 2: Remove BOLT tests (not needed in Week 2)
DELETE FROM exercises
WHERE id IN (
  SELECT e.id FROM exercises e
  JOIN weeks w ON e.week_id = w.id
  WHERE w.number = 2 
  AND e.title = 'BOLT Test'
);

-- 4. Week 23: Remove all BOLT tests (BOLT should only be in Week 24)
DELETE FROM exercises
WHERE id IN (
  SELECT e.id FROM exercises e
  JOIN weeks w ON e.week_id = w.id
  WHERE w.number = 23 
  AND e.title LIKE '%BOLT%'
);

-- 5. Week 24: Remove duplicate "Final BOLT Score", keep "BOLT Test Final Check-In"
DELETE FROM exercises
WHERE id IN (
  SELECT e.id FROM exercises e
  JOIN weeks w ON e.week_id = w.id
  WHERE w.number = 24 
  AND e.title = 'Final BOLT Score'
);

-- 6. Add overnight instructions to Week 9 Mouth Taping exercises that don't have them
UPDATE exercises
SET instructions = instructions || E'\n\n---\n\n## Overnight Mouth Taping\n\nOnce you are comfortable wearing mouth tape for extended periods during the day, you can begin overnight use.\n\n**Getting Started:**\n1. Practice daytime taping for at least a week before attempting overnight use\n2. Start on a night when you can sleep in (weekend) in case it disrupts sleep initially\n3. Use the same breathable tape you have been practicing with (Micropore or Surgical Tape)\n\n**Before Bed:**\n1. Apply lip balm if lips are dry\n2. Ensure your nose is clear — do unblocking exercises if needed\n3. Place tape in your preferred pattern (vertical, horizontal, or X)\n4. Have water nearby in case you need to remove tape during the night\n\n**What to Expect:**\n- You may wake up the first few nights as your body adjusts\n- Some people remove the tape unconsciously — this is normal and will improve\n- Morning dry mouth should significantly decrease over time\n\n**Benefits of Overnight Nasal Breathing:**\n- Improved sleep quality and reduced snoring\n- Better oxygen saturation during sleep\n- Reduced morning dry mouth and bad breath\n- Supports proper tongue posture while sleeping\n\n**When to Stop:**\nRemove tape immediately if you experience difficulty breathing, panic, or significant nasal congestion. Consult your therapist if overnight taping remains uncomfortable after 2 weeks of attempting.'
WHERE week_id IN (SELECT id FROM weeks WHERE number = 9)
AND title = 'Mouth Taping'
AND instructions NOT LIKE '%Overnight%';

-- 7. Add overnight instructions to Week 10 Mouth Taping exercises that don't have them
UPDATE exercises
SET instructions = instructions || E'\n\n---\n\n## Overnight Mouth Taping\n\nOnce you are comfortable wearing mouth tape for extended periods during the day, you can begin overnight use.\n\n**Getting Started:**\n1. Practice daytime taping for at least a week before attempting overnight use\n2. Start on a night when you can sleep in (weekend) in case it disrupts sleep initially\n3. Use the same breathable tape you have been practicing with (Micropore or Surgical Tape)\n\n**Before Bed:**\n1. Apply lip balm if lips are dry\n2. Ensure your nose is clear — do unblocking exercises if needed\n3. Place tape in your preferred pattern (vertical, horizontal, or X)\n4. Have water nearby in case you need to remove tape during the night\n\n**What to Expect:**\n- You may wake up the first few nights as your body adjusts\n- Some people remove the tape unconsciously — this is normal and will improve\n- Morning dry mouth should significantly decrease over time\n\n**Benefits of Overnight Nasal Breathing:**\n- Improved sleep quality and reduced snoring\n- Better oxygen saturation during sleep\n- Reduced morning dry mouth and bad breath\n- Supports proper tongue posture while sleeping\n\n**When to Stop:**\nRemove tape immediately if you experience difficulty breathing, panic, or significant nasal congestion. Consult your therapist if overnight taping remains uncomfortable after 2 weeks of attempting.'
WHERE week_id IN (SELECT id FROM weeks WHERE number = 10)
AND title = 'Mouth Taping'
AND instructions NOT LIKE '%Overnight%';