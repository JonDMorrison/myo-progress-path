-- Strip the legacy " (Part 1)" / " (Part 2)" / " (Part One)" / " (Part Two)"
-- suffix from any weeks.title that still carries it. These came from
-- migration 20251021185227_…sql which set titles like
--   "Foundation Building - Weeks 1-2 (Part 1)"
-- back when Part 1/Part 2 was a first-class concept. Option B
-- collapsed Part 1/2 into a single module page (commit 93feb8a), but
-- the DB-stored titles continued to surface the legacy suffix on the
-- /review page and anywhere else that renders week.title verbatim.
--
-- This migration is idempotent: it only matches titles ending in a
-- "Part X" parenthetical. Titles without the suffix are left alone.
-- Re-running is a no-op.

UPDATE weeks
SET title = REGEXP_REPLACE(
  title,
  '\s*\((Part\s+(One|Two|1|2))\)\s*$',
  '',
  'i'
)
WHERE title ~* '\(part\s+(one|two|1|2)\)\s*$';
