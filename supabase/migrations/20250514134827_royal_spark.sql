/*
  # Update Farms Structure and Add Related Tables

  1. Changes
    - Remove icon and color from farms
    - Create fields, plots, and fertilizer_applications tables
    - Set up relationships between tables
    - Add RLS policies
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Update farms table
ALTER TABLE farms DROP COLUMN IF EXISTS icon;
ALTER TABLE farms DROP COLUMN IF EXISTS color;

-- Create fields table if it doesn't exist
CREATE TABLE IF NOT EXISTS fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) ON DELETE CASCADE,
  name text NOT NULL,
  acres numeric NOT NULL,
  soil_type text NOT NULL,
  last_crop text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Create plots table if it doesn't exist
CREATE TABLE IF NOT EXISTS plots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid REFERENCES fields(id) ON DELETE CASCADE,
  name text NOT NULL,
  acres numeric NOT NULL,
  crop text NOT NULL,
  status text NOT NULL,
  planted_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Create fertilizer_applications table if it doesn't exist
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
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertilizer_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read own fields" ON fields;
  DROP POLICY IF EXISTS "Users can insert own fields" ON fields;
  DROP POLICY IF EXISTS "Users can update own fields" ON fields;
  DROP POLICY IF EXISTS "Users can delete own fields" ON fields;

  DROP POLICY IF EXISTS "Users can read own plots" ON plots;
  DROP POLICY IF EXISTS "Users can insert own plots" ON plots;
  DROP POLICY IF EXISTS "Users can update own plots" ON plots;
  DROP POLICY IF EXISTS "Users can delete own plots" ON plots;

  DROP POLICY IF EXISTS "Users can read own fertilizer_applications" ON fertilizer_applications;
  DROP POLICY IF EXISTS "Users can insert own fertilizer_applications" ON fertilizer_applications;
  DROP POLICY IF EXISTS "Users can update own fertilizer_applications" ON fertilizer_applications;
  DROP POLICY IF EXISTS "Users can delete own fertilizer_applications" ON fertilizer_applications;
END $$;

-- Create policies for fields
CREATE POLICY "Users can read own fields"
ON fields FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fields"
ON fields FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fields"
ON fields FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fields"
ON fields FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for plots
CREATE POLICY "Users can read own plots"
ON plots FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plots"
ON plots FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plots"
ON plots FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plots"
ON plots FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for fertilizer_applications
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