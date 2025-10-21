-- Delete old exercises for weeks 1 and 2
DELETE FROM exercises WHERE week_id IN ('26cbaf31-44db-432b-9b01-4d4be2441860', 'eeedcf7d-abca-4d5d-acf6-b71fcda932dc');

-- Update Week 1 content
UPDATE weeks 
SET 
  title = 'Foundation Building - Weeks 1-2 (Part 1)',
  introduction = 'Welcome to the beginning of your myofunctional therapy journey. Over the next two weeks, you''ll establish the fundamental exercises that will retrain your oral muscles and breathing patterns. These exercises are designed to be done daily, building strength and proper muscle memory.

Each active exercise requires a mirror to ensure proper technique and minimize compensations. The passive exercise can be done during other activities. Remember, consistency is key—doing these exercises correctly and regularly will set you up for success throughout the entire program.',
  overview = 'Establish foundational tongue strength, positioning, and breathing assessment through daily active and passive exercises.',
  objectives = '["Perform clicking and tick-tock exercises to strengthen tongue muscles","Complete tongue brushing for neuromuscular re-education","Practice tongue trace movements to stretch the frenum","Establish baseline breathing health with BOLT test","Maintain tongue-to-spot positioning with elastic hold exercise"]'::jsonb,
  video_title = 'Week 1-2 Exercise Demonstrations',
  requires_bolt = true,
  requires_video_first = true,
  requires_video_last = true
WHERE number = 1;

-- Update Week 2 content
UPDATE weeks 
SET 
  title = 'Foundation Building - Weeks 1-2 (Part 2)',
  introduction = 'This is the continuation of your foundation building phase. You''ll continue practicing the same exercises from Week 1, building consistency and refining your technique. By now, you should be getting more comfortable with the movements and noticing improvements in your form.

Continue to focus on avoiding compensations and maintaining proper nasal breathing throughout all exercises. Your cumulative practice over these two weeks is building the foundation for more advanced exercises ahead.',
  overview = 'Continue foundational exercises with focus on consistency and technique refinement.',
  objectives = '["Continue clicking and tick-tock exercises with improved technique","Maintain daily tongue brushing routine","Practice tongue trace movements with better control","Continue tongue-to-spot positioning with elastic hold","Book or complete frenectomy consultation if not already done"]'::jsonb,
  video_title = 'Week 1-2 Exercise Demonstrations',
  requires_bolt = false,
  requires_video_first = true,
  requires_video_last = true
WHERE number = 2;

-- Insert new exercises for Week 1
INSERT INTO exercises (week_id, type, title, frequency, duration, completion_target, props, instructions, compensations, demo_video_url)
VALUES
  ('26cbaf31-44db-432b-9b01-4d4be2441860', 'active', 'Clicks and Tick-Tocks', '2x/day', '2 minutes', 28, 'Bite Block', 
   '**Clicks (1 minute):**
- Make repeated clicking sounds with tongue while keeping cheeks back
- Have your tongue suctioned to the roof of your mouth for 3 seconds before clicking
- Keep your lips back in a smile

**Tick-Tocks (1 minute):**
- Make clicking sounds as fast as you can with good technique
- Move lips from an exaggerated smile (do one click) to an exaggerated pursed lip (do one click)', 
   '- Watch in the mirror to prevent neck engagement, jaw protrusion and jaw lateralization
- Use bite block to avoid compensations', ''),
   
  ('26cbaf31-44db-432b-9b01-4d4be2441860', 'active', 'Brushing', '2x/day', '1 minute', 28, 'Toothbrush',
   '- Stick out the tongue and brush the full tongue 5 times
- Brush the spot area 5 times
- Place two surfaces together
- Repeat for 1 minute
- This exercise promotes neuromuscular re-education through sensory input',
   '- Watch in mirror to avoid facial grimace (rounding the lips or dimpling the chin) when protruding tongue
- Continue nasal breathing throughout exercise (Consider doing the unblocking your nose exercises first)', ''),
   
  ('26cbaf31-44db-432b-9b01-4d4be2441860', 'active', 'Tongue Trace', '2x/day', '2 minutes', 28, 'Bite Block',
   '- Try with your mouth open, halfway or closed
- Place the tip of your tongue against the spot and trace back along the palate in a straight line and far back as possible
- You should feel a stretch in the frenum and floor of your mouth',
   '- Watch in the mirror for jaw lateralization and jaw protrusion. Use bite block to avoid
- Scan for head/neck/facial/body tension and try to ease', ''),
   
  ('26cbaf31-44db-432b-9b01-4d4be2441860', 'breathing', 'BOLT Test', 'Once on Day 1', '5 minutes', 1, 'Timer',
   '**What is BOLT?**
The Body Oxygen Level Test (BOLT) measures breathing health and progress. Use the method of breathing you would have used prior to learning about myofunctional therapy.

**Scale of what is considered healthy:**
- 40-60 seconds: Healthy and ideal
- 30-39 seconds: Mild breathing/airway issues
- 20-29 seconds: Moderate breathing/airway issues
- 10-19 seconds: Unhealthy breathing
- 0-9 seconds: Very unhealthy breathing and severe airway issues

**How to perform the test:**
1. Take a small, silent breath in and a small, silent breath out
2. Hold your nose with your fingers to prevent air from entering your lungs while timing yourself
3. At the first sign of "air hunger", you will feel the first involuntary movements of your breathing muscles. Your stomach may jerk, or the area around your neck may contract
4. Release your nose and stop the timer at these first signs of "air hunger"

**Tips:**
- When you release your nose, your inhalation should remain calm
- If you are breathing heavily or taking deep breaths, then you waited too long and the score is not correct
- Keep in mind that this is not a breath-holding test', '', ''),
   
  ('26cbaf31-44db-432b-9b01-4d4be2441860', 'passive', 'Tongue Tip - One Elastic Hold', '1x/day', '5 minutes', 14, '1 Elastic',
   '- Place elastic on the tip of the tongue and hold it to the spot
- If concerned about swallowing, tie a piece of floss to elastic to keep between lips', '', '');

-- Insert new exercises for Week 2
INSERT INTO exercises (week_id, type, title, frequency, duration, completion_target, props, instructions, compensations, demo_video_url)
VALUES
  ('eeedcf7d-abca-4d5d-acf6-b71fcda932dc', 'active', 'Clicks and Tick-Tocks', '2x/day', '2 minutes', 28, 'Bite Block', 
   '**Clicks (1 minute):**
- Make repeated clicking sounds with tongue while keeping cheeks back
- Have your tongue suctioned to the roof of your mouth for 3 seconds before clicking
- Keep your lips back in a smile

**Tick-Tocks (1 minute):**
- Make clicking sounds as fast as you can with good technique
- Move lips from an exaggerated smile (do one click) to an exaggerated pursed lip (do one click)', 
   '- Watch in the mirror to prevent neck engagement, jaw protrusion and jaw lateralization
- Use bite block to avoid compensations', ''),
   
  ('eeedcf7d-abca-4d5d-acf6-b71fcda932dc', 'active', 'Brushing', '2x/day', '1 minute', 28, 'Toothbrush',
   '- Stick out the tongue and brush the full tongue 5 times
- Brush the spot area 5 times
- Place two surfaces together
- Repeat for 1 minute
- This exercise promotes neuromuscular re-education through sensory input',
   '- Watch in mirror to avoid facial grimace (rounding the lips or dimpling the chin) when protruding tongue
- Continue nasal breathing throughout exercise (Consider doing the unblocking your nose exercises first)', ''),
   
  ('eeedcf7d-abca-4d5d-acf6-b71fcda932dc', 'active', 'Tongue Trace', '2x/day', '2 minutes', 28, 'Bite Block',
   '- Try with your mouth open, halfway or closed
- Place the tip of your tongue against the spot and trace back along the palate in a straight line and far back as possible
- You should feel a stretch in the frenum and floor of your mouth',
   '- Watch in the mirror for jaw lateralization and jaw protrusion. Use bite block to avoid
- Scan for head/neck/facial/body tension and try to ease', ''),
   
  ('eeedcf7d-abca-4d5d-acf6-b71fcda932dc', 'breathing', 'BOLT Test', 'Optional retest', '5 minutes', 0, 'Timer',
   '**Optional:** You can retest your BOLT score at the end of Week 2 to see if there''s been any improvement.

**How to perform the test:**
1. Take a small, silent breath in and a small, silent breath out
2. Hold your nose with your fingers to prevent air from entering your lungs while timing yourself
3. At the first sign of "air hunger", you will feel the first involuntary movements of your breathing muscles
4. Release your nose and stop the timer at these first signs of "air hunger"', '', ''),
   
  ('eeedcf7d-abca-4d5d-acf6-b71fcda932dc', 'passive', 'Tongue Tip - One Elastic Hold', '1x/day', '5 minutes', 14, '1 Elastic',
   '- Place elastic on the tip of the tongue and hold it to the spot
- If concerned about swallowing, tie a piece of floss to elastic to keep between lips', '', '');