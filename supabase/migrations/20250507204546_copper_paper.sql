/*
  # Add User Ownership to Tables

  1. Changes
    - Add user_id column to all tables
    - Set default user ID for existing rows
    - Make user_id required for future inserts
    - Update RLS policies to use user_id

  2. Security
    - Drop existing policies
    - Create new policies based on user_id
*/

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can read own farms" ON farms;
DROP POLICY IF EXISTS "Users can insert own farms" ON farms;
DROP POLICY IF EXISTS "Users can update own farms" ON farms;
DROP POLICY IF EXISTS "Users can delete own farms" ON farms;

DROP POLICY IF EXISTS "Users can read own fields" ON fields;
DROP POLICY IF EXISTS "Users can insert own fields" ON fields;
DROP POLICY IF EXISTS "Users can update own fields" ON fields;
DROP POLICY IF EXISTS "Users can delete own fields" ON fields;

DROP POLICY IF EXISTS "Users can read own plots" ON plots;
DROP POLICY IF EXISTS "Users can insert own plots" ON plots;
DROP POLICY IF EXISTS "Users can update own plots" ON plots;
DROP POLICY IF EXISTS "Users can delete own plots" ON plots;

DROP POLICY IF EXISTS "Users can read own piles" ON piles;
DROP POLICY IF EXISTS "Users can insert own piles" ON piles;
DROP POLICY IF EXISTS "Users can update own piles" ON piles;
DROP POLICY IF EXISTS "Users can delete own piles" ON piles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON piles;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON piles;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON piles;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON piles;

DROP POLICY IF EXISTS "Users can read own pile_recipes" ON pile_recipes;
DROP POLICY IF EXISTS "Users can insert own pile_recipes" ON pile_recipes;
DROP POLICY IF EXISTS "Users can update own pile_recipes" ON pile_recipes;
DROP POLICY IF EXISTS "Users can delete own pile_recipes" ON pile_recipes;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON pile_recipes;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON pile_recipes;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON pile_recipes;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON pile_recipes;

DROP POLICY IF EXISTS "Users can read own residue_movements" ON residue_movements;
DROP POLICY IF EXISTS "Users can insert own residue_movements" ON residue_movements;
DROP POLICY IF EXISTS "Users can update own residue_movements" ON residue_movements;
DROP POLICY IF EXISTS "Users can delete own residue_movements" ON residue_movements;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON residue_movements;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON residue_movements;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON residue_movements;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON residue_movements;

-- Add user_id column to all tables
ALTER TABLE farms 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE fields 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE plots 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE piles 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE pile_recipes 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE residue_movements 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Update existing rows to use the current user's ID
UPDATE farms 
SET user_id = auth.uid()
WHERE user_id IS NULL;

UPDATE fields 
SET user_id = auth.uid()
WHERE user_id IS NULL;

UPDATE plots 
SET user_id = auth.uid()
WHERE user_id IS NULL;

UPDATE piles 
SET user_id = auth.uid()
WHERE user_id IS NULL;

UPDATE pile_recipes 
SET user_id = auth.uid()
WHERE user_id IS NULL;

UPDATE residue_movements 
SET user_id = auth.uid()
WHERE user_id IS NULL;

-- Make user_id required for future inserts
ALTER TABLE farms
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE fields
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE plots
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE piles
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE pile_recipes
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE residue_movements
ALTER COLUMN user_id SET NOT NULL;

-- Create new RLS policies for farms
CREATE POLICY "Users can read own farms"
ON farms FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own farms"
ON farms FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own farms"
ON farms FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own farms"
ON farms FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create new RLS policies for fields
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

-- Create new RLS policies for plots
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

-- Create new RLS policies for piles
CREATE POLICY "Users can read own piles"
ON piles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own piles"
ON piles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own piles"
ON piles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own piles"
ON piles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create new RLS policies for pile_recipes
CREATE POLICY "Users can read own pile_recipes"
ON pile_recipes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pile_recipes"
ON pile_recipes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pile_recipes"
ON pile_recipes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pile_recipes"
ON pile_recipes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create new RLS policies for residue_movements
CREATE POLICY "Users can read own residue_movements"
ON residue_movements FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own residue_movements"
ON residue_movements FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own residue_movements"
ON residue_movements FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own residue_movements"
ON residue_movements FOR DELETE
TO authenticated
USING (auth.uid() = user_id);