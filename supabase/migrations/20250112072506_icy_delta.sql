/*
  # Add city_id to rides table

  1. Changes
    - Add city_id column to rides table
    - Add foreign key constraint to cities table
    - Make city_id nullable for backward compatibility

  2. Notes
    - Ensures referential integrity with cities table
*/

-- Add city_id column
ALTER TABLE rides 
ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES cities(id);

-- Update the RLS policy to allow city_id
DROP POLICY IF EXISTS "Users can create their own rides" ON rides;

CREATE POLICY "Users can create their own rides"
  ON rides FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);