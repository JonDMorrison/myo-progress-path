-- Add missing consent columns to patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS consent_accepted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS consent_signature text,
ADD COLUMN IF NOT EXISTS consent_payload jsonb DEFAULT '{}'::jsonb;
