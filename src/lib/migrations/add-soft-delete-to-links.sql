-- Add soft-delete support to links table
-- This migration adds a deletedAt timestamp field for soft deletes

-- Add deletedAt column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'links' AND column_name = 'deletedAt'
    ) THEN
        ALTER TABLE public.links ADD COLUMN "deletedAt" timestamp without time zone;
    END IF;
END $$;

-- Add updatedAt column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'links' AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE public.links ADD COLUMN "updatedAt" timestamp without time zone DEFAULT now();
    END IF;
END $$;

-- Create index on deletedAt for performance
CREATE INDEX IF NOT EXISTS links_deleted_at_idx ON public.links USING btree ("deletedAt");

-- Update existing rows to have updatedAt timestamp
UPDATE public.links SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Create trigger to automatically update updatedAt
CREATE OR REPLACE FUNCTION update_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_links_updated_at') THEN
        CREATE TRIGGER update_links_updated_at
            BEFORE UPDATE ON public.links
            FOR EACH ROW
            EXECUTE FUNCTION update_links_updated_at();
    END IF;
END $$;

-- Update RLS policies to exclude soft-deleted links
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own links" ON public.links;
DROP POLICY IF EXISTS "Users can insert their own links" ON public.links;
DROP POLICY IF EXISTS "Users can update their own links" ON public.links;
DROP POLICY IF EXISTS "Users can delete their own links" ON public.links;

-- Create new RLS policies that exclude soft-deleted links
CREATE POLICY "Users can view their own active links" ON public.links
    FOR SELECT USING (
        auth.uid() = "ownerProfileId" 
        AND "deletedAt" IS NULL
    );

CREATE POLICY "Users can insert their own links" ON public.links
    FOR INSERT WITH CHECK (auth.uid() = "ownerProfileId");

CREATE POLICY "Users can update their own active links" ON public.links
    FOR UPDATE USING (
        auth.uid() = "ownerProfileId" 
        AND "deletedAt" IS NULL
    );

CREATE POLICY "Users can soft-delete their own active links" ON public.links
    FOR UPDATE USING (
        auth.uid() = "ownerProfileId" 
        AND "deletedAt" IS NULL
    );

-- Policy for public access to active links (for redirects)
CREATE POLICY "Public can view active links" ON public.links
    FOR SELECT USING (
        "isActive" = true 
        AND "deletedAt" IS NULL
    ); 