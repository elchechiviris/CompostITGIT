/*
  # Initial Schema Setup for CompostIT

  1. New Tables
    - farms
      - id (uuid, primary key)
      - name (text)
      - acres (numeric)
      - location (text)
      - icon (text)
      - color (text)
      - created_at (timestamptz)
    
    - fields
      - id (uuid, primary key)
      - farm_id (uuid, foreign key)
      - name (text)
      - acres (numeric)
      - soil_type (text)
      - last_crop (text)
      - created_at (timestamptz)
    
    - plots
      - id (uuid, primary key)
      - field_id (uuid, foreign key)
      - name (text)
      - acres (numeric)
      - crop (text)
      - status (text)
      - planted_date (date)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create farms table
CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  acres numeric NOT NULL,
  location text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create fields table
CREATE TABLE IF NOT EXISTS fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) ON DELETE CASCADE,
  name text NOT NULL,
  acres numeric NOT NULL,
  soil_type text NOT NULL,
  last_crop text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create plots table
CREATE TABLE IF NOT EXISTS plots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid REFERENCES fields(id) ON DELETE CASCADE,
  name text NOT NULL,
  acres numeric NOT NULL,
  crop text NOT NULL,
  status text NOT NULL,
  planted_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;

-- Create policies for farms
CREATE POLICY "Users can read own farms"
  ON farms
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
  ));

CREATE POLICY "Users can insert own farms"
  ON farms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
  ));

CREATE POLICY "Users can update own farms"
  ON farms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
  ));

CREATE POLICY "Users can delete own farms"
  ON farms
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
  ));

-- Create policies for fields
CREATE POLICY "Users can read own fields"
  ON fields
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
  ));

CREATE POLICY "Users can insert own fields"
  ON fields
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
  ));

CREATE POLICY "Users can update own fields"
  ON fields
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
  ));

CREATE POLICY "Users can delete own fields"
  ON fields
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
  ));

-- Create policies for plots
CREATE POLICY "Users can read own plots"
  ON plots
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
  ));

CREATE POLICY "Users can insert own plots"
  ON plots
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
  ));

CREATE POLICY "Users can update own plots"
  ON plots
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
  ));

CREATE POLICY "Users can delete own plots"
  ON plots
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
  ));