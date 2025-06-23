/*
  # Fix RLS policies for residue_movements table

  1. Changes
    - Drop existing policies if they exist
    - Recreate policies for CRUD operations
    
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Enable RLS
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can insert own residue_movements" ON residue_movements;
  DROP POLICY IF EXISTS "Users can read own residue_movements" ON residue_movements;
  DROP POLICY IF EXISTS "Users can update own residue_movements" ON residue_movements;
  DROP POLICY IF EXISTS "Users can delete own residue_movements" ON residue_movements;

  -- Enable RLS
  ALTER TABLE residue_movements ENABLE ROW LEVEL SECURITY;

  -- Create new policies
  CREATE POLICY "Users can insert own residue_movements"
  ON residue_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can read own residue_movements"
  ON residue_movements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

  CREATE POLICY "Users can update own residue_movements"
  ON residue_movements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete own residue_movements"
  ON residue_movements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
END $$;