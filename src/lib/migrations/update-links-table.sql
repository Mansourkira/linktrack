-- Alternative: Update existing links table without dropping it
-- This preserves any existing data

-- Make workspaceId nullable
ALTER TABLE public.links ALTER COLUMN "workspaceId" DROP NOT NULL;

-- Remove the workspace foreign key constraint if it exists
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_workspace_id_fk;

-- Update the table structure to match the expected schema
-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add shortCode column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'shortCode') THEN
        ALTER TABLE public.links ADD COLUMN "shortCode" character varying(128);
    END IF;
    
    -- Add originalUrl column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'originalUrl') THEN
        ALTER TABLE public.links ADD COLUMN "originalUrl" text;
    END IF;
    
    -- Add isPasswordProtected column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'isPasswordProtected') THEN
        ALTER TABLE public.links ADD COLUMN "isPasswordProtected" boolean DEFAULT false;
    END IF;
    
    -- Add isActive column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'isActive') THEN
        ALTER TABLE public.links ADD COLUMN "isActive" boolean DEFAULT true;
    END IF;
    
    -- Add clickCount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'clickCount') THEN
        ALTER TABLE public.links ADD COLUMN "clickCount" integer DEFAULT 0;
    END IF;
    
    -- Add createdAt column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'createdAt') THEN
        ALTER TABLE public.links ADD COLUMN "createdAt" timestamp without time zone DEFAULT now();
    END IF;
    
    -- Add updatedAt column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'updatedAt') THEN
        ALTER TABLE public.links ADD COLUMN "updatedAt" timestamp without time zone DEFAULT now();
    END IF;
    
    -- Add expiresAt column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'expiresAt') THEN
        ALTER TABLE public.links ADD COLUMN "expiresAt" timestamp without time zone;
    END IF;
    
    -- Add ownerProfileId column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'ownerProfileId') THEN
        ALTER TABLE public.links ADD COLUMN "ownerProfileId" uuid;
    END IF;
END $$;

-- Create indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS links_shortcode_unique ON public.links USING btree ("shortCode");
CREATE INDEX IF NOT EXISTS links_owner_profile_idx ON public.links USING btree ("ownerProfileId");
CREATE INDEX IF NOT EXISTS links_workspace_idx ON public.links USING btree ("workspaceId");
CREATE INDEX IF NOT EXISTS links_active_idx ON public.links USING btree ("isActive");
CREATE INDEX IF NOT EXISTS links_expires_idx ON public.links USING btree ("expiresAt");
CREATE INDEX IF NOT EXISTS links_created_idx ON public.links USING btree ("createdAt");

-- Enable Row Level Security
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own links" ON public.links;
DROP POLICY IF EXISTS "Users can insert their own links" ON public.links;
DROP POLICY IF EXISTS "Users can update their own links" ON public.links;
DROP POLICY IF EXISTS "Users can delete their own links" ON public.links;

-- Create RLS policies
CREATE POLICY "Users can view their own links" ON public.links
  FOR SELECT USING (auth.uid() = "ownerProfileId");

CREATE POLICY "Users can insert their own links" ON public.links
  FOR INSERT WITH CHECK (auth.uid() = "ownerProfileId");

CREATE POLICY "Users can update their own links" ON public.links
  FOR UPDATE USING (auth.uid() = "ownerProfileId");

CREATE POLICY "Users can delete their own links" ON public.links
  FOR DELETE USING (auth.uid() = "ownerProfileId");
