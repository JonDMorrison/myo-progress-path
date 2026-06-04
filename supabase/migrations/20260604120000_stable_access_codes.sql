-- Replace random per-deploy MONTROSE-* codes with four stable, reusable codes
-- that the office can hand to patients. Stable codes skip the therapist-approval
-- gate so normal signups are not blocked (approval_required=false).

INSERT INTO public.access_codes (code, program_variant, requires_video, description, active, approval_required)
VALUES
  ('FREN-7K2P',       'frenectomy',     false, 'Frenectomy — no video',       true, false),
  ('FREN-VIDEO-9Q4X', 'frenectomy',     true,  'Frenectomy — with video',     true, false),
  ('MYO-3N8R',        'non_frenectomy', false, 'Non-frenectomy — no video',   true, false),
  ('MYO-VIDEO-6T5L',  'non_frenectomy', true,  'Non-frenectomy — with video', true, false)
ON CONFLICT (code) DO UPDATE SET
  program_variant   = EXCLUDED.program_variant,
  requires_video    = EXCLUDED.requires_video,
  description       = EXCLUDED.description,
  active            = EXCLUDED.active,
  approval_required = EXCLUDED.approval_required;

-- Retire the random codes seeded by an earlier migration. Only deactivate the
-- ones with zero uses — preserve any that were actually handed to patients.
UPDATE public.access_codes
SET active = false
WHERE code LIKE 'MONTROSE-%' AND uses = 0;
