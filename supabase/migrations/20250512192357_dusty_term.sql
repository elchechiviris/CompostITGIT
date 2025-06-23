/*
  # Add Fertilizer Applications Management

  1. New Tables
    - fertilizer_applications
      - id (uuid, primary key)
      - field_id (uuid, foreign key)
      - type (text)
      - amount (numeric)
      - unit (text)
      - application_date (date)
      - notes (text)
      - created_at (timestamptz)
      - user_id (uuid)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create fertilizer_applications table
CREATE TABLE IF NOT EXISTS fertilizer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid REFERENCES fields(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount numeric NOT NULL,
  unit text NOT NULL,
  application_date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE fertilizer_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own fertilizer_applications"
ON fertilizer_applications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fertilizer_applications"
ON fertilizer_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fertilizer_applications"
ON fertilizer_applications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fertilizer_applications"
ON fertilizer_applications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);