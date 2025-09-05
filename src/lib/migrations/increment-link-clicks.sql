-- Create RPC function for atomic click increment
-- This should be run in your Supabase SQL editor

-- Function to atomically increment link clicks
CREATE OR REPLACE FUNCTION increment_link_clicks(link_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE links 
  SET "clickCount" = "clickCount" + 1,
      "updatedAt" = now()
  WHERE id = link_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_link_clicks(uuid) TO authenticated;

-- Test the function (optional)
-- SELECT increment_link_clicks('your-link-id-here');
