-- Create workspace and add owner member when user signs up
-- This should be run in your Supabase SQL editor

-- First, drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create or replace the trigger function that handles:
-- 1. Profile creation
-- 2. Workspace creation
-- 3. Adding user as owner member to workspace
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_profile_id uuid;
  v_workspace_id uuid;
  v_workspace_slug text;
  v_workspace_name text;
  v_email_prefix text;
BEGIN
  -- Generate workspace slug from email (before @) or use user ID prefix
  v_email_prefix := COALESCE(
    split_part(NEW.email, '@', 1),
    'user_' || substr(NEW.id::text, 1, 8)
  );
  
  -- Clean up slug: lowercase, replace invalid chars with hyphens, limit length
  v_workspace_slug := lower(regexp_replace(v_email_prefix, '[^a-z0-9]', '-', 'g'));
  v_workspace_slug := substring(v_workspace_slug from 1 for 80);
  
  -- Generate workspace name from email or use default
  v_workspace_name := COALESCE(
    split_part(NEW.email, '@', 1) || '''s Workspace',
    'My Workspace'
  );
  v_workspace_name := substring(v_workspace_name from 1 for 120);

  -- 1. Create profile
  INSERT INTO public.profiles (id, username, email, "fullName", "createdAt", "updatedAt")
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 
             'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  )
  RETURNING id INTO v_profile_id;

  -- 2. Create workspace
  INSERT INTO public.workspaces (owner_profile_id, name, slug, created_at, updated_at)
  VALUES (
    v_profile_id,
    v_workspace_name,
    v_workspace_slug,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_workspace_id;

  -- 3. Add user as owner member to workspace
  INSERT INTO public.workspace_members (workspace_id, profile_id, role, joined_at)
  VALUES (
    v_workspace_id,
    v_profile_id,
    'owner',
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If slug already exists, try with user ID appended
    -- Profile should already be created, so we can use v_profile_id
    v_workspace_slug := lower(regexp_replace(v_email_prefix, '[^a-z0-9]', '-', 'g')) || '-' || substr(NEW.id::text, 1, 8);
    v_workspace_slug := substring(v_workspace_slug from 1 for 80);
    
    -- Try to insert workspace with new slug
    BEGIN
      INSERT INTO public.workspaces (owner_profile_id, name, slug, created_at, updated_at)
      VALUES (
        v_profile_id,
        v_workspace_name,
        v_workspace_slug,
        NOW(),
        NOW()
      )
      RETURNING id INTO v_workspace_id;

      INSERT INTO public.workspace_members (workspace_id, profile_id, role, joined_at)
      VALUES (
        v_workspace_id,
        v_profile_id,
        'owner',
        NOW()
      );

      RETURN NEW;
    EXCEPTION
      WHEN unique_violation THEN
        -- If still duplicate, use full UUID
        v_workspace_slug := 'workspace-' || substr(NEW.id::text, 1, 8);
        
        INSERT INTO public.workspaces (owner_profile_id, name, slug, created_at, updated_at)
        VALUES (
          v_profile_id,
          v_workspace_name,
          v_workspace_slug,
          NOW(),
          NOW()
        )
        RETURNING id INTO v_workspace_id;

        INSERT INTO public.workspace_members (workspace_id, profile_id, role, joined_at)
        VALUES (
          v_workspace_id,
          v_profile_id,
          'owner',
          NOW()
        );

        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

