/*
  # Update pile_recipes table constraints and policies

  1. Changes
    - Add user_id constraint to pile_recipes
    - Update proportion constraint to use decimal values
    - Update RLS policies to use user_id

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Update pile_recipes constraints
ALTER TABLE pile_recipes
DROP CONSTRAINT IF EXISTS valid_proportion;

ALTER TABLE pile_recipes
ADD CONSTRAINT valid_proportion CHECK (proportion > 0 AND proportion <= 1);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own pile_recipes" ON pile_recipes;
DROP POLICY IF EXISTS "Users can insert own pile_recipes" ON pile_recipes;
DROP POLICY IF EXISTS "Users can update own pile_recipes" ON pile_recipes;
DROP POLICY IF EXISTS "Users can delete own pile_recipes" ON pile_recipes;

-- Create improved RLS policies
CREATE POLICY "Users can read own pile_recipes"
ON pile_recipes FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM piles
    WHERE piles.id = pile_recipes.pile_id
    AND piles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own pile_recipes"
ON pile_recipes FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM piles
    WHERE piles.id = pile_recipes.pile_id
    AND piles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own pile_recipes"
ON pile_recipes FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM piles
    WHERE piles.id = pile_recipes.pile_id
    AND piles.user_id = auth.uid()
  )
)
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM piles
    WHERE piles.id = pile_recipes.pile_id
    AND piles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own pile_recipes"
ON pile_recipes FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM piles
    WHERE piles.id = pile_recipes.pile_id
    AND piles.user_id = auth.uid()
  )
);