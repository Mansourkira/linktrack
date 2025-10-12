-- Create link_passwords table for password-protected links
-- This should be run in your Supabase SQL editor

-- Create the link_passwords table
CREATE TABLE IF NOT EXISTS public.link_passwords (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL,
  password_hash text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT link_passwords_pkey PRIMARY KEY (id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS link_passwords_link_idx ON public.link_passwords USING btree (link_id);
CREATE INDEX IF NOT EXISTS link_passwords_active_idx ON public.link_passwords USING btree (is_active);

-- Add foreign key constraint
ALTER TABLE public.link_passwords 
ADD CONSTRAINT link_passwords_link_id_fk 
FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.link_passwords ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view passwords for their own links" ON public.link_passwords
  FOR SELECT USING (
    link_id IN (
      SELECT id FROM links WHERE "ownerProfileId" = auth.uid()
    )
  );

CREATE POLICY "Users can insert passwords for their own links" ON public.link_passwords
  FOR INSERT WITH CHECK (
    link_id IN (
      SELECT id FROM links WHERE "ownerProfileId" = auth.uid()
    )
  );

CREATE POLICY "Users can update passwords for their own links" ON public.link_passwords
  FOR UPDATE USING (
    link_id IN (
      SELECT id FROM links WHERE "ownerProfileId" = auth.uid()
    )
  );

CREATE POLICY "Users can delete passwords for their own links" ON public.link_passwords
  FOR DELETE USING (
    link_id IN (
      SELECT id FROM links WHERE "ownerProfileId" = auth.uid()
    )
  );
