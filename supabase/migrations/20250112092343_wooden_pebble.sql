/*
  # Add user verification system

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `full_name` (text)
      - `id_proof_path` (text)
      - `verification_status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policies for authenticated users
*/

-- Create user_profiles table
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  full_name text NOT NULL,
  id_proof_path text NOT NULL,
  verification_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add verification status check
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_verification_status_check 
CHECK (verification_status IN ('pending', 'verified', 'rejected'));

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for ID proofs
INSERT INTO storage.buckets (id, name)
VALUES ('id-proofs', 'id-proofs')
ON CONFLICT DO NOTHING;

-- Set up storage policies
CREATE POLICY "Users can upload their own ID proof"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'id-proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read their own ID proof"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'id-proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );