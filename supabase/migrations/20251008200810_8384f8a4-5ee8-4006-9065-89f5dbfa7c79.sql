-- Add new content fields to weeks table
ALTER TABLE weeks 
ADD COLUMN IF NOT EXISTS introduction TEXT,
ADD COLUMN IF NOT EXISTS overview TEXT,
ADD COLUMN IF NOT EXISTS objectives JSONB DEFAULT '[]'::jsonb;

-- Add comment for clarity
COMMENT ON COLUMN weeks.introduction IS 'Motivational introduction displayed at top of week page';
COMMENT ON COLUMN weeks.overview IS 'Brief overview of the week';
COMMENT ON COLUMN weeks.objectives IS 'Array of learning objectives for the week';