-- Create domains table for custom domain support
-- This should be run in your Supabase SQL editor

-- Create domains table
CREATE TABLE IF NOT EXISTS public.domains (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  domain character varying(255) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT domains_pkey PRIMARY KEY (id)
);

-- Create unique index on domain
CREATE UNIQUE INDEX IF NOT EXISTS domains_domain_unique ON public.domains USING btree (domain);

-- Create index for active domains
CREATE INDEX IF NOT EXISTS domains_active_idx ON public.domains USING btree (is_active);

-- Enable Row Level Security
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your needs)
CREATE POLICY "Domains are viewable by all" ON public.domains
  FOR SELECT USING (true);

-- Add domainId column to links table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'domainId') THEN
    ALTER TABLE public.links ADD COLUMN "domainId" uuid;
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'links_domain_id_fk'
  ) THEN
    ALTER TABLE public.links 
    ADD CONSTRAINT links_domain_id_fk 
    FOREIGN KEY ("domainId") REFERENCES domains(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add index on domainId
CREATE INDEX IF NOT EXISTS links_domain_id_idx ON public.links USING btree ("domainId");

-- Insert some example domains (optional)
-- INSERT INTO public.domains (domain) VALUES ('linktrack.app'), ('custom.example.com');
