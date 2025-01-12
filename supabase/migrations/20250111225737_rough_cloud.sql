/*
  # Update cities table RLS policy

  1. Changes
    - Add policy to allow public access to cities table
    - This allows unauthenticated users to view cities
*/

-- Drop existing policy if any
DROP POLICY IF EXISTS "Cities are viewable by all users" ON cities;

-- Create new policy for public access
CREATE POLICY "Cities are viewable by everyone"
  ON cities FOR SELECT
  TO public
  USING (true);