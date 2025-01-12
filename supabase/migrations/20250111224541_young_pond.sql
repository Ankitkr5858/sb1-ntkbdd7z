/*
  # Add cities data with unique constraint

  1. Changes
    - Add unique constraint on name and state columns
    - Insert initial cities data
*/

-- First add a unique constraint
ALTER TABLE cities ADD CONSTRAINT cities_name_state_key UNIQUE (name, state);

-- Then insert the cities
INSERT INTO cities (name, state) VALUES
  ('Mumbai', 'Maharashtra'),
  ('Delhi', 'Delhi'),
  ('Bangalore', 'Karnataka'),
  ('Chennai', 'Tamil Nadu'),
  ('Hyderabad', 'Telangana'),
  ('Kolkata', 'West Bengal'),
  ('Pune', 'Maharashtra'),
  ('Ahmedabad', 'Gujarat'),
  ('Jaipur', 'Rajasthan'),
  ('Lucknow', 'Uttar Pradesh'),
  ('Surat', 'Gujarat'),
  ('Kanpur', 'Uttar Pradesh'),
  ('Nagpur', 'Maharashtra'),
  ('Indore', 'Madhya Pradesh'),
  ('Thane', 'Maharashtra')
ON CONFLICT (name, state) DO NOTHING;