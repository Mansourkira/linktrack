-- Add foreign key constraint to link_passwords table
-- Run this in your Supabase SQL editor

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'link_passwords_link_id_fk' 
        AND table_name = 'link_passwords'
    ) THEN
        ALTER TABLE public.link_passwords 
        ADD CONSTRAINT link_passwords_link_id_fk 
        FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable Row Level Security on link_passwords table
ALTER TABLE public.link_passwords ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for link_passwords table
DO $$
BEGIN
    -- Policy for SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'link_passwords' 
        AND policyname = 'Users can view passwords for their own links'
    ) THEN
        CREATE POLICY "Users can view passwords for their own links" ON public.link_passwords
        FOR SELECT USING (
            link_id IN (
                SELECT id FROM links WHERE "ownerProfileId" = auth.uid()
            )
        );
    END IF;

    -- Policy for INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'link_passwords' 
        AND policyname = 'Users can insert passwords for their own links'
    ) THEN
        CREATE POLICY "Users can insert passwords for their own links" ON public.link_passwords
        FOR INSERT WITH CHECK (
            link_id IN (
                SELECT id FROM links WHERE "ownerProfileId" = auth.uid()
            )
        );
    END IF;

    -- Policy for UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'link_passwords' 
        AND policyname = 'Users can update passwords for their own links'
    ) THEN
        CREATE POLICY "Users can update passwords for their own links" ON public.link_passwords
        FOR UPDATE USING (
            link_id IN (
                SELECT id FROM links WHERE "ownerProfileId" = auth.uid()
            )
        );
    END IF;

    -- Policy for DELETE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'link_passwords' 
        AND policyname = 'Users can delete passwords for their own links'
    ) THEN
        CREATE POLICY "Users can delete passwords for their own links" ON public.link_passwords
        FOR DELETE USING (
            link_id IN (
                SELECT id FROM links WHERE "ownerProfileId" = auth.uid()
            )
        );
    END IF;
END $$;
