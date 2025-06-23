/*
  # Fix RLS Policies for Residue Movements

  1. Changes
    - Drop existing policies
    - Create new policies with proper relationship checks
    - Add policies for pile_recipes table
    
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Add relationship checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own residue_movements" ON residue_movements;
DROP POLICY IF EXISTS "Users can insert own residue_movements" ON residue_movements;
DROP POLICY IF EXISTS "Users can update own residue_movements" ON residue_movements;
DROP POLICY IF EXISTS "Users can delete own residue_movements" ON residue_movements;

-- Create new policies with proper relationship checks
CREATE POLICY "Users can read own residue_movements"
ON residue_movements
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM residues 
    WHERE residues.id = residue_movements.residue_id 
    AND residues.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM piles 
    WHERE piles.id = residue_movements.pile_id 
    AND piles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own residue_movements"
ON residue_movements
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM residues 
    WHERE residues.id = residue_movements.residue_id 
    AND residues.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM piles 
    WHERE piles.id = residue_movements.pile_id 
    AND piles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own residue_movements"
ON residue_movements
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM residues 
    WHERE residues.id = residue_movements.residue_id 
    AND residues.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM piles 
    WHERE piles.id = residue_movements.pile_id 
    AND piles.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM residues 
    WHERE residues.id = residue_movements.residue_id 
    AND residues.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM piles 
    WHERE piles.id = residue_movements.pile_id 
    AND piles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own residue_movements"
ON residue_movements
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM residues 
    WHERE residues.id = residue_movements.residue_id 
    AND residues.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM piles 
    WHERE piles.id = residue_movements.pile_id 
    AND piles.user_id = auth.uid()
  )
);

-- Add policies for pile_recipes
DROP POLICY IF EXISTS "Users can read own pile_recipes" ON pile_recipes;
DROP POLICY IF EXISTS "Users can insert own pile_recipes" ON pile_recipes;
DROP POLICY IF EXISTS "Users can update own pile_recipes" ON pile_recipes;
DROP POLICY IF EXISTS "Users can delete own pile_recipes" ON pile_recipes;

CREATE POLICY "Users can read own pile_recipes"
ON pile_recipes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM piles 
    WHERE piles.id = pile_recipes.pile_id 
    AND piles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own pile_recipes"
ON pile_recipes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM piles 
    WHERE piles.id = pile_recipes.pile_id 
    AND piles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own pile_recipes"
ON pile_recipes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM piles 
    WHERE piles.id = pile_recipes.pile_id 
    AND piles.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM piles 
    WHERE piles.id = pile_recipes.pile_id 
    AND piles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own pile_recipes"
ON pile_recipes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM piles 
    WHERE piles.id = pile_recipes.pile_id 
    AND piles.user_id = auth.uid()
  )
);