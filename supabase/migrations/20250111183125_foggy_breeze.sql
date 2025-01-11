/*
  # Initial Schema for Women's Cab Booking Application

  1. New Tables
    - `cities`
      - `id` (uuid, primary key)
      - `name` (text)
      - `state` (text)
      - `is_active` (boolean)
    - `rides`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `pickup_location` (jsonb)
      - `dropoff_location` (jsonb)
      - `scheduled_time` (timestamptz)
      - `estimated_fare` (decimal)
      - `status` (text)
      - `payment_status` (text)
      - `created_at` (timestamptz)
    - `payments`
      - `id` (uuid, primary key)
      - `ride_id` (uuid, references rides)
      - `amount` (decimal)
      - `status` (text)
      - `payment_method` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create cities table
CREATE TABLE cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create rides table
CREATE TABLE rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  pickup_location jsonb NOT NULL,
  dropoff_location jsonb NOT NULL,
  scheduled_time timestamptz NOT NULL,
  estimated_fare decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides NOT NULL,
  amount decimal(10,2) NOT NULL,
  status text NOT NULL,
  payment_method text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Cities policies
CREATE POLICY "Cities are viewable by all users"
  ON cities FOR SELECT
  TO authenticated
  USING (true);

-- Rides policies
CREATE POLICY "Users can view their own rides"
  ON rides FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rides"
  ON rides FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rides
      WHERE rides.id = payments.ride_id
      AND rides.user_id = auth.uid()
    )
  );

-- Insert some sample cities
INSERT INTO cities (name, state) VALUES
  ('Mumbai', 'Maharashtra'),
  ('Delhi', 'Delhi'),
  ('Bangalore', 'Karnataka'),
  ('Chennai', 'Tamil Nadu'),
  ('Hyderabad', 'Telangana'),
  ('Kolkata', 'West Bengal'),
  ('Pune', 'Maharashtra'),
  ('Ahmedabad', 'Gujarat');