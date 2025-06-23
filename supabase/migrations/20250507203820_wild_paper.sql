/*
  # Add Composting Management Tables

  1. New Tables
    - residues
      - id (uuid, primary key)
      - weight (numeric)
      - humidity (numeric)
      - ph (numeric)
      - volume (numeric)
      - supplier (text)
      - location (text)
      - description (text)
      - cn_ratio (numeric)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - piles
      - id (uuid, primary key)
      - name (text)
      - weight (numeric)
      - humidity (numeric)
      - ph (numeric)
      - volume (numeric)
      - location (text)
      - description (text)
      - cn_ratio (numeric)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - pile_recipes
      - id (uuid, primary key)
      - pile_id (uuid, foreign key)
      - residue_id (uuid, foreign key)
      - proportion (numeric)
      - created_at (timestamptz)
    
    - residue_movements
      - id (uuid, primary key)
      - residue_id (uuid, foreign key)
      - pile_id (uuid, foreign key)
      - amount (numeric)
      - type (text)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create residues table
CREATE TABLE IF NOT EXISTS residues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weight numeric NOT NULL,
  humidity numeric NOT NULL,
  ph numeric NOT NULL,
  volume numeric NOT NULL,
  supplier text NOT NULL,
  location text NOT NULL,
  description text,
  cn_ratio numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create piles table
CREATE TABLE IF NOT EXISTS piles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  weight numeric NOT NULL,
  humidity numeric NOT NULL,
  ph numeric NOT NULL,
  volume numeric NOT NULL,
  location text NOT NULL,
  description text,
  cn_ratio numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pile_recipes table
CREATE TABLE IF NOT EXISTS pile_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pile_id uuid REFERENCES piles(id) ON DELETE CASCADE,
  residue_id uuid REFERENCES residues(id) ON DELETE CASCADE,
  proportion numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create residue_movements table
CREATE TABLE IF NOT EXISTS residue_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  residue_id uuid REFERENCES residues(id) ON DELETE CASCADE,
  pile_id uuid REFERENCES piles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('volume', 'weight')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE residues ENABLE ROW LEVEL SECURITY;
ALTER TABLE piles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pile_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE residue_movements ENABLE ROW LEVEL SECURITY;

-- Create policies for residues
CREATE POLICY "Enable read access for authenticated users"
  ON residues
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON residues
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON residues
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON residues
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for piles
CREATE POLICY "Enable read access for authenticated users"
  ON piles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON piles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON piles
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON piles
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for pile_recipes
CREATE POLICY "Enable read access for authenticated users"
  ON pile_recipes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON pile_recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON pile_recipes
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON pile_recipes
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for residue_movements
CREATE POLICY "Enable read access for authenticated users"
  ON residue_movements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON residue_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON residue_movements
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON residue_movements
  FOR DELETE
  TO authenticated
  USING (true);