-- Update links table to support expiration and max clicks
-- This should be run in your Supabase SQL editor

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add expiresAt column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'expiresAt') THEN
    ALTER TABLE public.links ADD COLUMN "expiresAt" timestamp without time zone;
  END IF;
  
  -- Add maxClicks column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'maxClicks') THEN
    ALTER TABLE public.links ADD COLUMN "maxClicks" integer;
  END IF;
  
  -- Add password column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'password') THEN
    ALTER TABLE public.links ADD COLUMN "password" character varying(120);
  END IF;
  
  -- Add updatedAt column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'updatedAt') THEN
    ALTER TABLE public.links ADD COLUMN "updatedAt" timestamp without time zone DEFAULT now();
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS links_expires_idx ON public.links USING btree ("expiresAt");
CREATE INDEX IF NOT EXISTS links_max_clicks_idx ON public.links USING btree ("maxClicks");

-- Update existing rows to have updatedAt timestamp
UPDATE public.links SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Create trigger to automatically update updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
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
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
