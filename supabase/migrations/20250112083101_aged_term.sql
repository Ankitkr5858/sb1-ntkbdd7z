/*
  # Add vehicle and payment columns to rides table

  1. Changes
    - Add vehicle_type column to rides table
    - Add payment_method column to rides table
    - Add check constraint for valid vehicle types
    - Add payment_status column to rides table

  2. Security
    - No changes to RLS policies needed
*/

-- Add vehicle_type column with check constraint
ALTER TABLE rides 
ADD COLUMN IF NOT EXISTS vehicle_type text NOT NULL DEFAULT 'e-car';

ALTER TABLE rides 
ADD CONSTRAINT rides_vehicle_type_check 
CHECK (vehicle_type IN ('e-car', 'e-bike', 'e-rickshaw'));

-- Add payment_method column
ALTER TABLE rides 
ADD COLUMN IF NOT EXISTS payment_method text;

-- Add payment_status column with check constraint
ALTER TABLE rides 
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';

ALTER TABLE rides 
ADD CONSTRAINT rides_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'failed'));