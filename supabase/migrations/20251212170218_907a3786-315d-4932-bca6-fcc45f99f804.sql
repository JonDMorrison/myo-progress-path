-- Add 'non_frenectomy' to program_variant enum (was missing from initial migration)
ALTER TYPE program_variant ADD VALUE IF NOT EXISTS 'non_frenectomy';