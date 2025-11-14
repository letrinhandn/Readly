-- Add premium fields to user_profiles table

-- Add columns for premium status
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_premium ON user_profiles(is_premium);

-- Create a function to check if user is premium
CREATE OR REPLACE FUNCTION is_user_premium(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  premium_status BOOLEAN;
  expiration TIMESTAMPTZ;
BEGIN
  SELECT is_premium, premium_expires_at
  INTO premium_status, expiration
  FROM user_profiles
  WHERE id = user_id;

  -- If no premium status found, return false
  IF premium_status IS NULL THEN
    RETURN FALSE;
  END IF;

  -- If premium and not expired, return true
  IF premium_status = TRUE THEN
    -- If expiration is null (lifetime) or not expired yet
    IF expiration IS NULL OR expiration > NOW() THEN
      RETURN TRUE;
    ELSE
      -- Expired, update status
      UPDATE user_profiles
      SET is_premium = FALSE
      WHERE id = user_id;
      RETURN FALSE;
    END IF;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT is_user_premium('user-uuid-here');

-- Create a policy to allow users to read their own premium status
-- (Assuming RLS is enabled)
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own premium status"
--   ON user_profiles
--   FOR SELECT
--   USING (auth.uid() = id);

-- CREATE POLICY "Users can update their own premium status"
--   ON user_profiles
--   FOR UPDATE
--   USING (auth.uid() = id);
