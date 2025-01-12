/*
  # Add booking type to rides table

  1. Changes
    - Add booking_type column to rides table
    - Set default value to 'now'
    - Add check constraint for valid booking types

  2. Notes
    - Ensures backward compatibility with existing rides
    - Validates booking type values
*/

-- Add booking_type column with default value
ALTER TABLE rides 
ADD COLUMN IF NOT EXISTS booking_type text NOT NULL DEFAULT 'now';

-- Add check constraint to ensure valid booking types
ALTER TABLE rides 
ADD CONSTRAINT rides_booking_type_check 
CHECK (booking_type IN ('now', 'later'));