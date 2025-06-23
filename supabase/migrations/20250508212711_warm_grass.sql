/*
  # Update RLS policies for residue_movements table

  1. Changes
    - Drop existing RLS policies for residue_movements table
    - Create new policies that properly check relationships:
      - SELECT: User can read movements related to their residues or piles
      - INSERT: User can insert movements for residues or piles they own
      - UPDATE: User can update movements related to their residues or piles
      - DELETE: User can delete movements related to their residues or piles
  
  2. Security
    - Ensures users can only access movements related to their residues or piles
    - Maintains data isolation between users
    - Preserves referential integrity
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
  auth.uid() = user_id OR
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
  auth.uid() = user_id AND
  (
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
);

CREATE POLICY "Users can update own residue_movements"
ON residue_movements
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id AND
  (
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
)
WITH CHECK (
  auth.uid() = user_id AND
  (
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
);

CREATE POLICY "Users can delete own residue_movements"
ON residue_movements
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id AND
  (
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
);