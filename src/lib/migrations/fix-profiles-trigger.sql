-- Fix the profiles table trigger to handle username generation
-- This should be run in your Supabase SQL editor

-- First, drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a new trigger function that handles username generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, "fullName", "createdAt", "updatedAt")
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 
             'user_' || substr(NEW.id::text, 1, 8)), -- Generate username from email or ID
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
