-- Add domainId column to links table to support custom domains
-- This allows each link to optionally be associated with a custom domain

-- Add the domainId column (nullable, references domains table)
ALTER TABLE links 
ADD COLUMN IF NOT EXISTS "domainId" UUID REFERENCES domains(id) ON DELETE SET NULL;

-- Create index for domainId for faster queries
CREATE INDEX IF NOT EXISTS links_domain_idx ON links("domainId");

-- Drop the old unique index on shortCode only
DROP INDEX IF EXISTS links_shortcode_unique;

-- Create new composite unique index on (shortCode, domainId)
-- This allows the same shortCode to be used across different domains
CREATE UNIQUE INDEX IF NOT EXISTS links_shortcode_domain_unique 
ON links("shortCode", "domainId");

-- Add comment explaining the column
COMMENT ON COLUMN links."domainId" IS 'Optional custom domain for this link. NULL means it uses the default app domain.';

