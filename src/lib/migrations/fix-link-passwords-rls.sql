-- Fix RLS policies for link_passwords table to allow password storage during link creation
-- This should be run in your Supabase SQL editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view passwords for their own links" ON public.link_passwords;
DROP POLICY IF EXISTS "Users can insert passwords for their own links" ON public.link_passwords;
DROP POLICY IF EXISTS "Users can update passwords for their own links" ON public.link_passwords;
DROP POLICY IF EXISTS "Users can delete passwords for their own links" ON public.link_passwords;

-- Create new policies that work better with the link creation flow
CREATE POLICY "Users can view passwords for their own links" ON public.link_passwords
  FOR SELECT USING (
    link_id IN (
      SELECT id FROM links WHERE "ownerProfileId" = auth.uid()
    )
  );

-- Allow insertion if the user owns the link (this should work during link creation)
CREATE POLICY "Users can insert passwords for their own links" ON public.link_passwords
  FOR INSERT WITH CHECK (
    link_id IN (
      SELECT id FROM links WHERE "ownerProfileId" = auth.uid()
    )
  );

-- Allow updates if the user owns the link
CREATE POLICY "Users can update passwords for their own links" ON public.link_passwords
  FOR UPDATE USING (
    link_id IN (
      SELECT id FROM links WHERE "ownerProfileId" = auth.uid()
    )
  );

-- Allow deletion if the user owns the link
CREATE POLICY "Users can delete passwords for their own links" ON public.link_passwords
  FOR DELETE USING (
    link_id IN (
      SELECT id FROM links WHERE "ownerProfileId" = auth.uid()
    )
  );

-- Also create a policy that allows service role to insert passwords
-- This is needed for server-side operations during link creation
CREATE POLICY "Service role can manage all passwords" ON public.link_passwords
  FOR ALL USING (auth.role() = 'service_role');
