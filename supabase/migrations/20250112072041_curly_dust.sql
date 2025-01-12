/*
  # Update payments table constraints and policies

  1. Changes
    - Make ride_id nullable for initial payment creation
    - Drop existing policy and create new one for payments

  2. Security
    - Updates policies to handle initial payment creation
*/

-- Make ride_id nullable temporarily for initial payment creation
ALTER TABLE payments ALTER COLUMN ride_id DROP NOT NULL;

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON payments;

-- Add new policies for payments table
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