-- One-time backfill: sync odd-week patient_week_progress rows to 'approved'
-- where the partner even-week row is already 'approved'.
--
-- Background: prior to the cascade fix in src/lib/reviewActions.ts,
-- approveWeek only flipped the row matching the passed progressId (almost
-- always the even week). The partner odd-week row was left at 'submitted'
-- because handleSubmitForReview cascades submission but approveWeek did
-- not cascade approval. userProgress.ts:91 reads `isComplete` off the odd
-- row, so completedWeeks undercounted by one per approved module.
--
-- Conditions for backfill:
--   - odd week_number (so we only touch the partner that was missed)
--   - week_number < 24 (excludes the post-program review at week 25)
--   - frenectomy variants skip weeks 9 and 10 because each is its own
--     single-week post-op module (no partner cascade applies)
--   - the matching even-week row exists and is already 'approved'
--   - the current odd-week row is not already 'approved'
--
-- Schema note: patient_week_progress has no approved_at/approved_by columns;
-- the closest timestamp is completed_at (written at submission time, not
-- approval time). We carry completed_at forward from the partner row so
-- both rows in a module reflect the same submission moment.

DO $$
DECLARE
  updated_count integer;
BEGIN
  WITH partner_pairs AS (
    SELECT
      odd_pwp.id AS odd_progress_id,
      even_pwp.completed_at AS partner_completed_at
    FROM patient_week_progress odd_pwp
    INNER JOIN weeks odd_week
      ON odd_week.id = odd_pwp.week_id
    INNER JOIN patients pat
      ON pat.id = odd_pwp.patient_id
    INNER JOIN weeks even_week
      ON even_week.number = odd_week.number + 1
      AND even_week.program_id = odd_week.program_id
    INNER JOIN patient_week_progress even_pwp
      ON even_pwp.week_id = even_week.id
      AND even_pwp.patient_id = odd_pwp.patient_id
    WHERE
      odd_week.number % 2 = 1
      AND odd_week.number < 24
      AND NOT (
        -- Frenectomy variants: weeks 9 and 10 are separate post-op modules.
        -- Odd week 9 has no biweekly partner; do not backfill it.
        (pat.program_variant IN ('frenectomy', 'frenectomy_video'))
        AND odd_week.number = 9
      )
      AND even_pwp.status = 'approved'
      AND (odd_pwp.status IS DISTINCT FROM 'approved')
  )
  UPDATE patient_week_progress pwp
  SET
    status = 'approved',
    completed_at = COALESCE(pwp.completed_at, partner_pairs.partner_completed_at)
  FROM partner_pairs
  WHERE pwp.id = partner_pairs.odd_progress_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Backfilled % odd-week approval rows', updated_count;
END $$;
