-- Update the links table to match the expected schema
-- This should be run in your Supabase SQL editor

-- First, drop the existing table if it exists
DROP TABLE IF EXISTS public.links CASCADE;

-- Create the links table with the correct schema
CREATE TABLE public.links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  "shortCode" character varying(128) NOT NULL,
  "originalUrl" text NOT NULL,
  "isPasswordProtected" boolean NOT NULL DEFAULT false,
  "isActive" boolean NOT NULL DEFAULT true,
  "clickCount" integer NOT NULL DEFAULT 0,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "ownerProfileId" uuid NOT NULL,
  CONSTRAINT links_pkey PRIMARY KEY (id)
);

-- Create indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS links_shortcode_unique ON public.links USING btree ("shortCode");
CREATE INDEX IF NOT EXISTS links_owner_profile_idx ON public.links USING btree ("ownerProfileId");
CREATE INDEX IF NOT EXISTS links_active_idx ON public.links USING btree ("isActive");
CREATE INDEX IF NOT EXISTS links_created_idx ON public.links USING btree ("createdAt");

-- Add foreign key constraints
ALTER TABLE public.links 
ADD CONSTRAINT links_owner_profile_id_fk 
FOREIGN KEY ("ownerProfileId") REFERENCES profiles(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own links" ON public.links
  FOR SELECT USING (auth.uid() = "ownerProfileId");

CREATE POLICY "Users can insert their own links" ON public.links
  FOR INSERT WITH CHECK (auth.uid() = "ownerProfileId");

CREATE POLICY "Users can update their own links" ON public.links
  FOR UPDATE USING (auth.uid() = "ownerProfileId");

CREATE POLICY "Users can delete their own links" ON public.links
  FOR DELETE USING (auth.uid() = "ownerProfileId");
