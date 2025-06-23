/*
  # Add Recipe Management Improvements

  1. Changes
    - Add unique constraint to pile_recipes to prevent duplicates
    - Add check constraint for proportion values
    - Update RLS policies for better security
    
  2. Security
    - Modify RLS policies to ensure users can only:
      - Read recipes for piles they own
      - Create recipes for their own piles
      - Update/delete their own recipes
*/

-- Add constraints to pile_recipes
ALTER TABLE pile_recipes
ADD CONSTRAINT unique_pile_residue UNIQUE (pile_id, residue_id),
ADD CONSTRAINT valid_proportion CHECK (proportion > 0 AND proportion <= 100);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own pile_recipes" ON pile_recipes;
DROP POLICY IF EXISTS "Users can insert own pile_recipes" ON pile_recipes;
DROP POLICY IF EXISTS "Users can update own pile_recipes" ON pile_recipes;
DROP POLICY IF EXISTS "Users can delete own pile_recipes" ON pile_recipes;

-- Create improved RLS policies
CREATE POLICY "Users can read own pile_recipes"
ON pile_recipes FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM piles
  WHERE piles.id = pile_recipes.pile_id
  AND piles.user_id = auth.uid()
));

CREATE POLICY "Users can insert own pile_recipes"
ON pile_recipes FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM piles
  WHERE piles.id = pile_recipes.pile_id
  AND piles.user_id = auth.uid()
));

CREATE POLICY "Users can update own pile_recipes"
ON pile_recipes FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM piles
  WHERE piles.id = pile_recipes.pile_id
  AND piles.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM piles
  WHERE piles.id = pile_recipes.pile_id
  AND piles.user_id = auth.uid()
));

CREATE POLICY "Users can delete own pile_recipes"
ON pile_recipes FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM piles
  WHERE piles.id = pile_recipes.pile_id
  AND piles.user_id = auth.uid()
));