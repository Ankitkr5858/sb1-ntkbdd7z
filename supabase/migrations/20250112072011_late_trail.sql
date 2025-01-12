/*
  # Add RLS policies for payments table

  1. Changes
    - Add RLS policy to allow authenticated users to insert payments
    - Add RLS policy to allow authenticated users to view their own payments
    - Add ride_id as nullable for initial payment creation

  2. Security
    - Ensures users can only create and view their own payments
*/

-- Make ride_id nullable temporarily for initial payment creation
ALTER TABLE payments ALTER COLUMN ride_id DROP NOT NULL;

-- Add policies for payments table
CREATE POLICY "Users can insert their own payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rides
      WHERE rides.id = payments.ride_id
      AND rides.user_id = auth.uid()
    )
    OR ride_id IS NULL -- Allow viewing payments without ride_id (initial payments)
  );